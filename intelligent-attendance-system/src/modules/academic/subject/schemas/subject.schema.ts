import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubjectDocument = Subject & Document;

@Schema({ timestamps: true, collection: 'subjects' })
export class Subject {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 1 })
  credits: number;

  @Prop({ type: Types.ObjectId, ref: 'Subject', default: null })
  prerequisiteSubjectId: Types.ObjectId | null;

  @Prop()
  description: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
