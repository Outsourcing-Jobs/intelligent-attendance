"use client";

import { useState } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, CheckCheck, Search, Filter, Inbox, CheckCircle2, AlertTriangle, XCircle, Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const getEventIcon = (eventType: string) => {
  if (eventType.includes("approved") || eventType.includes("checkin")) {
    return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
  }
  if (eventType.includes("rejected") || eventType.includes("absent")) {
    return <XCircle className="h-5 w-5 text-rose-500 shrink-0" />;
  }
  if (eventType.includes("late") || eventType.includes("warning")) {
    return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
  }
  if (eventType.includes("session")) {
    return <Calendar className="h-5 w-5 text-blue-500 shrink-0" />;
  }
  return <Info className="h-5 w-5 text-primary shrink-0" />;
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllAsRead, openDetail, isLoading } = useNotificationStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread" && item.isRead) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q) || item.eventType.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Trung tâm thông báo
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý và xem toàn bộ lịch sử thông báo hệ thống của bạn
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Đánh dấu tất cả đã đọc ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Tất cả ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="gap-1.5"
          >
            Chưa đọc
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thông báo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0 divide-y">
          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Đang tải danh sách thông báo...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-3">
              <Inbox className="h-12 w-12 text-muted-foreground/30" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">Không tìm thấy thông báo nào</p>
                <p className="text-xs">Bạn chưa có thông báo mới hoặc không khớp với bộ lọc</p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item._id}
                onClick={() => openDetail(item)}
                className={cn(
                  "flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-accent/50",
                  !item.isRead && "bg-primary/5 border-l-4 border-l-blue-600",
                )}
              >
                {getEventIcon(item.eventType)}

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-sm font-semibold", !item.isRead ? "text-foreground" : "text-foreground/80")}>
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.body}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {item.eventType}
                    </Badge>
                    {!item.isRead && (
                      <span className="inline-flex items-center text-[11px] font-medium text-blue-600">
                        Chưa đọc
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
