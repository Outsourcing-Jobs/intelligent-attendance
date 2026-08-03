import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AcademicYearDocument = AcademicYear & Document;

@Schema({ timestamps: true, collection: 'academic_years' })
export class AcademicYear {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'inactive' })
  status: string;
}

export const AcademicYearSchema = SchemaFactory.createForClass(AcademicYear);
