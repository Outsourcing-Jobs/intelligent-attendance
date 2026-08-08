import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from '../../config/firebase/firebase-admin.provider';
import { UserService } from '../user/user.service';
import { MenuService } from '../config/menu.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { DeviceService } from '../device/device.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseAdmin: typeof admin,
    private readonly userService: UserService,
    private readonly menuService: MenuService,
    private readonly deviceService: DeviceService,
  ) {}

  /**
   * Đăng ký tài khoản mới qua Backend (dùng Firebase Admin SDK + Mongo Sync)
   */
  async register(registerDto: RegisterDto) {
    const { email, password, fullName, phone } = registerDto;

    try {
      // 1. Tạo user trên Firebase Auth (Firebase tự mã hóa mật khẩu)
      const firebaseUser = await this.firebaseAdmin.auth().createUser({
        email,
        password,
        displayName: fullName,
      });

      // 2. Đồng bộ thông tin user sang MongoDB với role mặc định là 'student'
      const user = await this.userService.syncUserFromFirebase({
        uid: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: fullName,
        phone,
        picture: firebaseUser.photoURL,
      });

      // 3. Sinh Email Verification Link từ Firebase Admin SDK
      let verificationLink: string | null = null;
      try {
        verificationLink = await this.firebaseAdmin
          .auth()
          .generateEmailVerificationLink(email);
      } catch (err) {
        this.logger.warn(`Could not generate email verification link: ${err.message}`);
      }

      return {
        message: 'Đăng ký tài khoản thành công',
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.roleCode,
          status: user.status,
        },
        verificationLink,
      };
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        throw new BadRequestException('Email đã tồn tại trên hệ thống Firebase');
      }
      if (error.code === 'auth/invalid-password') {
        throw new BadRequestException('Mật khẩu không hợp lệ (tối thiểu 6 ký tự)');
      }
      throw new BadRequestException(error.message || 'Đăng ký tài khoản thất bại');
    }
  }

  /**
   * Đăng nhập bằng Email/Password phía Backend
   */
  async login(loginDto: LoginDto, ipAddress?: string, userAgentHeader?: string) {
    const { email, password, deviceId, deviceName, deviceType, os, browser } = loginDto;
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    const clientIp = ipAddress || '0.0.0.0';
    const clientUserAgent = userAgentHeader || '';

    if (!deviceId || !deviceId.trim()) {
      throw new BadRequestException('Vui lòng cung cấp mã định danh thiết bị (deviceId)');
    }

    if (apiKey && apiKey !== 'your-firebase-web-api-key') {
      try {
        // 1. Gọi REST API của Firebase Identity Toolkit để xác thực email & password
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              returnSecureToken: true,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data?.error?.message;
          if (errorMsg === 'EMAIL_NOT_FOUND' || errorMsg === 'INVALID_PASSWORD' || errorMsg === 'INVALID_LOGIN_CREDENTIALS') {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
          }
          if (errorMsg === 'USER_DISABLED') {
            throw new UnauthorizedException('Tài khoản đã bị khóa');
          }
          throw new UnauthorizedException(errorMsg || 'Xác thực không thành công');
        }

        // 2. Lấy Firebase idToken trả về và verify để lấy thông tin MongoDB User
        const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(data.idToken);
        const user = await this.userService.syncUserFromFirebase(decodedToken);

        if (user.status === 'banned') {
          throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
        }

        // 3. Kiểm tra & Ràng buộc thiết bị đối với Sinh viên
        const roleCode =
          user.roleCode ||
          (user as any).role?.code ||
          (typeof (user as any).role === 'string' ? (user as any).role : 'student');

        const deviceValidation = await this.deviceService.validateAndRegisterDevice(
          user._id,
          roleCode,
          {
            deviceId,
            deviceName,
            deviceType,
            os,
            browser,
            userAgent: clientUserAgent,
            ipAddress: clientIp,
          },
        );

        if (!deviceValidation.allowed) {
          await this.deviceService.recordLoginHistory({
            userId: user._id,
            userEmail: user.email,
            userFullName: user.fullName,
            roleCode,
            deviceId,
            deviceName,
            ipAddress: clientIp,
            userAgent: clientUserAgent,
            status: 'pending_device',
            message: deviceValidation.message,
          });
          throw new UnauthorizedException(deviceValidation.message);
        }

        await this.deviceService.recordLoginHistory({
          userId: user._id,
          userEmail: user.email,
          userFullName: user.fullName,
          roleCode,
          deviceId,
          deviceName,
          ipAddress: clientIp,
          userAgent: clientUserAgent,
          status: 'success',
          message: 'Đăng nhập thành công',
        });

        const menus = await this.menuService.getMenuForUser(user.role?.permissions || []);

        return {
          idToken: data.idToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          user,
          menus,
          device: deviceValidation.device,
        };
      } catch (error: any) {
        if (error instanceof UnauthorizedException || error instanceof BadRequestException) throw error;
        throw new UnauthorizedException(error.message || 'Đăng nhập thất bại');
      }
    } else {
      // Chế độ Custom Token fallback khi chưa điền FIREBASE_WEB_API_KEY
      try {
        const firebaseUser = await this.firebaseAdmin.auth().getUserByEmail(email);
        const user = await this.userService.syncUserFromFirebase({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          picture: firebaseUser.photoURL,
        });

        if (user.status === 'banned') {
          throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
        }

        const roleCode =
          user.roleCode ||
          (user as any).role?.code ||
          (typeof (user as any).role === 'string' ? (user as any).role : 'student');

        const deviceValidation = await this.deviceService.validateAndRegisterDevice(
          user._id,
          roleCode,
          {
            deviceId,
            deviceName,
            deviceType,
            os,
            browser,
            userAgent: clientUserAgent,
            ipAddress: clientIp,
          },
        );

        if (!deviceValidation.allowed) {
          await this.deviceService.recordLoginHistory({
            userId: user._id,
            userEmail: user.email,
            userFullName: user.fullName,
            roleCode,
            deviceId,
            deviceName,
            ipAddress: clientIp,
            userAgent: clientUserAgent,
            status: 'pending_device',
            message: deviceValidation.message,
          });
          throw new UnauthorizedException(deviceValidation.message);
        }

        await this.deviceService.recordLoginHistory({
          userId: user._id,
          userEmail: user.email,
          userFullName: user.fullName,
          roleCode,
          deviceId,
          deviceName,
          ipAddress: clientIp,
          userAgent: clientUserAgent,
          status: 'success',
          message: 'Đăng nhập thành công',
        });

        const customToken = await this.firebaseAdmin.auth().createCustomToken(firebaseUser.uid);
        const menus = await this.menuService.getMenuForUser(user.role?.permissions || []);

        return {
          message:
            'FIREBASE_WEB_API_KEY chưa được điền trong file .env. Hệ thống đã khởi tạo customToken cho bạn.',
          customToken,
          user,
          menus,
          device: deviceValidation.device,
        };
      } catch (err: any) {
        if (err instanceof UnauthorizedException) throw err;
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
      }
    }
  }

  /**
   * Quên mật khẩu - Tự động gửi Email qua Firebase Identity Toolkit
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto, continueUrl?: string) {
    const { email } = forgotPasswordDto;
    const apiKey = process.env.FIREBASE_WEB_API_KEY;

    try {
      // 1. Kiểm tra user có tồn tại trên Firebase hay không
      await this.firebaseAdmin.auth().getUserByEmail(email);

      // 2. Nếu có FIREBASE_WEB_API_KEY, gọi Firebase REST API để Google tự động gửi Email khôi phục
      if (apiKey && apiKey !== 'your-firebase-web-api-key') {
        const targetUrl = continueUrl || process.env.FRONTEND_RESET_PASSWORD_URL || 'http://localhost:4000/auth/reset-password';
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requestType: 'PASSWORD_RESET',
              email,
              continueUrl: targetUrl,
            }),
          },
        );

        const data = await response.json();
        if (!response.ok) {
          const errorMsg = data?.error?.message;
          if (errorMsg === 'EMAIL_NOT_FOUND') {
            throw new NotFoundException('Không tìm thấy tài khoản với email này');
          }
          throw new BadRequestException(errorMsg || 'Gửi email khôi phục mật khẩu thất bại');
        }

        return {
          message: 'Google đã gửi email hướng dẫn đặt lại mật khẩu đến hòm thư của bạn',
          email,
        };
      }

      // 3. Fallback: Sinh resetLink từ Admin SDK
      const redirectUrl = continueUrl || process.env.FRONTEND_RESET_PASSWORD_URL;
      const actionCodeSettings = redirectUrl ? { url: redirectUrl } : undefined;

      const resetLink = await this.firebaseAdmin
        .auth()
        .generatePasswordResetLink(email, actionCodeSettings);

      return {
        message: 'Đã tạo link khôi phục mật khẩu thành công',
        email,
        resetLink,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'auth/user-not-found') {
        throw new NotFoundException('Không tìm thấy tài khoản với email này');
      }
      throw new BadRequestException(error.message || 'Không thể tạo link khôi phục mật khẩu');
    }
  }

  /**
   * Đặt lại mật khẩu mới dùng mã oobCode từ email
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { oobCode, newPassword } = resetPasswordDto;
    const apiKey = process.env.FIREBASE_WEB_API_KEY;

    if (!apiKey || apiKey === 'your-firebase-web-api-key') {
      throw new BadRequestException(
        'Vui lòng cấu hình FIREBASE_WEB_API_KEY trong file .env để đổi mật khẩu bằng oobCode',
      );
    }

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oobCode,
            newPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message;
        if (errorMsg === 'EXPIRED_OOB_CODE') {
          throw new BadRequestException('Mã khôi phục (oobCode) đã hết hạn. Vui lòng gửi lại yêu cầu quên mật khẩu');
        }
        if (errorMsg === 'INVALID_OOB_CODE') {
          throw new BadRequestException('Mã khôi phục (oobCode) không hợp lệ hoặc đã được sử dụng');
        }
        if (errorMsg === 'WEAK_PASSWORD') {
          throw new BadRequestException('Mật khẩu mới quá yếu');
        }
        throw new BadRequestException(errorMsg || 'Đổi mật khẩu thất bại');
      }

      // Đổi mật khẩu thành công, thu hồi toàn bộ token cũ
      try {
        const firebaseUser = await this.firebaseAdmin.auth().getUserByEmail(data.email);
        await this.firebaseAdmin.auth().revokeRefreshTokens(firebaseUser.uid);
      } catch (err) {
        // Ignored
      }

      return {
        message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới',
        email: data.email,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(error.message || 'Đổi mật khẩu thất bại');
    }
  }
}
