import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassSession, ClassSessionSchema } from '../modules/academic/course-section/schemas/class-session.schema';
import { CourseSection, CourseSectionSchema } from '../modules/academic/course-section/schemas/course-section.schema';
import { Enrollment, EnrollmentSchema } from '../modules/academic/student/schemas/enrollment.schema';
import { PeriodConfig, PeriodConfigSchema } from '../modules/config/schemas/period-config.schema';
import { AttendanceConfig, AttendanceConfigSchema } from '../modules/attendance/schemas/attendance-config.schema';
import { Attendance, AttendanceSchema } from '../modules/attendance/schemas/attendance.schema';
import { LeaveRequest, LeaveRequestSchema } from '../modules/attendance/schemas/leave-request.schema';
import { LeaveRequestHistory, LeaveRequestHistorySchema } from '../modules/attendance/schemas/leave-request-history.schema';
import { DemoSeedService } from './demo-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassSession.name, schema: ClassSessionSchema },
      { name: CourseSection.name, schema: CourseSectionSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: PeriodConfig.name, schema: PeriodConfigSchema },
      { name: AttendanceConfig.name, schema: AttendanceConfigSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveRequestHistory.name, schema: LeaveRequestHistorySchema },
    ]),
  ],
  providers: [DemoSeedService],
  exports: [DemoSeedService],
})
export class DemoSeedModule {}
