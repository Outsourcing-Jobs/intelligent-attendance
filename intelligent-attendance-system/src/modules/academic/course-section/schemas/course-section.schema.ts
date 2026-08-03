import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseSectionDocument = CourseSection & Document;

@Schema({ timestamps: true, collection: 'course_sections' })
export class CourseSection {
  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Semester', required: true })
  semesterId: Types.ObjectId;

  @Prop({ required: true })
  sectionCode: string;

  @Prop({ required: true, min: 1 })
  maxSize: number;

  @Prop({ default: 0, min: 0 })
  currentSize: number;

  @Prop()
  room: string;

  @Prop()
  schedule: string;

  @Prop({ required: true, enum: ['open', 'closed', 'cancelled'], default: 'open' })
  status: string;
}

export const CourseSectionSchema = SchemaFactory.createForClass(CourseSection);

CourseSectionSchema.index({ subjectId: 1, semesterId: 1 });
