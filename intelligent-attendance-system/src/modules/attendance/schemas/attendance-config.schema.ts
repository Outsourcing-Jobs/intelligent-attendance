import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttendanceConfigDocument = AttendanceConfig & Document;

@Schema({ timestamps: true, collection: 'attendance_configs' })
export class AttendanceConfig {
  @Prop({ required: true, default: 10, min: 0 })
  gracePeriodMinutes: number;

  @Prop({ required: true, default: 30, min: 0 })
  lateThresholdMinutes: number;

  @Prop({ default: true })
  allowSelfCheckIn: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const AttendanceConfigSchema = SchemaFactory.createForClass(AttendanceConfig);
