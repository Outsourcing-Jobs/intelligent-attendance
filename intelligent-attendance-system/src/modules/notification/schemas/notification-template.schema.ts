import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationTemplateDocument = NotificationTemplate & Document;

/**
 * Template thông báo – cho phép render nội dung động bằng cách
 * thay thế placeholder dạng {{key}} trong title / body.
 *
 * Ví dụ:
 *   body = "Sinh viên {{studentName}} đã điểm danh lúc {{time}}"
 *   variables = { studentName: 'Nguyen Van A', time: '07:30' }
 *   => "Sinh viên Nguyen Van A đã điểm danh lúc 07:30"
 */
@Schema({ timestamps: true, collection: 'notification_templates' })
export class NotificationTemplate {
  /** Mã template duy nhất, dùng để tra cứu */
  @Prop({ required: true, unique: true, index: true })
  code: string;

  /** Tên hiển thị, mô tả ngắn gọn mục đích template */
  @Prop({ required: true })
  name: string;

  /**
   * Nghiệp vụ / sự kiện mà template này phục vụ.
   * Khớp với NotificationPayload.eventType.
   * Ví dụ: 'attendance.checkin', 'leave_request.approved'
   */
  @Prop({ required: true, index: true })
  eventType: string;

  /** Mẫu tiêu đề, hỗ trợ placeholder {{key}} */
  @Prop({ required: true })
  titleTemplate: string;

  /** Mẫu nội dung, hỗ trợ placeholder {{key}} */
  @Prop({ required: true })
  bodyTemplate: string;

  /** Kênh được kích hoạt cho template này */
  @Prop({ type: [String], enum: ['firebase', 'socket'], default: ['firebase', 'socket'] })
  channels: string[];

  /** Trạng thái: active / inactive */
  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;

  /** Ghi chú nội bộ */
  @Prop()
  description?: string;
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);
