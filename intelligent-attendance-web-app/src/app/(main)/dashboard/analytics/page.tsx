"use client";

import { useEffect, useState } from "react";
import {
  BarChart2,
  PieChart as PieChartIcon,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BookOpen,
  Calendar,
  RefreshCw,
  Award,
  ShieldAlert,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Layers,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { exportRiskRankingToExcel } from "@/lib/excel-export";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/auth-store";
import { statisticsService } from "@/services/statistics.service";

export default function AnalyticsDashboardPage() {
  const { user } = useAuthStore();
  const rawRole = (user?.roleCode || (typeof user?.role === "string" ? user.role : user?.role?.code) || "").toLowerCase();

  const isAdmin = rawRole.includes("admin") || rawRole.includes("super_admin");
  const isTeacher = (rawRole.includes("teacher") || rawRole.includes("lecturer")) && !isAdmin;
  const isStudent = !isAdmin && !isTeacher;

  const initialRole: "student" | "teacher" | "admin" = isAdmin ? "admin" : isTeacher ? "teacher" : "student";
  const [roleMode, setRoleMode] = useState<"student" | "teacher" | "admin">(initialRole);
  const [loading, setLoading] = useState(false);

  // Pagination state for Student Risk Ranking Table
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRisk, setFilterRisk] = useState<"ALL" | "DANGER" | "WARNING" | "NORMAL">("ALL");
  const itemsPerPage = 5;

  // Sync roleMode whenever user profile loads/changes
  useEffect(() => {
    if (!user) return;
    const targetRole = isAdmin ? "admin" : isTeacher ? "teacher" : "student";
    setRoleMode(targetRole);
  }, [user, isAdmin, isTeacher]);

  // Data states
  const [studentStats, setStudentStats] = useState<any | null>(null);
  const [teacherStats, setTeacherStats] = useState<any | null>(null);
  const [adminStats, setAdminStats] = useState<any | null>(null);

  const fetchAnalytics = async (mode?: "student" | "teacher" | "admin") => {
    if (!user) return;
    const currentTargetMode = mode || roleMode;
    setLoading(true);
    try {
      if (currentTargetMode === "student") {
        const data = await statisticsService.getStudentStatistics();
        setStudentStats(data);
      } else if (currentTargetMode === "teacher") {
        const data = await statisticsService.getTeacherStatistics();
        setTeacherStats(data);
      } else {
        const data = await statisticsService.getAdminStatistics();
        setAdminStats(data);
      }
    } catch (err: any) {
      console.warn("Lỗi khi tải dữ liệu thống kê chuyên cần:", err);
      // Chỉ hiển thị toast nếu không phải là lượt tải ban đầu
      if (currentTargetMode === (isAdmin ? "admin" : isTeacher ? "teacher" : "student")) {
        toast.error("Không thể tải dữ liệu thống kê chuyên cần.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, roleMode]);

  const handleExportExcel = () => {
    const students = teacherStats?.studentRanking || adminStats?.studentRanking || [];
    if (!students || students.length === 0) {
      toast.error("Chưa có danh sách sinh viên để xuất Excel.");
      return;
    }
    try {
      const fileName = exportRiskRankingToExcel(students);
      toast.success(`Đã xuất báo cáo rủi ro chuyên cần: ${fileName}`, {
        description: `Tệp đã được tải xuống máy tính (${students.length} sinh viên).`,
      });
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi xuất file Excel.");
    }
  };

  const getRiskBadge = (risk: string, rate: number) => {
    switch (risk) {
      case "NORMAL":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 font-semibold">
            <CheckCircle2 className="size-3" /> An toàn ({rate}%)
          </Badge>
        );
      case "WARNING":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 font-semibold">
            <AlertTriangle className="size-3" /> Cảnh báo ({rate}%)
          </Badge>
        );
      case "DANGER":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 gap-1 font-semibold animate-pulse">
            <ShieldAlert className="size-3" /> Nguy cơ cấm thi ({rate}%)
          </Badge>
        );
      default:
        return <Badge variant="secondary">{rate}%</Badge>;
    }
  };

  // Mock trend data for Area Chart
  const trendData = [
    { week: "Tuần 1", present: 95, late: 3, absent: 2 },
    { week: "Tuần 2", present: 92, late: 5, absent: 3 },
    { week: "Tuần 3", present: 88, late: 7, absent: 5 },
    { week: "Tuần 4", present: 85, late: 8, absent: 7 },
    { week: "Tuần 5", present: 89, late: 6, absent: 5 },
    { week: "Tuần 6", present: 94, late: 4, absent: 2 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="size-7 text-blue-600" /> Thống Kê & Báo Cáo Rủi Ro Chuyên Cần
          </h1>
          <p className="text-sm text-muted-foreground">
            Trung tâm giám sát toàn diện: Phân tích rủi ro cấm thi, biểu đồ miền xu hướng và quản lý đơn xin nghỉ phép.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <Tabs value={roleMode} onValueChange={(v) => setRoleMode(v as any)}>
              <TabsList className="grid grid-cols-3 w-[320px]">
                <TabsTrigger value="student">Sinh viên</TabsTrigger>
                <TabsTrigger value="teacher">Giảng viên</TabsTrigger>
                <TabsTrigger value="admin">Quản trị viên</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 text-xs font-semibold">
              Góc nhìn: {isStudent ? "Sinh viên" : "Giảng viên"}
            </Badge>
          )}

          <Button variant="outline" size="sm" onClick={() => fetchAnalytics()} disabled={loading}>
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>

          {(roleMode === "teacher" || roleMode === "admin") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="mr-2 size-4 text-emerald-600" />
              Xuất Báo Cáo Excel (.xlsx)
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex py-20 justify-center items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="size-5 animate-spin text-blue-600" /> Đang tổng hợp dữ liệu rủi ro chuyên cần...
        </div>
      ) : (
        <>
          {/* STUDENT DASHBOARD VIEW */}
          {roleMode === "student" && studentStats && (
            <div className="space-y-6">
              {/* KPI Strip */}
              <div className="grid gap-4 md:grid-cols-5">
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Tỷ Lệ Chuyên Cần</CardTitle>
                    <Award className="size-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">
                      {studentStats.kpi.attendanceRate}%
                    </div>
                    <Progress value={studentStats.kpi.attendanceRate} className="h-1.5 mt-2 bg-emerald-100" />
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-400 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Đã Tham Gia</CardTitle>
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {studentStats.kpi.present + studentStats.kpi.late}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {studentStats.kpi.present} Đúng giờ | {studentStats.kpi.late} Muộn
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Nghỉ Có Phép</CardTitle>
                    <Clock className="size-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {studentStats.kpi.excused}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Đã chuyển điểm danh EXCUSED
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-rose-500 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Vắng Không Phép</CardTitle>
                    <XCircle className="size-4 text-rose-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-rose-600">
                      {studentStats.kpi.absent}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Tránh vắng quá 20% học phần
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Tổng Đơn Xin Nghỉ</CardTitle>
                    <FileText className="size-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {studentStats.kpi.leaveStats?.total || 0}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {studentStats.kpi.leaveStats?.approved || 0} Đã duyệt | {studentStats.kpi.leaveStats?.pending || 0} Chờ
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Area Chart & Subject Table */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <PieChartIcon className="size-4 text-blue-600" /> Phân Phối Trạng Thái Điểm Danh
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[220px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={studentStats.chart}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {studentStats.chart.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BookOpen className="size-4 text-blue-600" /> Chi Tiết Chuyên Cần Theo Môn Học
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs">Môn Học</TableHead>
                            <TableHead className="text-xs text-center">Tổng Buổi</TableHead>
                            <TableHead className="text-xs text-center">Có Mặt</TableHead>
                            <TableHead className="text-xs text-center">Có Phép</TableHead>
                            <TableHead className="text-xs text-center">Vắng</TableHead>
                            <TableHead className="text-xs text-right">Tỷ Lệ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentStats.subjects.map((sub: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium text-xs">
                                <div>{sub.subjectName}</div>
                                <div className="text-[10px] text-muted-foreground">Mã LHP: {sub.sectionCode}</div>
                              </TableCell>
                              <TableCell className="text-center text-xs font-semibold">{sub.totalSessions}</TableCell>
                              <TableCell className="text-center text-xs text-emerald-600 font-medium">{sub.present}</TableCell>
                              <TableCell className="text-center text-xs text-blue-600 font-medium">{sub.excused}</TableCell>
                              <TableCell className="text-center text-xs text-rose-600 font-medium">{sub.absent}</TableCell>
                              <TableCell className="text-right text-xs font-bold">
                                <div className="flex items-center justify-end gap-2">
                                  <span>{sub.rate}%</span>
                                  <Progress value={sub.rate} className="w-12 h-1.5" />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TEACHER DASHBOARD VIEW - XẾP LOẠI RỦI RO & BIỂU ĐỒ TRỰC QUAN */}
          {roleMode === "teacher" && teacherStats && (
            <div className="space-y-6">
              {/* KPI Cards Strip */}
              <div className="grid gap-4 md:grid-cols-5">
                <Card className="shadow-sm border-l-4 border-l-blue-600">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Tổng Sinh Viên</CardTitle>
                    <Users className="size-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teacherStats.kpi.totalStudents}</div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-purple-600">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Lớp HP Phụ Trách</CardTitle>
                    <Layers className="size-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teacherStats.kpi.totalCourseSections}</div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-emerald-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Sinh Viên An Toàn</CardTitle>
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600">
                      {teacherStats.studentRanking.filter((s: any) => s.risk === "NORMAL").length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-amber-500">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Cảnh Báo Vắng Mặt</CardTitle>
                    <AlertTriangle className="size-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {teacherStats.studentRanking.filter((s: any) => s.risk === "WARNING").length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-rose-600 shadow-sm bg-rose-50/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold text-rose-700">Nguy Cơ Cấm Thi</CardTitle>
                    <ShieldAlert className="size-4 text-rose-600 animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-extrabold text-rose-600">
                      {teacherStats.studentRanking.filter((s: any) => s.risk === "DANGER").length}
                    </div>
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">Cần đôn đốc khẩn cấp</p>
                  </CardContent>
                </Card>
              </div>

              {/* Visual Charts Row: AreaChart (Xu hướng) + BarChart (Phân bổ Rủi ro) */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Donut Chart: Cơ Cấu Điểm Danh Toàn Bộ Sinh Viên (Thực Tế DB) */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <PieChartIcon className="size-5 text-emerald-600" /> Biểu Đồ Tròn: Tỷ Lệ Điểm Danh Thực Tế (Dữ liệu DB)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Phân bổ toàn bộ số lượt có mặt, đi muộn, có phép và vắng mặt của sinh viên
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <RechartsTooltip />
                          <Legend verticalAlign="bottom" height={36} />
                          <Pie
                            data={teacherStats.chart}
                            cx="50%"
                            cy="45%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                          >
                            {teacherStats.chart.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Bar Chart: Phân bổ mức độ rủi ro */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <BarChart2 className="size-5 text-rose-500" /> Biểu Đồ Cột: Phân Bổ Mức Độ Rủi Ro Sinh Viên
                    </CardTitle>
                    <CardDescription className="text-xs">
                      So sánh số lượng sinh viên thuộc các phân vùng an toàn, cảnh báo và rủi ro cao.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[260px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: "An toàn (≥80%)",
                              count: teacherStats.studentRanking.filter((s: any) => s.risk === "NORMAL").length,
                              fill: "#10B981",
                            },
                            {
                              name: "Cảnh báo (60-79%)",
                              count: teacherStats.studentRanking.filter((s: any) => s.risk === "WARNING").length,
                              fill: "#F59E0B",
                            },
                            {
                              name: "Nguy cơ cấm thi (<60%)",
                              count: teacherStats.studentRanking.filter((s: any) => s.risk === "DANGER").length,
                              fill: "#EF4444",
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} domain={[0, 'dataMax + 4']} />
                          <RechartsTooltip />
                          <Bar
                            dataKey="count"
                            name="Số lượng sinh viên"
                            radius={[6, 6, 0, 0]}
                            label={{ position: "top", fill: "#374151", fontSize: 12, fontWeight: 700, formatter: (val: any) => `${val} SV` }}
                          >
                            <Cell fill="#10B981" />
                            <Cell fill="#F59E0B" />
                            <Cell fill="#EF4444" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Student Risk Ranking Table With Pagination */}
              <Card className="shadow-sm border-t-4 border-t-rose-500">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <ShieldAlert className="size-5 text-rose-500" /> Bảng Phân Tích & Xếp Loại Rủi Ro Chuyên Cần
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Danh sách chi tiết được sắp xếp từ tỷ lệ nghỉ học cao nhất đến thấp nhất để kịp thời can thiệp.
                      </CardDescription>
                    </div>

                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 self-start sm:self-auto">
                      Tổng số: {teacherStats.studentRanking.length} Sinh viên
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Filter tabs by Risk Category */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">Bộ lọc danh sách:</span>
                    <Button
                      variant={filterRisk === "ALL" ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => { setFilterRisk("ALL"); setCurrentPage(1); }}
                    >
                      Tất cả ({teacherStats.studentRanking.length})
                    </Button>
                    <Button
                      variant={filterRisk === "DANGER" ? "destructive" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => { setFilterRisk("DANGER"); setCurrentPage(1); }}
                    >
                      Nguy cơ cấm thi ({teacherStats.studentRanking.filter((s: any) => s.risk === "DANGER").length})
                    </Button>
                    <Button
                      variant={filterRisk === "NORMAL" ? "default" : "outline"}
                      size="sm"
                      className={`h-7 text-xs ${filterRisk === "NORMAL" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"}`}
                      onClick={() => { setFilterRisk("NORMAL"); setCurrentPage(1); }}
                    >
                      An toàn ({teacherStats.studentRanking.filter((s: any) => s.risk === "NORMAL").length})
                    </Button>
                    <Button
                      variant={filterRisk === "WARNING" ? "default" : "outline"}
                      size="sm"
                      className={`h-7 text-xs ${filterRisk === "WARNING" ? "bg-amber-600 hover:bg-amber-700 text-white" : "border-amber-600 text-amber-700 hover:bg-amber-50"}`}
                      onClick={() => { setFilterRisk("WARNING"); setCurrentPage(1); }}
                    >
                      Cảnh báo ({teacherStats.studentRanking.filter((s: any) => s.risk === "WARNING").length})
                    </Button>
                  </div>

                  {(() => {
                    const displayedRanking = teacherStats.studentRanking.filter((s: any) => {
                      if (filterRisk === "ALL") return true;
                      return s.risk === filterRisk;
                    });
                    const totalPages = Math.ceil(displayedRanking.length / itemsPerPage) || 1;
                    const paginated = displayedRanking.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                    return (
                      <>
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="text-xs">STT</TableHead>
                                <TableHead className="text-xs">Sinh Viên</TableHead>
                                <TableHead className="text-xs">Lớp Học Phần</TableHead>
                                <TableHead className="text-xs text-center">Tổng Buổi</TableHead>
                                <TableHead className="text-xs text-center">Có Mặt</TableHead>
                                <TableHead className="text-xs text-center">Có Phép</TableHead>
                                <TableHead className="text-xs text-center">Vắng Mặt</TableHead>
                                <TableHead className="text-xs text-right">Trạng Thái Rủi Ro</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginated.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={8} className="text-center py-6 text-xs text-muted-foreground">
                                    Không có sinh viên nào thuộc nhóm rủi ro này.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                paginated.map((st: any, idx: number) => {
                                  const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                                  return (
                                    <TableRow key={st.studentId} className={st.risk === "DANGER" ? "bg-rose-50/40" : ""}>
                                      <TableCell className="text-xs font-semibold text-muted-foreground">{globalIndex}</TableCell>
                                      <TableCell>
                                        <div className="font-semibold text-xs">{st.fullName}</div>
                                        <div className="text-[11px] text-muted-foreground">MSSV: {st.userCode}</div>
                                      </TableCell>
                                      <TableCell className="text-xs font-medium">{st.className}</TableCell>
                                      <TableCell className="text-center text-xs font-bold">{st.totalSessions}</TableCell>
                                      <TableCell className="text-center text-xs text-emerald-600 font-semibold">
                                        {st.present + (st.late || 0)}
                                        {st.late > 0 && <span className="text-[10px] text-amber-600 block">({st.late} muộn)</span>}
                                      </TableCell>
                                      <TableCell className="text-center text-xs text-blue-600 font-semibold">{st.excused || 0}</TableCell>
                                      <TableCell className="text-center text-xs text-rose-600 font-semibold">{st.absent}</TableCell>
                                      <TableCell className="text-right">
                                        {getRiskBadge(st.risk, st.attendanceRate)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })
                              )}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Table Pagination Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-xs text-muted-foreground">
                            Hiển thị {displayedRanking.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
                            {Math.min(currentPage * itemsPerPage, displayedRanking.length)} trong số{" "}
                            {displayedRanking.length} sinh viên {filterRisk !== "ALL" ? `(đã lọc)` : ""}
                          </p>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="size-4 mr-1" /> Trang trước
                            </Button>
                            <span className="text-xs font-semibold px-2">
                              Trang {currentPage} / {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                              disabled={currentPage >= totalPages}
                            >
                              Trang sau <ChevronRight className="size-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ADMIN DASHBOARD VIEW - CHỈ SỐ TOÀN DIỆN HỆ THỐNG */}
          {roleMode === "admin" && adminStats && (
            <div className="space-y-6">
              {/* Admin Comprehensive KPI Cards */}
              <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
                <Card className="shadow-sm border-l-4 border-l-blue-600 col-span-1">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                      Sinh Viên <GraduationCap className="size-3.5 text-blue-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold">{adminStats.kpi.totalStudents}</div>
                    <span className="text-[10px] text-muted-foreground">Học sinh toàn trường</span>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-emerald-600 col-span-1">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                      Giảng Viên <Award className="size-3.5 text-emerald-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold">{adminStats.kpi.totalTeachers}</div>
                    <span className="text-[10px] text-muted-foreground">Cán bộ giảng dạy</span>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-purple-600 col-span-1">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                      Môn Học <BookOpen className="size-3.5 text-purple-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold">{adminStats.kpi.totalSubjects}</div>
                    <span className="text-[10px] text-muted-foreground">Chương trình đào tạo</span>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-indigo-600 col-span-1">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                      Lớp Học Phần <Layers className="size-3.5 text-indigo-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold">{adminStats.kpi.totalCourseSections}</div>
                    <span className="text-[10px] text-muted-foreground">Lớp học phần mở</span>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-teal-600 col-span-1">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                      Buổi Học <Calendar className="size-3.5 text-teal-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold">{adminStats.kpi.totalSessions}</div>
                    <span className="text-[10px] text-muted-foreground">Lịch dạy đã tổ chức</span>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-cyan-600 col-span-1">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                      Lượt Điểm Danh <Activity className="size-3.5 text-cyan-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold">{adminStats.kpi.totalAttendanceRecords}</div>
                    <span className="text-[10px] text-muted-foreground">Bản ghi quét thẻ / AI</span>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-l-4 border-l-amber-500 col-span-1">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                      Đơn Xin Nghỉ <FileText className="size-3.5 text-amber-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="text-xl font-bold text-amber-600">{adminStats.kpi.totalLeaveRequests}</div>
                    <span className="text-[10px] text-amber-700 font-semibold">{adminStats.kpi.pendingLeaveRequests} Đơn chờ duyệt</span>
                  </CardContent>
                </Card>
              </div>

              {/* Admin Multi-Chart Dashboard */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <BarChart2 className="size-5 text-blue-600" /> Biểu Đồ Thống Kê Điểm Danh Toàn Hệ Thống
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Phân bổ số lượt điểm danh theo trạng thái tham gia lớp học.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={adminStats.chart}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <PieChartIcon className="size-5 text-purple-600" /> Biểu Đồ Thống Kê Loại Đơn Xin Nghỉ Phép
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Phân bổ các loại đơn xin nghỉ phép trong toàn hệ thống.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={adminStats.leaveTypeChart || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, percent }: any) => `${name} (${(((percent ?? 0) * 100)).toFixed(0)}%)`}

                          >
                            {(adminStats.leaveTypeChart || []).map((entry: any, index: number) => (
                              <Cell key={`cell-leave-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
