import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveRequestHistoryDocument = LeaveRequestHistory & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'leave_request_histories' })
export class LeaveRequestHistory {
  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest', required: true, index: true })
  leaveRequestId: Types.ObjectId;

  @Prop({ required: true, enum: ['created', 'approved', 'rejected', 'cancelled'] })
  action: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  performedBy: Types.ObjectId;

  @Prop({ type: String, default: null })
  note: string | null;
}

export const LeaveRequestHistorySchema = SchemaFactory.createForClass(LeaveRequestHistory);

LeaveRequestHistorySchema.index({ leaveRequestId: 1, createdAt: -1 });
