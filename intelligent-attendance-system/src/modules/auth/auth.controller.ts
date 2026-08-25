import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserService } from '../user/user.service';
import { MenuService } from '../config/menu.service';
import { DeviceService } from '../device/device.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly menuService: MenuService,
    private readonly deviceService: DeviceService,
  ) {}

  @ApiOperation({
    summary: 'Đăng ký tài khoản bằng Email & Mật khẩu (Trực tiếp qua Backend)',
    description:
      'Backend tự tạo tài khoản trên Firebase Auth (tự động mã hóa mật khẩu), đồng bộ vào MongoDB với role "student" và sinh link xác minh email.',
  })
  @ApiCreatedResponse({ description: 'Đăng ký tài khoản thành công' })
  @ApiBadRequestResponse({ description: 'Email đã tồn tại hoặc dữ liệu không hợp lệ' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: 'Đăng nhập bằng Email & Mật khẩu (Trực tiếp qua Backend)',
    description:
      'Backend xác thực Email/Password với Firebase và trả về idToken, refreshToken, profile user và cây menu.',
  })
  @ApiOkResponse({ description: 'Đăng nhập thành công, trả về Token và profile' })
  @ApiUnauthorizedResponse({ description: 'Email hoặc mật khẩu không chính xác' })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @ApiOperation({
    summary: 'Quên mật khẩu - Sinh link khôi phục mật khẩu',
    description:
      'Backend dùng Firebase Admin SDK sinh link đặt lại mật khẩu an toàn và trả về cho FE/gửi mail.',
  })
  @ApiOkResponse({ description: 'Tạo link khôi phục mật khẩu thành công' })
  @ApiBadRequestResponse({ description: 'Email không tồn tại trong hệ thống' })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiOperation({
    summary: 'Đặt lại mật khẩu mới (Reset Password)',
    description:
      'FE nhận oobCode từ URL email, cho người dùng nhập mật khẩu mới trên giao diện đẹp của FE rồi gọi API này để đổi mật khẩu.',
  })
  @ApiOkResponse({ description: 'Đặt lại mật khẩu thành công' })
  @ApiBadRequestResponse({ description: 'Mã oobCode không hợp lệ hoặc hết hạn' })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({
    summary: 'Đồng bộ user sau khi login Firebase SDK',
    description:
      'FE truyền Firebase ID Token vào Header Authorization. Backend kiểm tra/tạo mới user trong Mongo và trả về profile + role + permissions + cây menu cho FE.',
  })
  @ApiOkResponse({
    description: 'Đồng bộ thông tin người dùng và cây menu thành công',
  })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ hoặc bị từ chối' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard)
  @Post('sync')
  async sync(@CurrentUser() user: any) {
    const menus = await this.menuService.getMenuForUser(user.permissions || []);
    return { user, menus };
  }

  @ApiOperation({
    summary: 'Lấy thông tin người dùng hiện tại (Phiên đăng nhập)',
    description: 'Dùng khi reload trang (F5) để kiểm tra phiên đăng nhập và lấy lại thông tin user hiện tại.',
  })
  @ApiOkResponse({ description: 'Lấy thông tin user hiện tại thành công' })
  @ApiUnauthorizedResponse({ description: 'Token hết hạn hoặc không hợp lệ' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return user;
  }

  @ApiOperation({
    summary: 'Đăng xuất & Thu hồi Refresh Token',
    description: 'Gọi Firebase Admin SDK để thu hồi toàn bộ Token cũ của người dùng và ghi nhận nhật ký đăng xuất.',
  })
  @ApiOkResponse({ description: 'Đăng xuất và thu hồi Token thành công' })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ' })
  @ApiBearerAuth('firebase-token')
  @UseGuards(FirebaseAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: any, @Body('deviceId') deviceId?: string) {
    await this.userService.revokeUserToken(user.firebaseUid);
    await this.deviceService.recordLogoutHistory(user._id || user.id, deviceId);
    return { message: 'Đăng xuất thành công' };
  }
}
