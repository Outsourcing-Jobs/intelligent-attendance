import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true, collection: 'attendances' })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'ClassSession', required: true, index: true })
  classSessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourseSection', required: true, index: true })
  courseSectionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest', default: null, index: true })
  leaveRequestId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  checkInTime: Date | null;

  @Prop({ type: Date, default: null })
  checkOutTime: Date | null;


  @Prop({
    required: true,
    enum: ['present', 'late', 'absent', 'excused', 'early_leave'],
    default: 'absent',
  })
  status: string;


  @Prop({
    enum: ['self', 'face_recognition', 'qr_code', 'manual', 'card'],
    default: 'self',
  })
  method: string;

  @Prop({ type: String, default: null })
  capturedImage: string | null;

  @Prop({ type: String, default: null })
  deviceInfo: string | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  note: string | null;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Compound Indexes
AttendanceSchema.index({ classSessionId: 1, studentId: 1 }, { unique: true });
AttendanceSchema.index({ courseSectionId: 1, studentId: 1 });
