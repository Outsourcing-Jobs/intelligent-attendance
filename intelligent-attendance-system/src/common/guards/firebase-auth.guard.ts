import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from '../../config/firebase/firebase-admin.provider';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseAdmin: typeof admin,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu token xác thực');
    }

    const idToken = authHeader.split(' ')[1];

    try {
      const decoded = await this.firebaseAdmin.auth().verifyIdToken(idToken, true);

      const user = await this.userService.findOrCreateByFirebase({
        firebaseUid: decoded.uid,
        email: decoded.email || '',
        isEmailVerified: decoded.email_verified || false,
      });

      if (user.status === 'banned') {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }

      request.user = user;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
