import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subject, SubjectSchema } from './schemas/subject.schema';
import { ClassSubject, ClassSubjectSchema } from '../class/schemas/class-subject.schema';
import { CourseSection, CourseSectionSchema } from '../course-section/schemas/course-section.schema';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: ClassSubject.name, schema: ClassSubjectSchema },
      { name: CourseSection.name, schema: CourseSectionSchema },
    ]),
    UserModule,
  ],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
