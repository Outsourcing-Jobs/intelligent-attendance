import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true })
  firebaseUid: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  fullName: string;

  @Prop({ unique: true, sparse: true, index: true })
  userCode?: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  avatarPublicId: string;

  @Prop()
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StudentClass', default: null })
  classId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, default: null })
  departmentId?: Types.ObjectId | null;

  @Prop({ enum: ['active', 'inactive', 'banned'], default: 'active' })
  status: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  lastLoginAt: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  fcmToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
