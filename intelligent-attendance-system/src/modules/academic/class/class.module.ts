import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentClass, StudentClassSchema } from './schemas/class.schema';
import { ClassSubject, ClassSubjectSchema } from './schemas/class-subject.schema';
import { Subject, SubjectSchema } from '../subject/schemas/subject.schema';
import { User, UserSchema } from '../../user/schemas/user.schema';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentClass.name, schema: StudentClassSchema },
      { name: ClassSubject.name, schema: ClassSubjectSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
