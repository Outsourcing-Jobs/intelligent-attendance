"use client";

import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Wifi,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useQrAttendanceSocket, LiveCheckInEvent } from "@/hooks/useQrAttendanceSocket";

interface QrProjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    _id: string;
    room: string;
    startPeriod: number;
    numPeriods: number;
    startTime: string;
    endTime: string;
    courseSection?: {
      sectionCode: string;
      subjectId?: {
        subjectCode: string;
        subjectName: string;
      };
    };
    lecturer?: {
      fullName: string;
      email: string;
    };
  } | null;
  totalStudents?: number;
}

export function QrProjectorModal({
  isOpen,
  onClose,
  session,
  totalStudents = 50,
}: QrProjectorModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    currentQrToken,
    expiresIn,
    countdown,
    recentCheckIns,
    liveStats,
    restartStream,
  } = useQrAttendanceSocket(session?._id, isOpen);

  const totalEnrolled = liveStats.totalStudents || totalStudents || 1;
  const presentTotal = liveStats.presentCount || recentCheckIns.length;
  const attendanceRate = Math.min(Math.round((presentTotal / totalEnrolled) * 100), 100);

  // Toggle Toàn màn hình (F11 / Fullscreen API)
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  if (!session) return null;

  // Tính màu và phần trăm của progress bar đếm ngược
  const progressPercent = Math.max(0, Math.min(100, (countdown / expiresIn) * 100));
  const countdownColorClass =
    countdown > 10
      ? "bg-emerald-500"
      : countdown > 5
        ? "bg-amber-500 animate-pulse"
        : "bg-rose-500 animate-bounce";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        ref={containerRef}
        showCloseButton={false}
        className={`w-[96vw] max-w-6xl sm:max-w-5xl md:max-w-6xl p-0 overflow-hidden border-border/80 bg-background text-foreground shadow-2xl transition-all duration-300 ${
          isFullscreen ? "fixed inset-0 w-screen h-screen max-w-none sm:max-w-none md:max-w-none rounded-none z-[99999]" : "max-h-[92vh]"
        }`}
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b bg-muted/40 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                  {session.courseSection?.subjectId?.subjectName || "Điểm danh Buổi học"}
                </h2>
                <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 border-primary/30 text-primary shrink-0">
                  {session.courseSection?.sectionCode || "IT-01"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> Phòng {session.room}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" /> Tiết {session.startPeriod} - {session.startPeriod + session.numPeriods - 1} ({session.startTime} - {session.endTime})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <Badge
              variant={isConnected ? "default" : "destructive"}
              className="hidden sm:inline-flex gap-1.5 px-3 py-1 font-medium text-xs"
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`} />
              {isConnected ? "Máy chiếu Live" : "Đang kết nối..."}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="gap-1.5 text-xs h-9 px-3"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Đóng</span>
            </Button>
          </div>
        </div>


        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
          {/* CỘT TRÁI: KHUNG MÃ QR ĐỘNG + ĐẾM NGƯỢC (7 COLS) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r bg-card/60">
            <div className="text-center mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Mã QR Động Chống Điểm Danh Hộ
              </span>
              <h3 className="text-lg sm:text-xl font-bold">Hướng Camera vào mã QR bên dưới</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mã sẽ tự động biến thiên sau mỗi 20 giây qua WebSocket
              </p>
            </div>

            {/* KHUNG CHỨA QR CODE */}
            <div className="relative p-6 rounded-3xl bg-white shadow-2xl border-4 border-primary/20 transition-all hover:border-primary/40 hover:scale-[1.01] duration-300">
              {currentQrToken ? (
                <QRCodeSVG
                  value={currentQrToken}
                  size={isFullscreen ? 320 : 250}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/icon.svg",
                    x: undefined,
                    y: undefined,
                    height: 48,
                    width: 48,
                    excavate: true,
                  }}
                />
              ) : (
                <div className="w-[250px] h-[250px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-xs font-medium">Đang tạo chuỗi HMAC...</span>
                </div>
              )}

              {/* Nhãn đếm ngược góc dưới */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Làm mới sau: <span className="font-mono text-amber-400 font-extrabold">{countdown}s</span>
              </div>
            </div>

            {/* PROGRESS BAR ĐẾM NGƯỢC */}
            <div className="w-full max-w-sm mt-8 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground font-medium px-1">
                <span>Vòng đời mã QR (20s)</span>
                <span className="font-mono font-bold text-foreground">{countdown}s còn lại</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden p-0.5 border">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${countdownColorClass}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => restartStream(20)}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Làm mới ngay
              </Button>
            </div>
          </div>

          {/* CỘT PHẢI: THỐNG KÊ SĨ SỐ + LIVE STREAM CHECK-IN FEED (5 COLS) */}
          <div className="lg:col-span-5 p-6 flex flex-col bg-muted/10 h-full max-h-[600px] lg:max-h-none">
            {/* THẺ SĨ SỐ */}
            <div className="p-4 rounded-2xl bg-card border shadow-sm mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" /> Sĩ Số Lớp Học
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {attendanceRate}% Có mặt
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                  {presentTotal}
                </span>
                <span className="text-sm font-medium text-muted-foreground">/ {totalEnrolled} sinh viên</span>
              </div>

              <Progress value={attendanceRate} className="h-2" />
            </div>

            {/* LIVE CHECK-IN STREAM HEADER */}
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Vừa Điểm Danh ({recentCheckIns.length})
              </h4>
              <span className="text-[11px] text-muted-foreground">Real-time Stream</span>
            </div>

            {/* DANH SÁCH SINH VIÊN VỪA QUÉT (ACTIVITY FEED) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
              {recentCheckIns.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed text-muted-foreground">
                  <Users className="w-8 h-8 opacity-30 mb-2" />
                  <p className="text-xs font-medium">Chưa có sinh viên nào quét mã</p>
                  <p className="text-[11px] opacity-70 mt-0.5">
                    Danh sách sẽ tự động xuất hiện ngay khi sinh viên quét mã thành công
                  </p>
                </div>
              ) : (
                recentCheckIns.map((item, index) => (
                  <div
                    key={`${item.studentId}-${item.checkInTime}-${index}`}
                    className="p-3 rounded-xl bg-card border shadow-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300 transition-all hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border">
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.fullName} className="w-full h-full object-cover" />
                        ) : (
                          item.fullName.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-foreground">{item.fullName}</p>
                        <p className="text-[11px] font-mono text-muted-foreground truncate">{item.studentCode}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge
                        variant={item.status === "late" ? "secondary" : "default"}
                        className={`text-[10px] px-2 py-0.5 font-medium ${
                          item.status === "late"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {item.status === "late" ? "Đi muộn" : "Đúng giờ"}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                        {new Date(item.checkInTime).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
