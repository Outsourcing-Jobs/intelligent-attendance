import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceConfigDocument = AttendanceConfig & Document;

@Schema({ timestamps: true, collection: 'attendance_configs' })
export class AttendanceConfig {
  @Prop({ required: true, default: 5, min: 0 })
  gracePeriodMinutes: number;


  @Prop({ required: true, default: 30, min: 0 })
  lateThresholdMinutes: number;

  @Prop({ default: true })
  allowSelfCheckIn: boolean;

  @Prop({ type: [String], default: ['127.0.0.1', '::1', '::ffff:127.0.0.1'] })
  allowedPublicIps: string[];

  @Prop({ type: Number, default: 21.028511 })
  latitude: number;

  @Prop({ type: Number, default: 105.804817 })
  longitude: number;

  @Prop({ type: Number, default: 20, min: 1 })
  allowedRadiusMeters: number;

  @Prop({ type: Boolean, default: true })
  requireWifiCheck: boolean;

  @Prop({ type: Boolean, default: true })
  requireLocationCheck: boolean;

  @Prop({ type: Number, default: 10, min: 0, max: 100 })
  initialScore: number;

  @Prop({ type: Number, default: 2.0, min: 0 })
  absentPenalty: number;

  @Prop({ type: Number, default: 0.5, min: 0 })
  latePenalty: number;

  @Prop({ type: Number, default: 0.5, min: 0 })
  earlyLeavePenalty: number;

  @Prop({ type: Number, default: 0.0, min: 0 })
  excusedPenalty: number;

  @Prop({ type: Number, default: 20, min: 0, max: 100 })
  examBanThreshold: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const AttendanceConfigSchema = SchemaFactory.createForClass(AttendanceConfig);

