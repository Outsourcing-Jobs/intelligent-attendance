import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true, collection: 'enrollments' })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourseSection', required: true })
  courseSectionId: Types.ObjectId;

  @Prop({ default: () => new Date() })
  enrollmentDate: Date;

  @Prop({ required: true, enum: ['enrolled', 'cancelled', 'completed'], default: 'enrolled' })
  status: string;

  @Prop({ type: Number, default: null })
  midtermScore: number | null;

  @Prop({ type: Number, default: null })
  finalScore: number | null;

  @Prop({ type: Number, default: null })
  totalScore: number | null;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

EnrollmentSchema.index({ studentId: 1, courseSectionId: 1 }, { unique: true });
