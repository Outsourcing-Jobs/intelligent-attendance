"use client";

import * as React from "react";
import { useNotificationStore } from "@/stores/notification-store";
import type { NotificationItem } from "@/types/notification.types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing, CheckCheck, Inbox, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { initFcmMessaging } from "@/lib/firebase-messaging";

const formatTimeAgo = (dateStr: string) => {
  try {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return past.toLocaleDateString("vi-VN");
  } catch {
    return dateStr;
  }
};

export function NotificationPopover() {
  const { notifications, unreadCount, markAllAsRead, openDetail, isLoading } = useNotificationStore();
  const [hasFcmPermission, setHasFcmPermission] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasFcmPermission(Notification.permission === "granted");
    }
  }, []);

  const handleEnablePush = async () => {
    await initFcmMessaging();
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasFcmPermission(Notification.permission === "granted");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Thông báo</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Thông báo</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                {unreadCount} chưa đọc
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đọc tất cả
            </Button>
          )}
        </div>

        {!hasFcmPermission && (
          <div className="flex items-center justify-between bg-amber-500/10 border-b border-amber-500/20 px-3.5 py-2 text-xs text-amber-700 dark:text-amber-400">
            <span className="flex items-center gap-1.5 font-medium">
              <BellRing className="size-3.5 text-amber-600 animate-bounce" />
              Chưa bật Push Notifications
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[11px] px-2 border-amber-500/30 hover:bg-amber-500/20 cursor-pointer"
              onClick={handleEnablePush}
            >
              Kích hoạt ngay
            </Button>
          </div>
        )}

        {/* Notification List */}
        <ScrollArea className="h-[360px]">
          {isLoading && notifications.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
              Đang tải thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 h-48 text-muted-foreground">
              <Inbox className="h-8 w-8 text-muted-foreground/50" />
              <span className="text-xs">Chưa có thông báo nào</span>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => openDetail(item)}
                  className={cn(
                    "flex w-full items-start gap-3 p-3.5 text-left transition-colors hover:bg-accent/50",
                    !item.isRead && "bg-primary/5 font-medium",
                  )}
                >
                  {/* Unread Indicator */}
                  <div className="pt-1 shrink-0">
                    {!item.isRead ? (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-600/10" />
                    ) : (
                      <span className="flex h-2 w-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold line-clamp-1 text-foreground">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                      {item.body}
                    </p>

                    <div className="pt-0.5">
                      <span className="inline-block text-[10px] font-medium text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded">
                        {item.eventType}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
