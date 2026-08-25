import { apiClient } from "@/lib/api-client";
import type { NotificationItem, NotificationListResponse } from "@/types/notification.types";

/**
 * Service quản lý các yêu cầu REST API liên quan đến Notification
 */
export const notificationService = {
  /**
   * Lấy danh sách thông báo của user hiện tại (phân trang)
   */
  async getMyNotifications(page = 1, limit = 20): Promise<NotificationListResponse> {
    try {
      return await apiClient<NotificationListResponse>(`/notifications/me?page=${page}&limit=${limit}`, {
        method: "GET",
      });
    } catch {
      return { data: [], total: 0, page: 1, limit, unreadCount: 0 };
    }
  },

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  async markAllAsRead(): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/notifications/read-all`, {
      method: "PATCH",
    });
  },
};
