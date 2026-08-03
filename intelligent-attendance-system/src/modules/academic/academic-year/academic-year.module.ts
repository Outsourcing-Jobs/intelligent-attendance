import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AcademicYear, AcademicYearSchema } from './schemas/academic-year.schema';
import { Semester, SemesterSchema } from '../semester/schemas/semester.schema';
import { AcademicYearService } from './academic-year.service';
import { AcademicYearController } from './academic-year.controller';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AcademicYear.name, schema: AcademicYearSchema },
      { name: Semester.name, schema: SemesterSchema },
    ]),
    UserModule,
  ],
  controllers: [AcademicYearController],
  providers: [AcademicYearService],
  exports: [AcademicYearService],
})
export class AcademicYearModule {}
