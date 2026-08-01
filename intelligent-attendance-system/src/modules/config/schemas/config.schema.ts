import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConfigDocument = Config & Document;

@Schema({ timestamps: true, collection: 'configs' })
export class Config {
  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop({ enum: ['string', 'number', 'boolean', 'json'], default: 'string' })
  type: string;

  @Prop({ type: Object })
  value: any;

  @Prop({ enum: ['system', 'menu', 'general'], default: 'general' })
  group: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
