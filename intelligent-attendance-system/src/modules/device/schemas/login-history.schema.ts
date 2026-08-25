import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoginHistoryDocument = LoginHistory & Document;

@Schema({ timestamps: true, collection: 'login_histories' })
export class LoginHistory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop()
  userEmail: string;

  @Prop()
  userFullName: string;

  @Prop()
  roleCode: string;

  @Prop()
  deviceId: string;

  @Prop()
  deviceName: string;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop({
    enum: ['success', 'pending_device', 'rejected_device', 'failed', 'logged_out'],
    required: true,
    index: true,
  })
  status: string;

  @Prop()
  message?: string;

  @Prop({ default: Date.now, index: true })
  loginAt: Date;

  @Prop()
  logoutAt?: Date;
}

export const LoginHistorySchema = SchemaFactory.createForClass(LoginHistory);
