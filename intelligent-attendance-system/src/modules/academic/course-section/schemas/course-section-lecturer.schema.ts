import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseSectionLecturerDocument = CourseSectionLecturer & Document;

@Schema({ timestamps: true, collection: 'course_section_lecturers' })
export class CourseSectionLecturer {
  @Prop({ type: Types.ObjectId, ref: 'CourseSection', required: true })
  courseSectionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  lecturerId: Types.ObjectId;

  @Prop({ required: true, enum: ['main', 'assistant'], default: 'main' })
  role: string;
}

export const CourseSectionLecturerSchema = SchemaFactory.createForClass(CourseSectionLecturer);

CourseSectionLecturerSchema.index({ courseSectionId: 1, lecturerId: 1 }, { unique: true });
