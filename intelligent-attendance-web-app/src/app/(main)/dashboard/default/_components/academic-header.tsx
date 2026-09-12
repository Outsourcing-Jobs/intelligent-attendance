"use client";

import Link from "next/link";
import { 
  Sparkles, 
  QrCode, 
  ShieldAlert, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Cpu, 
  Activity,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

export function AcademicHeader() {
  const { user } = useAuthStore();
  const userName = user?.fullName || user?.name || "Thầy/Cô";
  const roleName = user?.roleName || (user?.roleCode === "admin" ? "Quản trị viên" : "Giảng viên");

  // Get greeting according to current hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/40 p-6 md:p-8 shadow-sm">
      {/* Decorative ambient background blur */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-400/15" />
      <div className="pointer-events-none absolute -bottom-20 right-40 size-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/15" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Welcome Details */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium text-xs py-0.5">
              <Sparkles className="size-3.5 text-teal-600 dark:text-teal-400" />
              Cổng Điều Hành Học Vụ & Điểm Danh
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs font-normal">
              <Calendar className="size-3 text-muted-foreground" />
              Học kỳ I • Năm học 2025 - 2026
            </Badge>
            <span className="text-xs text-muted-foreground">• Cơ sở Sơn Tây / Xuân Khanh</span>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
              {greeting}, <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-blue-400">{userName}</span>! 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Chào mừng bạn đến với <strong>Hệ thống Điểm danh Thông minh & Cảnh báo Chuyên cần AI</strong> (VIU Attendance). 
              Giám sát ca học trực tiếp, quản lý điểm danh GPS/QR và theo dõi dự báo nguy cơ cấm thi theo thời gian thực.
            </p>
          </div>

          {/* System Status Indicators */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 rounded-md bg-background/80 px-2.5 py-1 border shadow-2xs">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <Cpu className="size-3.5 text-teal-600 dark:text-teal-400" />
              <span className="font-semibold text-foreground">AI Random Forest:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Hoạt động (AUC 0.977)</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-md bg-background/80 px-2.5 py-1 border shadow-2xs">
              <CheckCircle2 className="size-3.5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-foreground">GPS Geofence:</span>
              <span className="text-muted-foreground font-medium">Chuẩn sai số ≤ 25m</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-md bg-background/80 px-2.5 py-1 border shadow-2xs">
              <Activity className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-foreground">Realtime Socket:</span>
              <span className="text-muted-foreground font-medium">Đã đồng bộ</span>
            </div>
          </div>
        </div>

        {/* Right Quick Actions */}
        <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
          <Link href="/dashboard/attendance">
            <Button className="w-full justify-start gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/20 hover:from-teal-700 hover:to-emerald-700 font-semibold text-xs h-9">
              <QrCode className="size-4" />
              <span>Mở Ca Điểm Danh (QR / GPS)</span>
              <ArrowRight className="size-3.5 ml-auto opacity-70" />
            </Button>
          </Link>

          <Link href="/dashboard/attendance">
            <Button variant="outline" className="w-full justify-start gap-2 border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 font-semibold text-xs h-9">
              <ShieldAlert className="size-4 text-rose-600" />
              <span>Xem Cảnh Báo Sớm AI</span>
              <ArrowRight className="size-3.5 ml-auto opacity-70" />
            </Button>
          </Link>

          <Link href="/dashboard/leave-requests">
            <Button variant="outline" className="w-full justify-start gap-2 font-medium text-xs h-9 text-muted-foreground hover:text-foreground">
              <FileText className="size-4 text-blue-500" />
              <span>Duyệt Đơn Nghỉ Phép</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
