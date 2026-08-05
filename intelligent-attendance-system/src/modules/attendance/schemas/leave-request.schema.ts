import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveRequestDocument = LeaveRequest & Document;

@Schema({ timestamps: true, collection: 'leave_requests' })
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourseSection', required: true, index: true })
  courseSectionId: Types.ObjectId;

  // Nullable: SV có thể xin nghỉ cả khoảng ngày, không nhất thiết phải gắn với 1 buổi cụ thể
  @Prop({ type: Types.ObjectId, ref: 'ClassSession', default: null, index: true })
  classSessionId: Types.ObjectId | null;

  @Prop({ required: true, enum: ['sick', 'personal', 'family', 'other'] })
  leaveType: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: String, default: null })
  attachmentUrl: string | null;

  @Prop({ type: String, default: null })
  attachmentPublicId: string | null;

  @Prop({ required: true })
  fromDate: Date;

  @Prop({ required: true })
  toDate: Date;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  reviewedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  reviewedAt: Date | null;

  @Prop({ type: String, default: null })
  rejectionReason: string | null;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);

LeaveRequestSchema.index({ studentId: 1, courseSectionId: 1 });
LeaveRequestSchema.index({ studentId: 1, status: 1 });
LeaveRequestSchema.index({ fromDate: 1, toDate: 1 });
