import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDevice, UserDeviceSchema } from './schemas/user-device.schema';
import { LoginHistory, LoginHistorySchema } from './schemas/login-history.schema';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDevice.name, schema: UserDeviceSchema },
      { name: LoginHistory.name, schema: LoginHistorySchema },
    ]),
    UserModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
