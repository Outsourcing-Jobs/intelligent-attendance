import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

/**
 * Lưu lịch sử mỗi thông báo đã gửi – hỗ trợ tra cứu,
 * audit, và hiển thị danh sách thông báo cho user.
 */
@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  /** Người nhận thông báo */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipientId: Types.ObjectId;

  /** Template đã dùng để render (nếu có) */
  @Prop({ type: Types.ObjectId, ref: 'NotificationTemplate', default: null })
  templateId?: Types.ObjectId | null;

  /** Loại sự kiện nghiệp vụ */
  @Prop({ required: true, index: true })
  eventType: string;

  /** Tiêu đề sau khi render */
  @Prop({ required: true })
  title: string;

  /** Nội dung sau khi render */
  @Prop({ required: true })
  body: string;

  /** Dữ liệu đính kèm (metadata, deeplink, …) */
  @Prop({ type: Object, default: {} })
  data: Record<string, string>;

  /** Kênh đã dùng để gửi */
  @Prop({ type: [String], default: [] })
  channelsSent: string[];

  /** Kết quả gửi theo từng kênh */
  @Prop({ type: Object, default: {} })
  deliveryResults: Record<string, { success: boolean; error?: string }>;

  /** Người dùng đã đọc hay chưa */
  @Prop({ default: false })
  isRead: boolean;

  /** Thời điểm người dùng đọc */
  @Prop({ type: Date, default: null })
  readAt?: Date | null;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
