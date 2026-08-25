"use client";

import { useNotificationStore } from "@/stores/notification-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

const getEventIcon = (eventType: string) => {
  if (eventType.includes("approved") || eventType.includes("checkin")) {
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  }
  if (eventType.includes("rejected") || eventType.includes("absent")) {
    return <XCircle className="h-5 w-5 text-rose-500" />;
  }
  if (eventType.includes("late") || eventType.includes("warning")) {
    return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  }
  if (eventType.includes("session")) {
    return <Calendar className="h-5 w-5 text-blue-500" />;
  }
  return <Info className="h-5 w-5 text-primary" />;
};

const getBadgeVariant = (eventType: string) => {
  if (eventType.includes("approved") || eventType.includes("checkin")) return "emerald";
  if (eventType.includes("rejected") || eventType.includes("absent")) return "destructive";
  if (eventType.includes("late")) return "outline";
  return "secondary";
};

export function NotificationDetailDialog() {
  const { selectedNotification, isDetailOpen, closeDetail } = useNotificationStore();

  if (!selectedNotification) return null;

  const formattedDate = new Date(selectedNotification.createdAt).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Dialog open={isDetailOpen} onOpenChange={(open) => !open && closeDetail()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {getEventIcon(selectedNotification.eventType)}
              <Badge variant={getBadgeVariant(selectedNotification.eventType) as any}>
                {selectedNotification.eventType}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>

          <DialogTitle className="text-base font-semibold leading-snug pt-1">
            {selectedNotification.title}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
          {selectedNotification.body}
        </div>

        {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-medium text-muted-foreground">Thông tin đính kèm:</span>
            <div className="rounded-md border bg-background p-2.5 text-xs font-mono space-y-1">
              {Object.entries(selectedNotification.data).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={closeDetail}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
