import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceAuditDocument = AttendanceAudit & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'attendance_audits' })
export class AttendanceAudit {
  @Prop({ type: Types.ObjectId, ref: 'Attendance', required: true, index: true })
  attendanceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  updatedBy: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['present', 'late', 'absent', 'excused', 'early_leave'],
  })
  previousStatus: string;

  @Prop({
    required: true,
    enum: ['present', 'late', 'absent', 'excused', 'early_leave'],
  })
  newStatus: string;

  @Prop({ type: String, required: true, trim: true })
  reason: string;
}

export const AttendanceAuditSchema = SchemaFactory.createForClass(AttendanceAudit);

// Indexes for fast lookup
AttendanceAuditSchema.index({ attendanceId: 1, createdAt: -1 });
AttendanceAuditSchema.index({ updatedBy: 1 });
