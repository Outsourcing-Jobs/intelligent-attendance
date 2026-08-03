import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Semester, SemesterSchema } from './schemas/semester.schema';
import { AcademicYear, AcademicYearSchema } from '../academic-year/schemas/academic-year.schema';
import { CourseSection, CourseSectionSchema } from '../course-section/schemas/course-section.schema';
import { SemesterService } from './semester.service';
import { SemesterController } from './semester.controller';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Semester.name, schema: SemesterSchema },
      { name: AcademicYear.name, schema: AcademicYearSchema },
      { name: CourseSection.name, schema: CourseSectionSchema },
    ]),
    UserModule,
  ],
  controllers: [SemesterController],
  providers: [SemesterService],
  exports: [SemesterService],
})
export class SemesterModule {}
