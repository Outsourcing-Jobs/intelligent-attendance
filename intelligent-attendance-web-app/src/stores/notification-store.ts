import { create } from "zustand";
import { toast } from "sonner";
import { io } from "socket.io-client";

import { notificationService } from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification.types";

export interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;

  // Selected item for Detail Popup
  selectedNotification: NotificationItem | null;
  isDetailOpen: boolean;

  // Socket
  socket: any;
  isSocketConnected: boolean;

  // Actions
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addRealtimeNotification: (payload: any) => void;

  openDetail: (notification: NotificationItem) => void;
  closeDetail: () => void;

  initSocket: (userObj: any) => void;
  disconnectSocket: () => void;
}

const getSocketBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  return apiUrl.replace(/\/api\/v1\/?$/, "");
};

const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore audio policy restrictions
  }
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  isLoading: false,

  selectedNotification: null,
  isDetailOpen: false,

  socket: null,
  isSocketConnected: false,

  /**
   * Lấy danh sách thông báo từ REST API khi load trang / reload
   */
  fetchNotifications: async (page = 1, limit = 20) => {
    set({ isLoading: true });
    try {
      const response = await notificationService.getMyNotifications(page, limit);
      set({
        notifications: response.data || [],
        totalCount: response.total || 0,
        unreadCount: response.unread || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("[NotificationStore] Failed to fetch notifications:", error);
      set({ isLoading: false });
    }
  },

  /**
   * Đánh dấu 1 thông báo là đã đọc (Optimistic UI update)
   */
  markAsRead: async (id: string) => {
    const { notifications, unreadCount } = get();
    const target = notifications.find((n) => n._id === id);
    if (!target || target.isRead) return;

    // Optimistic UI Update: Cập nhật state trước cho mượt UI
    set({
      notifications: notifications.map((n) =>
        n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
      ),
      unreadCount: Math.max(0, unreadCount - 1),
    });

    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error("[NotificationStore] Failed to mark as read:", error);
    }
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  markAllAsRead: async () => {
    const { notifications } = get();
    set({
      notifications: notifications.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
      unreadCount: 0,
    });

    try {
      await notificationService.markAllAsRead();
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc!");
    } catch (error) {
      console.error("[NotificationStore] Failed to mark all as read:", error);
    }
  },

  /**
   * Thêm thông báo Realtime từ Socket -> mượt UI + phát tiếng chuông + bắn Toast alert (Deduplication)
   */
  addRealtimeNotification: (payload: any) => {
    const title = payload.title || "Thông báo mới";
    const body = payload.body || "";
    const eventType = payload.eventType || "system";

    const { notifications } = get();

    // 🛡️ Kiểm tra chống trùng lặp (Deduplication):
    // Bỏ qua nếu thông báo đã tồn tại (cùng _id hoặc cùng nội dung trong vòng 15 giây)
    const isDuplicate = notifications.some((item) => {
      if (payload._id && item._id === payload._id) return true;
      const isSameContent = item.title === title && item.body === body && item.eventType === eventType;
      const itemTime = new Date(item.createdAt).getTime();
      const nowTime = new Date().getTime();
      const isRecent = !isNaN(itemTime) && Math.abs(nowTime - itemTime) < 15000;
      return isSameContent && (isRecent || isNaN(itemTime));
    });

    if (isDuplicate) {
      console.log("[Socket] Duplicate notification ignored:", title);
      return;
    }

    const newNoti: NotificationItem = {
      _id: payload._id || `rt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      recipientId: payload.recipientId || "",
      eventType,
      title,
      body,
      data: payload.data || {},
      isRead: false,
      createdAt: payload.sentAt || new Date().toISOString(),
    };

    // 1. Phát âm thanh chuông thông báo nhẹ nhàng
    playNotificationChime();

    // 2. Cập nhật mượt UI lập tức
    set((state) => ({
      notifications: [newNoti, ...state.notifications],
      unreadCount: state.unreadCount + 1,
      totalCount: state.totalCount + 1,
    }));

    // 3. Dispatch window CustomEvent để các màn hình khác (như Điểm danh) lắng nghe & tự update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:notification", { detail: newNoti }));
    }

    // 4. Bắn Toast alert nổi trên màn hình
    toast(newNoti.title, {
      description: newNoti.body,
      duration: 6000,
      action: {
        label: "Xem chi tiết",
        onClick: () => {
          get().openDetail(newNoti);
        },
      },
    });
  },

  /**
   * Mở Popup chi tiết thông báo & tự động đánh dấu đã đọc
   */
  openDetail: (notification: NotificationItem) => {
    set({
      selectedNotification: notification,
      isDetailOpen: true,
    });

    if (!notification.isRead) {
      get().markAsRead(notification._id);
    }
  },

  closeDetail: () => {
    set({
      isDetailOpen: false,
      selectedNotification: null,
    });
  },

  /**
   * Khởi tạo kết nối Socket.IO đến backend
   */
  initSocket: (userObj: any) => {
    const currentSocket = get().socket;
    if (currentSocket && currentSocket.connected) {
      return;
    }

    if (!userObj) return;

    let userId = "";
    let allIds: string[] = [];

    if (typeof userObj === "string") {
      userId = userObj;
      allIds = [userObj];
    } else {
      userId = String(userObj._id || userObj.id || userObj.userId || userObj.firebaseUid || "");
      allIds = [userObj._id, userObj.id, userObj.userId, userObj.firebaseUid].filter(Boolean).map(String);
    }

    if (!userId) return;

    const socketUrl = getSocketBaseUrl();
    console.log(`[Socket] Connecting to ${socketUrl}/notifications for user IDs:`, allIds);

    const newSocket = io(`${socketUrl}/notifications`, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnectionAttempts: 10,
    });

    newSocket.on("connect", () => {
      console.log("[Socket] Connected to notifications namespace. Joining rooms for IDs:", allIds);
      set({ isSocketConnected: true });
      newSocket.emit("join", { userId, ids: allIds });
    });

    newSocket.on("joined", (data: any) => {
      console.log("[Socket] Rooms joined successfully:", data);
    });

    // Lắng nghe sự kiện 'notification' từ Socket server (xóa listener cũ trước khi gắn)
    newSocket.off("notification");
    newSocket.on("notification", (event: any) => {
      console.log("[Socket] 🔔 Realtime notification received:", event);
      get().addRealtimeNotification(event);
    });

    newSocket.on("disconnect", () => {
      console.log("[Socket] Disconnected from notifications gateway");
      set({ isSocketConnected: false });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isSocketConnected: false });
    }
  },
}));
