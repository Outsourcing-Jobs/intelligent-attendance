import { Module } from '@nestjs/common';
import { AcademicYearModule } from './academic-year/academic-year.module';
import { SemesterModule } from './semester/semester.module';
import { SubjectModule } from './subject/subject.module';
import { ClassModule } from './class/class.module';
import { CourseSectionModule } from './course-section/course-section.module';
import { StudentModule } from './student/student.module';
import { WarningModule } from './warning/warning.module';

@Module({
  imports: [
    AcademicYearModule,
    SemesterModule,
    SubjectModule,
    ClassModule,
    CourseSectionModule,
    StudentModule,
    WarningModule,
  ],
  exports: [WarningModule],
})
export class AcademicModule {}
