import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassDocument = StudentClass & Document;

@Schema({ timestamps: true, collection: 'classes' })
export class StudentClass {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  cohortYear: number;

  @Prop({ type: Types.ObjectId, default: null })
  majorId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  homeroomLecturerId: Types.ObjectId | null;
}

export const StudentClassSchema = SchemaFactory.createForClass(StudentClass);
