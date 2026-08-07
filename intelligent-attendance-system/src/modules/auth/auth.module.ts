import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '../config/config.module';
import { DeviceModule } from '../device/device.module';

@Module({
  imports: [UserModule, ConfigModule, DeviceModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
