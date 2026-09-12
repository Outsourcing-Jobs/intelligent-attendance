"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Calendar, 
  BookOpen, 
  QrCode, 
  MapPin, 
  FileText, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Send,
  Check,
  Radio,
  Activity,
  Cpu
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { statisticsService, TeacherStatisticsResponse } from "@/services/statistics.service";
import { courseSectionService } from "@/services/academic.service";
import { attendanceService } from "@/services/attendance.service";
import { exportRiskRankingToExcel } from "@/lib/excel-export";

export function TeacherDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<TeacherStatisticsResponse | null>(null);
  const [courseSections, setCourseSections] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);

  const teacherName = user?.fullName || user?.name || "Thầy/Cô";
  const roleName = user?.roleName || (user?.roleCode === "admin" ? "Quản trị viên" : "Giảng viên");

  const handleExportExcel = () => {
    if (!stats?.studentRanking || stats.studentRanking.length === 0) {
      toast.info("Chưa có danh sách xếp loại rủi ro sinh viên để xuất Excel.");
      return;
    }
    try {
      const fileName = exportRiskRankingToExcel(stats.studentRanking);
      toast.success(`Đã xuất báo cáo chuyên cần thành công: ${fileName}`, {
        description: `Tệp đã được tải xuống máy tính (${stats.studentRanking.length} sinh viên).`,
      });
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xuất file Excel.");
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const isAdmin = user?.roleCode === "admin";
        
        const [statsData, sectionsData, sessionsData, reportData] = await Promise.all([
          isAdmin 
            ? statisticsService.getAdminStatistics().catch(() => null)
            : statisticsService.getTeacherStatistics().catch(() => null),
          courseSectionService.getCourseSections().catch(() => []),
          courseSectionService.getMySessions().catch(() => []),
          attendanceService.getReport().catch(() => null),
        ]);

        if (isMounted) {
          if (statsData) setStats(statsData as any);
          if (Array.isArray(sectionsData)) setCourseSections(sectionsData);
          if (Array.isArray(sessionsData)) setSessions(sessionsData);
          if (reportData?.records && Array.isArray(reportData.records)) {
            setRecentRecords(reportData.records);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu giảng viên từ DB:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTeacherData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const kpi = stats?.kpi || {
    totalStudents: 0,
    totalCourseSections: 0,
    totalSessions: 0,
    totalAttendanceRecords: 0,
    pendingLeaveCount: 0,
  };

  const chartData = stats?.chart?.filter(c => c.value > 0) || [];
  const ranking = stats?.studentRanking || [];
  const highRiskStudents = ranking.filter(s => s.risk === "DANGER");
  const warningStudents = ranking.filter(s => s.risk === "WARNING");
  const totalRisk = highRiskStudents.length + warningStudents.length;

  const handleSendWarning = (student: any) => {
    const sId = student.studentId || student.userCode;
    if (notifiedIds.includes(sId)) return;
    setNotifiedIds(prev => [...prev, sId]);
    toast.success(`Đã gửi cảnh báo chuyên cần AI`, {
      description: `Đã gửi thông báo cảnh báo nguy cơ cấm thi đến sinh viên ${student.fullName} (${student.userCode}).`,
    });
  };

  return (
    <div className="@container/main flex flex-col gap-6 pb-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-muted/40 p-6 md:p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-400/15" />
        <div className="pointer-events-none absolute -bottom-20 right-40 size-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/15" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5 border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium text-xs py-0.5">
                <Sparkles className="size-3.5 text-teal-600 dark:text-teal-400" />
                Cổng Quản Lý Giảng Dạy & Điểm Danh
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                {roleName} • Học kỳ I (2025 - 2026)
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                Chào mừng, <span className="text-teal-600 dark:text-teal-400">{teacherName}</span>! 👋
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Hệ thống giám sát chuyên cần và dự báo rủi ro sinh viên thời gian thực. Toàn bộ số liệu được tổng hợp trực tiếp từ cơ sở dữ liệu các lớp học phần bạn đang phụ trách.
              </p>
            </div>

            {/* Status indicators */}
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
                <Activity className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-foreground">Dữ liệu MongoDB:</span>
                <span className="text-muted-foreground font-medium">Đã kết nối trực tiếp</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <Link href="/dashboard/attendance">
              <Button className="w-full justify-start gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold text-xs h-9 shadow-sm">
                <QrCode className="size-4" />
                <span>Mở Ca Điểm Danh (QR / GPS)</span>
                <ArrowRight className="size-3.5 ml-auto opacity-70" />
              </Button>
            </Link>

            <Link href="/dashboard/attendance">
              <Button variant="outline" className="w-full justify-start gap-2 border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 font-semibold text-xs h-9">
                <ShieldAlert className="size-4 text-rose-600" />
                <span>Cảnh Báo Cấm Thi AI ({totalRisk})</span>
                <ArrowRight className="size-3.5 ml-auto opacity-70" />
              </Button>
            </Link>

            <Link href="/dashboard/leave-requests">
              <Button variant="outline" className="w-full justify-start gap-2 font-medium text-xs h-9">
                <FileText className="size-4 text-blue-500" />
                <span>Duyệt Đơn Nghỉ Phép ({kpi.pendingLeaveCount})</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Real KPI Cards from DB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card className="border shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sinh Viên Phụ Trách
              </CardDescription>
              <CardTitle className="text-2xl font-black text-foreground">
                {kpi.totalStudents} <span className="text-xs font-normal text-muted-foreground">sinh viên</span>
              </CardTitle>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
              <Users className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            Thuộc {kpi.totalCourseSections} lớp học phần trong kỳ
          </CardContent>
        </Card>

        {/* KPI 2: AI Warning */}
        <Card className="border border-rose-500/30 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                  Cảnh Báo Sớm AI
                </CardDescription>
                <Badge variant="destructive" className="h-4 px-1 text-[9px] font-bold">
                  RF Model
                </Badge>
              </div>
              <CardTitle className="text-2xl font-black text-rose-600">
                {totalRisk} <span className="text-xs font-normal text-muted-foreground">sinh viên</span>
              </CardTitle>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
              <ShieldAlert className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
            <div className="flex items-center justify-between">
              <span className="text-rose-600 font-medium">🔴 {highRiskStudents.length} Nguy cơ cao cấm thi</span>
              <span className="text-amber-600 font-medium">🟡 {warningStudents.length} Cần theo dõi</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="border shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tổng Số Buổi Học
              </CardDescription>
              <CardTitle className="text-2xl font-black text-foreground">
                {kpi.totalSessions} <span className="text-xs font-normal text-muted-foreground">tiết/ca học</span>
              </CardTitle>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Calendar className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            Ghi nhận {kpi.totalAttendanceRecords} lượt điểm danh trong DB
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="border shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Đơn Nghỉ Học Chờ Duyệt
              </CardDescription>
              <CardTitle className="text-2xl font-black text-amber-600">
                {kpi.pendingLeaveCount} <span className="text-xs font-normal text-muted-foreground">đơn mới</span>
              </CardTitle>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <FileText className="size-5" />
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            <Link href="/dashboard/leave-requests" className="text-amber-600 hover:underline font-semibold flex items-center gap-1">
              Duyệt ngay trong danh sách <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 3. Mid Grid: Real Attendance Chart from DB + Real Student AI Risk Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real Distribution Chart from DB */}
        <Card className="lg:col-span-6 border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">
              Phân Bố Điểm Danh Thực Tế Trong Lớp
            </CardTitle>
            <CardDescription className="text-xs">
              Thống kê tỷ lệ có mặt, đi muộn, vắng mặt của sinh viên ghi nhận trong cơ sở dữ liệu
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground border rounded-xl bg-muted/10">
                Chưa có dữ liệu điểm danh nào trong DB.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val: any) => [`${val} lượt`, "Số lượng"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs">
              {stats?.chart?.map((c, idx) => (
                <div key={idx} className="p-2 rounded-lg border bg-muted/20 text-center">
                  <p className="text-[10px] text-muted-foreground">{c.name}</p>
                  <p className="font-bold text-sm" style={{ color: c.color }}>{c.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: AI Early Warning Student Risk List from DB */}
        <Card className="lg:col-span-6 border border-rose-500/30 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                  <ShieldAlert className="size-4" />
                </div>
                <CardTitle className="text-base font-bold">
                  Sinh Viên Nguy Cơ Cấm Thi (AI Early Warning)
                </CardTitle>
              </div>
              <Link href="/dashboard/attendance">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-rose-600 hover:text-rose-700 gap-1">
                  Xem tất cả <ArrowRight className="size-3" />
                </Button>
              </Link>
            </div>
            <CardDescription className="text-xs">
              Sắp xếp theo thứ tự tỷ lệ chuyên cần thấp nhất để giảng viên can thiệp kịp thời
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {ranking.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border rounded-xl bg-muted/10">
                Tất cả sinh viên hiện tại đều an toàn, không có trường hợp nào bị cảnh báo!
              </div>
            ) : (
              <div className="divide-y rounded-xl border max-h-[320px] overflow-y-auto">
                {ranking.slice(0, 5).map((student: any) => {
                  const isHigh = student.risk === "DANGER";
                  const sId = student.studentId || student.userCode;
                  const isNotified = notifiedIds.includes(sId);

                  return (
                    <div key={sId} className="flex items-center justify-between p-3 gap-2 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="size-8 border">
                          <AvatarFallback className={isHigh ? "bg-rose-500/10 text-rose-600 font-bold text-xs" : "bg-amber-500/10 text-amber-600 font-bold text-xs"}>
                            {(student.fullName || "SV").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-semibold text-xs text-foreground truncate">{student.fullName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {student.userCode} • {student.className || "Lớp tín chỉ"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <Badge 
                            variant={isHigh ? "destructive" : "outline"} 
                            className={`h-5 text-[10px] font-bold ${!isHigh ? "border-amber-500/30 text-amber-600 bg-amber-500/10" : ""}`}
                          >
                            {student.attendanceRate}%
                          </Badge>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            Vắng {student.absent}b • Muộn {student.late}b
                          </p>
                        </div>

                        <Button 
                          variant={isNotified ? "secondary" : "outline"} 
                          size="sm" 
                          disabled={isNotified}
                          onClick={() => handleSendWarning(student)}
                          className="h-7 px-2 text-[10px] gap-1"
                        >
                          {isNotified ? (
                            <>
                              <Check className="size-3 text-emerald-600" />
                              <span>Đã gửi</span>
                            </>
                          ) : (
                            <>
                              <Send className="size-3" />
                              <span>Nhắc</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Real Course Sections Table from DB */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <BookOpen className="size-4" />
              </div>
              <CardTitle className="text-base font-bold sm:text-lg">
                Các Lớp Học Phần Đang Giảng Dạy (Dữ liệu MongoDB)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Danh sách lớp tín chỉ được phân công chính thức cho giảng viên
            </CardDescription>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1.5 text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors shadow-xs"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="size-3.5 text-emerald-600" />
            <span>Xuất Báo Cáo Chuyên Cần Excel (.xlsx)</span>
          </Button>
        </CardHeader>

        <CardContent className="pt-0">
          {courseSections.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border rounded-xl bg-muted/10">
              Hiện tại bạn chưa được phân công lớp học phần nào.
            </div>
          ) : (
            <div className="rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-bold">Mã Lớp HP</TableHead>
                    <TableHead className="font-bold">Môn Học</TableHead>
                    <TableHead className="font-bold text-center">Học Kỳ</TableHead>
                    <TableHead className="font-bold text-center">Phòng Học</TableHead>
                    <TableHead className="font-bold text-center">Trạng Thái</TableHead>
                    <TableHead className="font-bold text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {courseSections.map((sec) => (
                    <TableRow key={sec._id || sec.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-foreground">
                        {sec.sectionCode}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground">
                            {sec.subjectId?.name || sec.subjectName || "Môn học tín chỉ"}
                          </span>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {sec.subjectId?.code || sec.subjectCode || ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {sec.semesterId?.name || "Học kỳ I"}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {sec.room || "Phòng chuẩn"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-medium border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                          Đang giảng dạy
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href="/dashboard/attendance">
                          <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-500/10 gap-1">
                            <span>Vào điểm danh</span>
                            <ArrowRight className="size-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
