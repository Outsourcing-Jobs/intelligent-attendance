/**
 * Strategy Pattern – Notification Channel Interface
 *
 * Mỗi kênh gửi thông báo (Firebase FCM, Socket.IO, Email, SMS, …)
 * phải implement interface này. Nhờ đó NotificationService không cần
 * biết chi tiết từng kênh, chỉ cần gọi send() thông qua strategy đang
 * được inject.
 */
export interface NotificationPayload {
  /** ID người nhận trong hệ thống (userId hoặc danh sách userId) */
  recipientIds: string[];

  /** Tiêu đề thông báo (đã render từ template) */
  title: string;

  /** Nội dung thông báo (đã render từ template) */
  body: string;

  /**
   * Loại sự kiện nghiệp vụ, dùng để client routing hoặc lọc thông báo.
   * Ví dụ: 'attendance.checkin', 'leave_request.approved', …
   */
  eventType: string;

  /** Dữ liệu tuỳ chọn đính kèm (metadata, deeplink, …) */
  data?: Record<string, string>;
}

export interface NotificationResult {
  channel: string;
  success: boolean;
  error?: string;
}

export interface INotificationChannel {
  /** Tên định danh của kênh, dùng để log và filter */
  readonly channelName: string;

  /**
   * Gửi thông báo theo kênh tương ứng.
   * Phải trả về kết quả thành công / thất bại để caller tổng hợp.
   */
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
