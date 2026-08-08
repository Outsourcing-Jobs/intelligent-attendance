import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../modules/role/schemas/role.schema';
import { Config, ConfigSchema } from '../modules/config/schemas/config.schema';
import { Menu, MenuSchema } from '../modules/config/schemas/menu.schema';
import { User, UserSchema } from '../modules/user/schemas/user.schema';
import { AcademicYear, AcademicYearSchema } from '../modules/academic/academic-year/schemas/academic-year.schema';
import { Semester, SemesterSchema } from '../modules/academic/semester/schemas/semester.schema';
import { Subject, SubjectSchema } from '../modules/academic/subject/schemas/subject.schema';
import { StudentClass, StudentClassSchema } from '../modules/academic/class/schemas/class.schema';
import { ClassSubject, ClassSubjectSchema } from '../modules/academic/class/schemas/class-subject.schema';
import { CourseSection, CourseSectionSchema } from '../modules/academic/course-section/schemas/course-section.schema';
import { CourseSectionLecturer, CourseSectionLecturerSchema } from '../modules/academic/course-section/schemas/course-section-lecturer.schema';
import { Enrollment, EnrollmentSchema } from '../modules/academic/student/schemas/enrollment.schema';
import { PeriodConfig, PeriodConfigSchema } from '../modules/config/schemas/period-config.schema';
import { AttendanceConfig, AttendanceConfigSchema } from '../modules/attendance/schemas/attendance-config.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Config.name, schema: ConfigSchema },
      { name: Menu.name, schema: MenuSchema },
      { name: User.name, schema: UserSchema },
      { name: AcademicYear.name, schema: AcademicYearSchema },
      { name: Semester.name, schema: SemesterSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: StudentClass.name, schema: StudentClassSchema },
      { name: ClassSubject.name, schema: ClassSubjectSchema },
      { name: CourseSection.name, schema: CourseSectionSchema },
      { name: CourseSectionLecturer.name, schema: CourseSectionLecturerSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: PeriodConfig.name, schema: PeriodConfigSchema },
      { name: AttendanceConfig.name, schema: AttendanceConfigSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule { }
