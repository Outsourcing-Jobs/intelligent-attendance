import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../modules/user/schemas/user.schema';
import { CourseSection, CourseSectionSchema } from '../modules/academic/course-section/schemas/course-section.schema';
import { ClassSession, ClassSessionSchema } from '../modules/academic/course-section/schemas/class-session.schema';
import { Enrollment, EnrollmentSchema } from '../modules/academic/student/schemas/enrollment.schema';
import { PeriodConfig, PeriodConfigSchema } from '../modules/config/schemas/period-config.schema';
import { AttendanceConfig, AttendanceConfigSchema } from '../modules/attendance/schemas/attendance-config.schema';
import { Subject, SubjectSchema } from '../modules/academic/subject/schemas/subject.schema';
import { Semester, SemesterSchema } from '../modules/academic/semester/schemas/semester.schema';
import { Attendance, AttendanceSchema } from '../modules/attendance/schemas/attendance.schema';
import { Seed24hService } from './seed-24h.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CourseSection.name, schema: CourseSectionSchema },
      { name: ClassSession.name, schema: ClassSessionSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: PeriodConfig.name, schema: PeriodConfigSchema },
      { name: AttendanceConfig.name, schema: AttendanceConfigSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Semester.name, schema: SemesterSchema },
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
  ],
  providers: [Seed24hService],
  exports: [Seed24hService],
})
export class Seed24hModule {}

