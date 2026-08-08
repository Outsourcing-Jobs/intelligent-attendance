import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import { AttendanceConfig, AttendanceConfigSchema } from './schemas/attendance-config.schema';
import { LeaveRequest, LeaveRequestSchema } from './schemas/leave-request.schema';
import { LeaveRequestHistory, LeaveRequestHistorySchema } from './schemas/leave-request-history.schema';
import { ClassSession, ClassSessionSchema } from '../academic/course-section/schemas/class-session.schema';
import { Enrollment, EnrollmentSchema } from '../academic/student/schemas/enrollment.schema';
import { PeriodConfig, PeriodConfigSchema } from '../config/schemas/period-config.schema';
import { CourseSection, CourseSectionSchema } from '../academic/course-section/schemas/course-section.schema';
import { Subject, SubjectSchema } from '../academic/subject/schemas/subject.schema';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: AttendanceConfig.name, schema: AttendanceConfigSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveRequestHistory.name, schema: LeaveRequestHistorySchema },
      { name: ClassSession.name, schema: ClassSessionSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: PeriodConfig.name, schema: PeriodConfigSchema },
      { name: CourseSection.name, schema: CourseSectionSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
    UserModule,
    NotificationModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}


