import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { FirebaseModule } from './config/firebase/firebase.module';
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { ConfigModule } from './modules/config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { MediaModule } from './modules/media/media.module';
import { SeedModule } from './seed/seed.module';
import { DemoSeedModule } from './seed/demo-seed.module';
import { AcademicModule } from './modules/academic/academic.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DeviceModule } from './modules/device/device.module';
import { Seed24hModule } from './seed/seed-24h.module';
import { Seed14DaysModule } from './seed/seed-14days.module';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/base_auth_db',
      }),
    }),
    FirebaseModule,
    CloudinaryModule,
    AuthModule,
    UserModule,
    RoleModule,
    ConfigModule,
    MediaModule,
    SeedModule,
    DemoSeedModule,
    Seed24hModule,
    Seed14DaysModule,
    AcademicModule,
    AttendanceModule,
    DeviceModule,
  ],
})

export class AppModule {}


