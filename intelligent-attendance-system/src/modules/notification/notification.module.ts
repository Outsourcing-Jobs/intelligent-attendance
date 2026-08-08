import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseModule } from '../../config/firebase/firebase.module';
import { UserModule } from '../user/user.module';

import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from './schemas/notification-template.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { PeriodConfig, PeriodConfigSchema } from '../config/schemas/period-config.schema';
import { ClassSession, ClassSessionSchema } from '../academic/course-section/schemas/class-session.schema';
import { Enrollment, EnrollmentSchema } from '../academic/student/schemas/enrollment.schema';
import { CourseSection, CourseSectionSchema } from '../academic/course-section/schemas/course-section.schema';
import { Subject, SubjectSchema } from '../academic/subject/schemas/subject.schema';

import { FirebaseNotificationStrategy } from './strategies/firebase-notification.strategy';
import { SocketNotificationStrategy } from './strategies/socket-notification.strategy';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

/**
 * NotificationModule
 *
 * Đăng ký đầy đủ:
 *   - Mongoose schemas (NotificationTemplate, Notification)
 *   - Strategy providers (Firebase + Socket)
 *   - Gateway (Socket.IO – wire server vào SocketStrategy)
 *   - Service (điều phối strategy)
 *   - Controller (REST API)
 *
 * Export NotificationService để các module khác dùng dễ dàng:
 *   @example
 *   // Trong AttendanceService:
 *   constructor(private notificationService: NotificationService) {}
 *
 *   await this.notificationService.send({
 *     recipientIds: [studentId],
 *     templateCode: 'attendance.checkin',
 *     variables: { studentName: 'An', time: '07:30' },
 *     eventType: 'attendance.checkin',
 *   });
 */
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: PeriodConfig.name, schema: PeriodConfigSchema },
      { name: ClassSession.name, schema: ClassSessionSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: CourseSection.name, schema: CourseSectionSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: User.name, schema: UserSchema },
    ]),
    FirebaseModule,
    UserModule,
  ],
  providers: [
    FirebaseNotificationStrategy,
    SocketNotificationStrategy,
    NotificationGateway,
    NotificationService,
  ],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
