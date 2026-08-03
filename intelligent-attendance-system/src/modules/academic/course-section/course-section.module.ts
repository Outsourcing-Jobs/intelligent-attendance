import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSection, CourseSectionSchema } from './schemas/course-section.schema';
import { CourseSectionLecturer, CourseSectionLecturerSchema } from './schemas/course-section-lecturer.schema';
import { Subject, SubjectSchema } from '../subject/schemas/subject.schema';
import { Semester, SemesterSchema } from '../semester/schemas/semester.schema';
import { Enrollment, EnrollmentSchema } from '../student/schemas/enrollment.schema';
import { CourseSectionService } from './course-section.service';
import { CourseSectionController } from './course-section.controller';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseSection.name, schema: CourseSectionSchema },
      { name: CourseSectionLecturer.name, schema: CourseSectionLecturerSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Semester.name, schema: SemesterSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    UserModule,
  ],
  controllers: [CourseSectionController],
  providers: [CourseSectionService],
  exports: [CourseSectionService],
})
export class CourseSectionModule {}
