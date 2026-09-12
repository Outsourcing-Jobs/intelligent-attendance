"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
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
  Info,
  Layers,
  Award
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/stores/auth-store";
import { statisticsService, StudentStatisticsResponse } from "@/services/statistics.service";
import { attendanceService, TodaySessionInfo } from "@/services/attendance.service";

export function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<StudentStatisticsResponse | null>(null);
  const [todaySessions, setTodaySessions] = useState<TodaySessionInfo[]>([]);
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const studentName = user?.fullName || user?.name || "Sinh viên";
  const userCode = user?.userCode || "SV";

  useEffect(() => {
    let isMounted = true;
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const [statsData, todayData, historyData] = await Promise.all([
          statisticsService.getStudentStatistics().catch(() => null),
          attendanceService.getTodaySessions().catch(() => []),
          attendanceService.getMyHistory().catch(() => []),
        ]);

        if (isMounted) {
          if (statsData) setStats(statsData);
          if (Array.isArray(todayData)) setTodaySessions(todayData);
          if (Array.isArray(historyData)) setMyHistory(historyData);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sinh viên từ DB:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStudentData();
    return () => {
      isMounted = false;
    };
  }, []);

  const kpi = stats?.kpi || {
    totalSessions: 0,
    present: 0,
    late: 0,
    absent: 0,
    excused: 0,
    attendanceRate: 100,
  };

  const chartData = stats?.chart?.filter(c => c.value > 0) || [];
  const subjects = stats?.subjects || [];

  // Determine overall student risk based on attendance rate
  const isHighRisk = kpi.attendanceRate < 80;
  const isWarning = kpi.attendanceRate >= 80 && kpi.attendanceRate < 90;

  return (
    <div className="@container/main flex flex-col gap-6 pb-8">
      {/* 1. Student Personal Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-blue-500/5 p-6 md:p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/15" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium text-xs py-0.5">
                <BookOpen className="size-3.5 mr-1" />
                Cổng Tra Cứu Chuyên Cần Cá Nhân
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                MSV: {userCode}
              </Badge>
              <span className="text-xs text-muted-foreground">• Học kỳ I • 2025 - 2026</span>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                Xin chào, <span className="text-blue-600 dark:text-blue-400">{studentName}</span>! 👋
              </h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Hồ sơ chuyên cần học tập cá nhân. Theo dõi lịch học hôm nay, quét mã QR điểm danh phòng học và giám sát tỷ lệ chuyên cần theo từng học phần.
              </p>
            </div>

            {/* AI Warning Status pill for this student */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5 rounded-md bg-background/80 px-2.5 py-1 border shadow-2xs">
                <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-foreground">Đánh giá Chuyên cần AI:</span>
                {isHighRisk ? (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <ShieldAlert className="size-3" /> Nguy cơ cấm thi ({kpi.attendanceRate}%)
                  </span>
                ) : isWarning ? (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="size-3" /> Cần chú ý chuyên cần ({kpi.attendanceRate}%)
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> An toàn ({kpi.attendanceRate}%)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 rounded-md bg-background/80 px-2.5 py-1 border shadow-2xs">
                <Info className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Quy chế thi: Vắng vượt quá 20% tổng số tiết sẽ bị cấm thi</span>
              </div>
            </div>
          </div>

          {/* Quick Actions for Student */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <Link href="/dashboard/attendance">
              <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 shadow-sm">
                <QrCode className="size-4" />
                <span>Quét Mã QR Điểm Danh</span>
                <ArrowRight className="size-3.5 ml-auto opacity-70" />
              </Button>
            </Link>

            <Link href="/dashboard/leave-requests">
              <Button variant="outline" className="w-full justify-start gap-2 font-medium text-xs h-9">
                <FileText className="size-4 text-amber-500" />
                <span>Nộp Đơn Xin Nghỉ Phép</span>
                <ArrowRight className="size-3.5 ml-auto opacity-70" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Student Attendance KPI Summary Cards (From Real DB) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border bg-card shadow-2xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tổng Số Buổi
            </CardDescription>
            <CardTitle className="text-2xl font-black text-foreground">{kpi.totalSessions}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0">
            Đã diễn ra học kỳ này
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-2xs border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Có Mặt Đúng Giờ
            </CardDescription>
            <CardTitle className="text-2xl font-black text-emerald-600">{kpi.present}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0 flex items-center gap-1">
            <CheckCircle2 className="size-3 text-emerald-600" /> Check-in hợp lệ
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-2xs border-amber-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Đi Muộn
            </CardDescription>
            <CardTitle className="text-2xl font-black text-amber-600">{kpi.late}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0 flex items-center gap-1">
            <Clock className="size-3 text-amber-600" /> Trừ 0.5đ chuyên cần
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-2xs border-rose-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              Vắng Không Phép
            </CardDescription>
            <CardTitle className="text-2xl font-black text-rose-600">{kpi.absent}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0 flex items-center gap-1">
            <XCircle className="size-3 text-rose-600" /> Nguy cơ trừ điểm & cấm thi
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-2xs border-blue-500/20 col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Có Phép (Excused)
            </CardDescription>
            <CardTitle className="text-2xl font-black text-blue-600">{kpi.excused}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-0 flex items-center gap-1">
            <FileText className="size-3 text-blue-600" /> Đơn đã phê duyệt
          </CardContent>
        </Card>
      </div>

      {/* 3. Mid Grid: Today's Sessions for this Student + Personal Attendance Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Class Sessions (DB Data) */}
        <Card className="lg:col-span-7 border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <Calendar className="size-4" />
                </div>
                <CardTitle className="text-base font-bold">Lịch Học Của Bạn Hôm Nay</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {todaySessions.length} ca học
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Các tiết học được phân công trong thời khóa biểu cá nhân của bạn ngày hôm nay
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {todaySessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-xl bg-muted/10">
                <CheckCircle2 className="size-10 text-emerald-500 mb-2 opacity-80" />
                <p className="font-semibold text-sm text-foreground">Hôm nay bạn không có lịch học!</p>
                <p className="text-xs text-muted-foreground mt-1">Hãy xem lại thời khóa biểu cả tuần hoặc ôn tập bài cũ nhé.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySessions.map((session, idx) => {
                  const subjectName = session.courseSection?.subjectId?.subjectName || "Học phần";
                  const subjectCode = session.courseSection?.subjectId?.subjectCode || session.courseSection?.sectionCode || "";
                  const isCheckedIn = Boolean(session.attendance?.checkInTime);
                  const status = session.attendance?.status;

                  return (
                    <div key={session._id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border bg-card/60 gap-3 hover:bg-muted/20 transition-colors">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600">{subjectCode}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-bold text-sm text-foreground truncate">{subjectName}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3 text-teal-600" /> Phòng {session.room}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3 text-blue-600" /> {session.startTime || `Tiết ${session.startPeriod}`} - {session.endTime || `Tiết ${session.startPeriod + session.numPeriods - 1}`}
                          </span>
                          {session.lecturer && (
                            <span>GV: <strong className="text-foreground">{session.lecturer.fullName}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                        {isCheckedIn ? (
                          <Badge className="h-6 gap-1 bg-emerald-500 text-white font-semibold text-xs">
                            <CheckCircle2 className="size-3" /> Đã điểm danh ({status === "late" ? "Đi muộn" : "Đúng giờ"})
                          </Badge>
                        ) : (
                          <Link href="/dashboard/attendance">
                            <Button size="sm" className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                              <QrCode className="size-3.5" />
                              <span>Điểm Danh Ngay</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Personal Attendance Rate Chart (Real DB Data) */}
        <Card className="lg:col-span-5 border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Tỷ Lệ Chuyên Cần Cá Nhân
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/30">
                {kpi.attendanceRate}%
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Tỷ lệ phân bổ trạng thái điểm danh thực tế được ghi nhận trong cơ sở dữ liệu
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {chartData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-muted-foreground border rounded-xl bg-muted/10">
                Chưa có dữ liệu điểm danh nào được ghi nhận.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: any) => [`${val} buổi`, "Số lượng"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Award className="size-3.5 text-amber-500" /> Tình trạng điểm chuyên cần:
              </p>
              <p className="text-[11px] leading-relaxed">
                {kpi.attendanceRate >= 90
                  ? "Xuất sắc! Bạn duy trì tỷ lệ chuyên cần rất tốt, đủ điều kiện đạt điểm tối đa môn học."
                  : kpi.attendanceRate >= 80
                    ? "Tốt! Bạn đáp ứng điều kiện dự thi, hãy cố gắng duy trì không vắng thêm tiết nào."
                    : "Cảnh báo! Tỷ lệ chuyên cần của bạn đang dưới ngưỡng 80%, có nguy cơ bị cấm thi theo quy chế đào tạo tín chỉ."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Subject Breakdown Table for this Student (Real DB Data) */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                <Layers className="size-4" />
              </div>
              <CardTitle className="text-base font-bold sm:text-lg">
                Các Học Phần Đang Đăng Ký & Chuyên Cần Chi Tiết
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Thống kê số buổi có mặt, đi muộn, vắng và tỷ lệ chuyên cần của bạn theo từng môn học
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {subjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border rounded-xl">
              Bạn chưa đăng ký lớp học phần nào trong học kỳ này.
            </div>
          ) : (
            <div className="rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-bold">Mã Lớp HP</TableHead>
                    <TableHead className="font-bold">Tên Môn Học</TableHead>
                    <TableHead className="font-bold text-center">Tổng Buổi</TableHead>
                    <TableHead className="font-bold text-center">Có Mặt</TableHead>
                    <TableHead className="font-bold text-center">Đi Muộn</TableHead>
                    <TableHead className="font-bold text-center">Vắng</TableHead>
                    <TableHead className="font-bold text-center">Có Phép</TableHead>
                    <TableHead className="font-bold text-center">Tỷ Lệ Chuyên Cần</TableHead>
                    <TableHead className="font-bold text-center">Trạng Thái Quy Chế</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {subjects.map((sub) => {
                    const isSubDanger = sub.rate < 80;
                    const isSubWarning = sub.rate >= 80 && sub.rate < 90;

                    return (
                      <TableRow key={sub.subjectId || sub.sectionCode} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-foreground">
                          {sub.sectionCode}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground">{sub.subjectName}</span>
                            <p className="font-mono text-[10px] text-muted-foreground">{sub.subjectCode}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{sub.totalSessions}</TableCell>
                        <TableCell className="text-center font-semibold text-emerald-600">{sub.present}</TableCell>
                        <TableCell className="text-center font-semibold text-amber-600">{sub.late}</TableCell>
                        <TableCell className="text-center font-semibold text-rose-600">{sub.absent}</TableCell>
                        <TableCell className="text-center font-medium text-blue-600">{sub.excused}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${isSubDanger ? "text-rose-600" : isSubWarning ? "text-amber-600" : "text-emerald-600"}`}>
                            {sub.rate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {isSubDanger ? (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px] font-bold gap-1">
                              <ShieldAlert className="size-2.5" /> Nguy cơ cấm thi
                            </Badge>
                          ) : isSubWarning ? (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold border-amber-500/30 text-amber-600 bg-amber-500/10">
                              Cần theo dõi
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium border-emerald-500/30 text-emerald-600 bg-emerald-500/10 gap-1">
                              <CheckCircle2 className="size-2.5" /> Đủ điều kiện thi
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Personal Attendance History (From DB my-history) */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <Clock className="size-4" />
              </div>
              <CardTitle className="text-base font-bold sm:text-lg">
                Lịch Sử Điểm Danh Gần Đây Của Bạn
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Các lần check-in hợp lệ qua GPS phòng học hoặc mã QR động được ghi nhận
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {myHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border rounded-xl">
              Chưa có bản ghi điểm danh nào trong lịch sử cá nhân của bạn.
            </div>
          ) : (
            <div className="rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="text-xs">
                    <TableHead className="font-bold">Ngày Học</TableHead>
                    <TableHead className="font-bold">Môn Học / Buổi Học</TableHead>
                    <TableHead className="font-bold text-center">Giờ Check-in</TableHead>
                    <TableHead className="font-bold text-center">Phương Thức</TableHead>
                    <TableHead className="font-bold text-center">Khoảng Cách GPS</TableHead>
                    <TableHead className="font-bold text-center">Trạng Thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {myHistory.slice(0, 10).map((record, idx) => {
                    const session = record.classSessionId;
                    const dateStr = session?.date ? new Date(session.date).toLocaleDateString("vi-VN") : "Hôm nay";
                    const checkInTime = record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "--:--";
                    const isPresent = record.status === "present";
                    const isLate = record.status === "late";
                    const isExcused = record.status === "excused";

                    return (
                      <TableRow key={record._id || idx} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-foreground">{dateStr}</TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground">
                              {session?.courseSectionId?.subjectId?.name || session?.courseSectionId?.sectionCode || "Buổi học tín chỉ"}
                            </span>
                            <p className="text-[10px] text-muted-foreground">Phòng {session?.room || "Phòng học"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono font-semibold">{checkInTime}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {record.checkInMethod === "qr" ? "Mã QR động" : "GPS Geofence"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono text-[11px] text-muted-foreground">
                          {record.distanceMeters != null ? `${Math.round(record.distanceMeters)}m` : "--"}
                        </TableCell>
                        <TableCell className="text-center">
                          {isPresent ? (
                            <Badge className="h-5 px-1.5 text-[10px] bg-emerald-500 font-bold gap-0.5">
                              <CheckCircle2 className="size-2.5" /> Đúng giờ
                            </Badge>
                          ) : isLate ? (
                            <Badge className="h-5 px-1.5 text-[10px] bg-amber-500 font-bold gap-0.5">
                              <Clock className="size-2.5" /> Đi muộn
                            </Badge>
                          ) : isExcused ? (
                            <Badge className="h-5 px-1.5 text-[10px] bg-blue-500 font-bold gap-0.5">
                              <FileText className="size-2.5" /> Có phép
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px] font-bold">
                              Vắng
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
