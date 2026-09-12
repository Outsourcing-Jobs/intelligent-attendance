import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from '../../attendance/schemas/attendance.schema';
import { CourseSection, CourseSectionSchema } from '../course-section/schemas/course-section.schema';
import { User, UserSchema } from '../../user/schemas/user.schema';
import { Enrollment, EnrollmentSchema } from '../student/schemas/enrollment.schema';
import { WarningController } from './warning.controller';
import { WarningService } from './warning.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: CourseSection.name, schema: CourseSectionSchema },
      { name: User.name, schema: UserSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  controllers: [WarningController],
  providers: [WarningService],
  exports: [WarningService],
})
export class WarningModule {}
