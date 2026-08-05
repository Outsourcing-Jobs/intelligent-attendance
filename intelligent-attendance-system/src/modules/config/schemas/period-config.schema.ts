import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PeriodConfigDocument = PeriodConfig & Document;

@Schema({ timestamps: true, collection: 'period_configs' })
export class PeriodConfig {
  @Prop({ required: true, unique: true, min: 1, max: 15 })
  periodNumber: number;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PeriodConfigSchema = SchemaFactory.createForClass(PeriodConfig);
