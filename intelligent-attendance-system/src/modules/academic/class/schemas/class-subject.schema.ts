import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassSubjectDocument = ClassSubject & Document;

@Schema({ timestamps: true, collection: 'class_subjects' })
export class ClassSubject {
  @Prop({ type: Types.ObjectId, ref: 'StudentClass', required: true })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;
}

export const ClassSubjectSchema = SchemaFactory.createForClass(ClassSubject);

ClassSubjectSchema.index({ classId: 1, subjectId: 1 }, { unique: true });
