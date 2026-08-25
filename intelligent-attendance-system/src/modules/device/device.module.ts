import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDevice, UserDeviceSchema } from './schemas/user-device.schema';
import { LoginHistory, LoginHistorySchema } from './schemas/login-history.schema';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { StudentClass, StudentClassSchema } from '../academic/class/schemas/class.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDevice.name, schema: UserDeviceSchema },
      { name: LoginHistory.name, schema: LoginHistorySchema },
      { name: StudentClass.name, schema: StudentClassSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
    NotificationModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
