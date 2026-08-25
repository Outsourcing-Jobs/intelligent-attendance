export interface NotificationItem {
  _id: string;
  recipientId: string;
  templateId?: string | null;
  eventType: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  channelsSent?: string[];
  deliveryResults?: Record<string, { success: boolean; error?: string }>;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  total: number;
  unread: number;
}
