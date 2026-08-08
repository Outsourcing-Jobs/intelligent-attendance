"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { NotificationDetailDialog } from "./notification-detail-dialog";

import { initFcmMessaging } from "@/lib/firebase-messaging";

export function NotificationListener() {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchNotifications, initSocket, disconnectSocket } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectSocket();
      return;
    }

    if (user) {
      // 1. Tải danh sách thông báo ban đầu qua REST API
      fetchNotifications();

      // 2. Khởi tạo kết nối Realtime Socket.IO đính kèm tất cả định danh ID
      initSocket(user);

      // 3. Khởi tạo Push Notifications qua FCM (Service Worker)
      initFcmMessaging();
    }

    return () => {
      // cleanup nếu unmount
    };
  }, [isAuthenticated, user, fetchNotifications, initSocket, disconnectSocket]);

  return <NotificationDetailDialog />;
}
