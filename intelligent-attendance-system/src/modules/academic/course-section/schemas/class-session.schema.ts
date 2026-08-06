import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassSessionDocument = ClassSession & Document;

@Schema({ timestamps: true, collection: 'class_sessions' })
export class ClassSession {
  @Prop({ type: Types.ObjectId, ref: 'CourseSection', required: true, index: true })
  courseSectionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  lecturerId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, min: 1, max: 15 })
  startPeriod: number;

  @Prop({ required: true, min: 1, max: 10 })
  numPeriods: number;

  @Prop({ required: true })
  room: string;

  @Prop({ required: true, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' })
  status: string;

  @Prop({ type: [String], default: null })
  allowedPublicIps?: string[] | null;

  @Prop({ type: Number, default: null })
  latitude?: number | null;

  @Prop({ type: Number, default: null })
  longitude?: number | null;

  @Prop({ type: Number, default: null })
  allowedRadiusMeters?: number | null;

  @Prop({ type: Boolean, default: null })
  requireWifiCheck?: boolean | null;

  @Prop({ type: Boolean, default: null })
  requireLocationCheck?: boolean | null;
}


export const ClassSessionSchema = SchemaFactory.createForClass(ClassSession);

ClassSessionSchema.index({ courseSectionId: 1, date: 1 });
