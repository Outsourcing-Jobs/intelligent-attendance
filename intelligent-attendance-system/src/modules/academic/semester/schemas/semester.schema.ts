import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SemesterDocument = Semester & Document;

@Schema({ timestamps: true, collection: 'semesters' })
export class Semester {
  @Prop({ type: Types.ObjectId, ref: 'AcademicYear', required: true, index: true })
  academicYearId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, enum: ['upcoming', 'active', 'closed'], default: 'upcoming' })
  status: string;
}

export const SemesterSchema = SchemaFactory.createForClass(Semester);
