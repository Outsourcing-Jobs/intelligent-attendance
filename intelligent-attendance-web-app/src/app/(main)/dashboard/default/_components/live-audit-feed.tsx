"use client";

import { 
  Activity, 
  MapPin, 
  QrCode, 
  Edit3, 
  ShieldAlert, 
  FileText, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  type: "GPS_CHECKIN" | "QR_SCAN" | "MANUAL_ADJUST" | "AI_WARNING" | "LEAVE_SUBMIT";
  title: string;
  description: string;
  timestamp: string;
  badgeText: string;
  badgeVariant: "default" | "outline" | "secondary" | "destructive";
}

const defaultActivities: ActivityItem[] = [
  {
    id: "act-01",
    type: "GPS_CHECKIN",
    title: "Điểm danh GPS thành công",
    description: "SV Nguyễn Văn An (211031001) check-in phòng A2-302 • Sai số 8m (Hợp lệ ≤ 25m)",
    timestamp: "Vừa xong",
    badgeText: "GPS Valid",
    badgeVariant: "default",
  },
  {
    id: "act-02",
    type: "QR_SCAN",
    title: "Quét mã QR động hợp lệ",
    description: "SV Trần Thị Mai (211031045) quét QR lớp Học Máy • Thiết bị: Chrome/Windows",
    timestamp: "2 phút trước",
    badgeText: "QR Match",
    badgeVariant: "secondary",
  },
  {
    id: "act-03",
    type: "MANUAL_ADJUST",
    title: "Giảng viên điều chỉnh điểm danh",
    description: "ThS. Nguyễn Văn B đổi Vắng ➔ Có phép cho SV Lê Quốc Bảo (Lý do: Giấy khám y tế)",
    timestamp: "7 phút trước",
    badgeText: "Audit Log",
    badgeVariant: "outline",
  },
  {
    id: "act-04",
    type: "AI_WARNING",
    title: "Kích hoạt cảnh báo sớm AI",
    description: "Random Forest cảnh báo SV Nguyễn Hoàng Long (211031024) có nguy cơ cấm thi 92.4%",
    timestamp: "15 phút trước",
    badgeText: "AI Warning",
    badgeVariant: "destructive",
  },
  {
    id: "act-05",
    type: "LEAVE_SUBMIT",
    title: "Đơn xin nghỉ học mới",
    description: "SV Phạm Đức Minh nộp đơn xin phép vắng tiết 1-2 ngày 14/09 (Lý do: Việc gia đình)",
    timestamp: "32 phút trước",
    badgeText: "Đơn mới",
    badgeVariant: "outline",
  },
];

export function LiveAuditFeed() {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "GPS_CHECKIN":
        return <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />;
      case "QR_SCAN":
        return <QrCode className="size-4 text-teal-600 dark:text-teal-400" />;
      case "MANUAL_ADJUST":
        return <Edit3 className="size-4 text-blue-600 dark:text-blue-400" />;
      case "AI_WARNING":
        return <ShieldAlert className="size-4 text-rose-600 dark:text-rose-400" />;
      case "LEAVE_SUBMIT":
        return <FileText className="size-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Activity className="size-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
              <Activity className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                Nhật Ký Sự Kiện Điểm Danh Trực Tiếp
              </CardTitle>
              <CardDescription className="text-xs">
                Luồng dữ liệu realtime socket từ GPS, QR code, điều chỉnh của giảng viên và AI
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1 border-teal-500/30 text-teal-600 bg-teal-500/10 text-[10px] font-bold">
            <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
            Realtime Socket
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="relative space-y-3 before:absolute before:bottom-2 before:left-3.5 before:top-2 before:w-px before:bg-border">
          {defaultActivities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-3 pl-1">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-background shadow-xs z-10">
                {getIcon(act.type)}
              </div>
              <div className="flex-1 space-y-0.5 rounded-lg border bg-card/60 p-2.5 text-xs shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{act.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={act.badgeVariant} className="text-[9px] h-4 px-1 font-bold">
                      {act.badgeText}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="size-2.5" />
                      {act.timestamp}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
