import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDeviceDocument = UserDevice & Document;

@Schema({ timestamps: true, collection: 'user_devices' })
export class UserDevice {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ default: 'Trình duyệt Web' })
  deviceName: string;

  @Prop({ default: 'web' })
  deviceType: string;

  @Prop()
  os?: string;

  @Prop()
  browser?: string;

  @Prop()
  userAgent?: string;

  @Prop({
    enum: ['approved', 'pending', 'rejected', 'inactive'],
    default: 'approved',
    index: true,
  })
  status: string;

  @Prop({ default: Date.now })
  requestedAt: Date;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  approvedBy?: Types.ObjectId | null;

  @Prop()
  rejectionReason?: string;

  @Prop({ default: Date.now })
  lastActiveAt: Date;
}

export const UserDeviceSchema = SchemaFactory.createForClass(UserDevice);

UserDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
UserDeviceSchema.index({ userId: 1, status: 1 });
