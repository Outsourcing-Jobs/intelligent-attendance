"use client";

import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  QrCode, 
  CheckCircle2, 
  ArrowRight, 
  Radio,
  PlayCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ClassSessionItem {
  id: string;
  courseCode: string;
  courseName: string;
  sectionCode: string;
  room: string;
  timeSlot: string;
  periods: string;
  lecturerName: string;
  enrolledCount: number;
  checkedInCount: number;
  status: "LIVE" | "UPCOMING" | "COMPLETED";
}

const defaultSessions: ClassSessionItem[] = [
  {
    id: "sess-01",
    courseCode: "INT1340",
    courseName: "Lập trình Web Nâng Cao",
    sectionCode: "K18-CNTT1.01",
    room: "A2-302 (Lab Công Nghệ Web)",
    timeSlot: "07:30 - 11:00",
    periods: "Tiết 1 - 4",
    lecturerName: "ThS. Nguyễn Văn B",
    enrolledCount: 42,
    checkedInCount: 39,
    status: "LIVE",
  },
  {
    id: "sess-02",
    courseCode: "INT1432",
    courseName: "Học Máy & Trí Tuệ Nhân Tạo",
    sectionCode: "K18-CNTT2.02",
    room: "C1-105 (Phòng Máy AI-GPU)",
    timeSlot: "09:15 - 11:45",
    periods: "Tiết 3 - 5",
    lecturerName: "TS. Trần Văn C",
    enrolledCount: 40,
    checkedInCount: 37,
    status: "LIVE",
  },
  {
    id: "sess-03",
    courseCode: "INT1221",
    courseName: "Cấu Trúc Dữ Liệu & Giải Thuật",
    sectionCode: "K18-KTPM1.01",
    room: "B3-201 (Hội trường Đa năng)",
    timeSlot: "13:30 - 17:00",
    periods: "Tiết 7 - 10",
    lecturerName: "ThS. Phạm Thị Dung",
    enrolledCount: 45,
    checkedInCount: 0,
    status: "UPCOMING",
  },
  {
    id: "sess-04",
    courseCode: "INT1302",
    courseName: "Cơ Sở Dữ Liệu Phân Tán",
    sectionCode: "K18-HTTT1.01",
    room: "A2-204 (Phòng Thực hành)",
    timeSlot: "07:00 - 09:15",
    periods: "Tiết 1 - 2",
    lecturerName: "ThS. Lê Quốc Bảo",
    enrolledCount: 38,
    checkedInCount: 36,
    status: "COMPLETED",
  },
];

export function TodaySessionsLive() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Calendar className="size-4" />
            </div>
            <CardTitle className="text-base font-bold sm:text-lg">
              Lịch Học & Ca Điểm Danh Hôm Nay
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Theo dõi tỷ lệ sinh viên check-in GPS/QR thời gian thực theo từng phòng học
          </CardDescription>
        </div>

        <Link href="/dashboard/attendance">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            Xem toàn bộ thời khóa biểu <ArrowRight className="size-3" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {defaultSessions.map((session) => {
            const isLive = session.status === "LIVE";
            const isUpcoming = session.status === "UPCOMING";
            const isCompleted = session.status === "COMPLETED";
            const rate = session.enrolledCount > 0 
              ? Math.round((session.checkedInCount / session.enrolledCount) * 100) 
              : 0;

            return (
              <div 
                key={session.id} 
                className={`relative flex flex-col justify-between rounded-xl border p-4 space-y-3 transition-all hover:shadow-sm ${
                  isLive ? "border-teal-500/40 bg-gradient-to-br from-teal-500/5 to-card" : "bg-card"
                }`}
              >
                {/* Session Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">{session.courseCode}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs font-semibold text-foreground truncate">{session.sectionCode}</span>
                    </div>

                    {isLive && (
                      <Badge className="h-5 gap-1 bg-emerald-500 text-white text-[10px] font-bold animate-pulse">
                        <Radio className="size-2.5 animate-spin" /> Đang Điểm Danh GPS
                      </Badge>
                    )}
                    {isUpcoming && (
                      <Badge variant="secondary" className="h-5 text-[10px] font-medium text-muted-foreground">
                        <Clock className="size-2.5 mr-1" /> Sắp diễn ra
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="outline" className="h-5 text-[10px] font-medium border-blue-500/30 text-blue-600 bg-blue-500/5">
                        <CheckCircle2 className="size-2.5 mr-1" /> Đã kết thúc
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-foreground line-clamp-1">
                    {session.courseName}
                  </h3>
                </div>

                {/* Session Info Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3 text-teal-600 shrink-0" />
                    <span className="truncate">{session.room}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3 text-blue-600 shrink-0" />
                    <span>{session.timeSlot} ({session.periods})</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Users className="size-3 text-indigo-600 shrink-0" />
                    <span>Giảng viên: <strong className="text-foreground">{session.lecturerName}</strong></span>
                  </div>
                </div>

                {/* Check-in Progress Strip */}
                <div className="space-y-1.5 pt-1 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tiến độ điểm danh:</span>
                    <span className="font-bold text-foreground">
                      {isUpcoming ? "Chưa mở ca" : `${session.checkedInCount}/${session.enrolledCount} (${rate}%)`}
                    </span>
                  </div>
                  <Progress 
                    value={rate} 
                    className={`h-1.5 ${isLive ? "[&>div]:bg-teal-500" : isCompleted ? "[&>div]:bg-blue-500" : "[&>div]:bg-muted"}`} 
                  />
                </div>

                {/* Card Action */}
                <div className="pt-1">
                  <Link href="/dashboard/attendance">
                    <Button 
                      variant={isLive ? "default" : "outline"} 
                      size="sm" 
                      className={`w-full h-8 text-xs font-semibold gap-1.5 ${
                        isLive ? "bg-teal-600 hover:bg-teal-700 text-white" : ""
                      }`}
                    >
                      {isLive ? (
                        <>
                          <QrCode className="size-3.5" />
                          <span>Mở QR / Giám Sát Ca Học</span>
                        </>
                      ) : (
                        <>
                          <span>Xem Bảng Điểm Danh</span>
                          <ArrowRight className="size-3 ml-auto opacity-70" />
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
