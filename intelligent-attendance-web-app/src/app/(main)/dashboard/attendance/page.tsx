"use client";

import { useEffect, useState, useCallback } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  attendanceService,
  AttendanceConfig,
  TodaySessionInfo,
  AttendanceReportResponse,
} from "@/services/attendance.service";
import { courseSectionService } from "@/services/academic.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wifi,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Navigation,
  ShieldCheck,
  Clock,
  BookOpen,
  User,
  MapPin,
  LogIn,
  LogOut,
  FileSpreadsheet,
  Search,
  Filter,
  Users,
  AlertTriangle,
  UserX,
  QrCode,
  Camera,
  Tv,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { QrProjectorModal } from "./_components/lecturer/QrProjectorModal";
import { QrScannerModal } from "./_components/student/QrScannerModal";


export default function AttendancePage() {
  const user = useAuthStore((state) => state.user);
  const roleCode =
    user?.roleCode ||
    (typeof user?.role === "object" ? user?.role?.code : typeof user?.roleId === "object" ? (user?.roleId as any)?.code : "");
  const isAdminOrTeacher = roleCode === "admin" || roleCode === "teacher" || roleCode === "lecturer";

  const { latitude, longitude, accuracy, error: geoError, loading: geoLoading, getLocation } = useGeolocation();
  const [config, setConfig] = useState<AttendanceConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Today Sessions State
  const [sessions, setSessions] = useState<TodaySessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Form State
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  // Admin Config Form State
  const [adminForm, setAdminForm] = useState<Partial<AttendanceConfig>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [adminMsg, setAdminMsg] = useState("");

  // Report Tab State (Admin & Teacher)
  const [reportData, setReportData] = useState<AttendanceReportResponse | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [courseSectionsList, setCourseSectionsList] = useState<any[]>([]);
  const [filterSectionId, setFilterSectionId] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");

  // QR Modals State
  const [selectedProjectorSession, setSelectedProjectorSession] = useState<any | null>(null);
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);

  const [selectedScanSession, setSelectedScanSession] = useState<TodaySessionInfo | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);


  const loadData = async () => {
    try {
      setLoadingConfig(true);
      setLoadingSessions(true);
      const [cfgRes, sessionRes] = await Promise.all([
        attendanceService.getConfig(),
        attendanceService.getTodaySessions(),
      ]);
      setConfig(cfgRes);
      setAdminForm(cfgRes);
      setSessions(sessionRes);
    } catch (err: any) {
      console.error("Lỗi khi tải thông tin điểm danh:", err);
    } finally {
      setLoadingConfig(false);
      setLoadingSessions(false);
    }
  };

  const loadReportData = useCallback(async () => {
    if (!isAdminOrTeacher) return;
    try {
      setLoadingReport(true);
      const res = await attendanceService.getReport({
        courseSectionId: filterSectionId,
        date: filterDate || undefined,
        status: filterStatus,
        search: filterSearch || undefined,
      });
      setReportData(res);
    } catch (err: any) {
      console.error("Lỗi khi tải báo cáo điểm danh:", err);
    } finally {
      setLoadingReport(false);
    }
  }, [isAdminOrTeacher, filterSectionId, filterDate, filterStatus, filterSearch]);

  const loadCourseSections = async () => {
    if (!isAdminOrTeacher) return;
    try {
      const res = await courseSectionService.getCourseSections();
      setCourseSectionsList(res || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lớp học phần:", err);
    }
  };


  useEffect(() => {
    loadData();
    getLocation();
    if (isAdminOrTeacher) {
      loadCourseSections();
      loadReportData();
    }
  }, [getLocation, isAdminOrTeacher, loadReportData]);

  const handleAction = async (session: TodaySessionInfo, isCheckOut: boolean) => {
    setActionResult(null);

    let currentLat = latitude;
    let currentLng = longitude;
    let currentAcc = accuracy;

    // Nếu chưa có vị trí GPS trong state, tự động lấy GPS trực tiếp thời gian thực
    if (config?.requireLocationCheck && (!currentLat || !currentLng)) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            return reject(new Error("Trình duyệt của bạn không hỗ trợ định vị GPS."));
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });
        currentLat = pos.coords.latitude;
        currentLng = pos.coords.longitude;
        currentAcc = pos.coords.accuracy;
      } catch (err: any) {
        setActionResult({
          success: false,
          message: "Chưa xác định được vị trí GPS. Vui lòng bật GPS trên thiết bị và cho phép trình duyệt truy cập vị trí.",
        });
        return;
      }
    }

    try {
      setSubmitting(true);
      const courseSectionId = session.courseSection?._id || "";
      const reqData = {
        classSessionId: session._id,
        courseSectionId,
        userLat: currentLat || undefined,
        userLng: currentLng || undefined,
        accuracy: currentAcc || undefined,
        note: note.trim() || undefined,
      };

      const res = isCheckOut
        ? await attendanceService.checkOut(reqData)
        : await attendanceService.checkIn(reqData);

      setActionResult({
        success: true,
        message: res.message,
        details: res,
      });

      // Reload dữ liệu buổi học
      const updatedSessions = await attendanceService.getTodaySessions();
      setSessions(updatedSessions);
    } catch (err: any) {
      setActionResult({
        success: false,
        message: err.message || (isCheckOut ? "Check-out thất bại." : "Check-in thất bại."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      setAdminMsg("");
      const payload = {
        gracePeriodMinutes: adminForm.gracePeriodMinutes,
        lateThresholdMinutes: adminForm.lateThresholdMinutes,
        allowSelfCheckIn: adminForm.allowSelfCheckIn,
        allowedPublicIps: adminForm.allowedPublicIps,
        latitude: adminForm.latitude,
        longitude: adminForm.longitude,
        allowedRadiusMeters: adminForm.allowedRadiusMeters,
        requireWifiCheck: adminForm.requireWifiCheck,
        requireLocationCheck: adminForm.requireLocationCheck,
        isActive: adminForm.isActive,
      };
      const updated = await attendanceService.updateConfig(payload);
      setConfig(updated);
      setAdminMsg("Cập nhật cấu hình điểm danh thành công!");
    } catch (err: any) {
      setAdminMsg("Lỗi khi cập nhật cấu hình: " + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Hệ Thống Điểm Danh Môn Học</h1>
        <p className="text-muted-foreground">
          Điểm danh vào/ra tự động theo khung giờ tiết học với xác thực WiFi & Bán kính GPS (~10-20m).
        </p>
      </div>

      <Tabs defaultValue="checkin" className="w-full">
        {isAdminOrTeacher ? (
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="checkin">Điểm Danh Tiết Học</TabsTrigger>
            <TabsTrigger value="report">Báo Cáo Điểm Danh (Admin / GV)</TabsTrigger>
            <TabsTrigger value="config">Cấu Hình Mạng & GPS</TabsTrigger>
          </TabsList>
        ) : null}

        {/* TAB 1: SMART CHECK-IN / CHECK-OUT */}
        <TabsContent value="checkin" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Card 1: WiFi */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Xác Thực Mạng WiFi</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mạng WiFi nội bộ:</span>
                  <Badge variant={config?.requireWifiCheck ? "default" : "secondary"}>
                    {config?.requireWifiCheck ? "Bắt buộc" : "Không bắt buộc"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Hệ thống tự động đối chiếu IP Public của mạng WiFi khi bạn thực hiện điểm danh.
                </p>
              </CardContent>
            </Card>

            {/* Status Card 2: GPS */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Định Vị GPS (~10-20m)</CardTitle>
                <Navigation className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trạng thái GPS:</span>
                  {geoLoading ? (
                    <Badge variant="outline" className="animate-pulse">Đang lấy vị trí...</Badge>
                  ) : latitude && longitude ? (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50">
                      Đã lấy vị trí (±{Math.round(accuracy || 0)}m)
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Chưa có vị trí</Badge>
                  )}
                </div>

                <Button variant="outline" size="sm" onClick={getLocation} className="w-full h-8 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" /> Cập Nhật Vị Trí GPS
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Action Result Alert */}
          {actionResult && (
            <Alert variant={actionResult.success ? "default" : "destructive"}>
              {actionResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription className="space-y-1">
                <div className="font-semibold">{actionResult.message}</div>
                {actionResult.details && (
                  <div className="text-xs text-muted-foreground">
                    Địa chỉ IP: {actionResult.details.clientIp} | Khoảng cách tới điểm mốc: {actionResult.details.distanceMeters !== null ? `${actionResult.details.distanceMeters}m` : "N/A"}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* LIST OF TODAY'S SESSIONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Tiết Học Của Bạn</h2>
              <Button variant="ghost" size="sm" onClick={loadData} disabled={loadingSessions}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loadingSessions ? "animate-spin" : ""}`} /> Làm mới
              </Button>
            </div>

            {loadingSessions ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Đang tải thông tin tiết học hôm nay...
                </CardContent>
              </Card>
            ) : sessions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Không tìm thấy tiết học nào hôm nay.
                </CardContent>
              </Card>
            ) : (
              sessions.map((session) => {
                const subjectName = session.courseSection?.subjectId?.subjectName || "Môn học";
                const sectionCode = session.courseSection?.sectionCode || "";
                const lecturerName = session.lecturer?.fullName || "Giảng viên";
                const { isCheckedIn, isCheckedOut, checkInTime, checkOutTime, status } = session.attendance;

                return (
                  <Card key={session._id} className="overflow-hidden border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            {subjectName}
                            {sectionCode && <Badge variant="secondary">{sectionCode}</Badge>}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> Phòng: {session.room}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" /> GV: {lecturerName}
                            </span>
                          </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-sm font-medium py-1 px-3">
                            <Clock className="h-3.5 w-3.5 mr-1 text-primary" />
                            Tiết {session.startPeriod} - {session.startPeriod + session.numPeriods - 1} ({session.startTime} - {session.endTime})
                          </Badge>

                          {isAdminOrTeacher && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProjectorSession(session);
                                setIsProjectorOpen(true);
                              }}
                              className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 h-8 text-xs font-semibold gap-1.5 shadow-xs"
                            >
                              <Tv className="h-3.5 w-3.5" /> Chiếu Mã QR
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 border-t pt-4 bg-muted/20">
                      {/* TRẠNG THÁI HIỆN TẠI */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                        <div>
                          Vào: {checkInTime ? <span className="text-emerald-600 font-semibold">{new Date(checkInTime).toLocaleTimeString('vi-VN')}</span> : "Chưa điểm danh vào"}
                        </div>
                        <div>
                          Ra: {checkOutTime ? <span className="text-emerald-600 font-semibold">{new Date(checkOutTime).toLocaleTimeString('vi-VN')}</span> : "Chưa điểm danh ra"}
                        </div>
                        {status !== 'none' && (
                          <div>
                            Trạng thái:{" "}
                            <Badge variant={status === 'late' || status === 'early_leave' ? "destructive" : "default"}>
                              {status === 'late' ? 'Đi muộn' : status === 'early_leave' ? 'Về sớm' : status === 'excused' ? 'Có phép' : 'Đúng giờ'}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* KHU VỰC NHẬP GHI CHÚ VÀ NÚT BẤM */}
                      {(!isCheckedIn || !isCheckedOut) ? (
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <Label htmlFor={`note-${session._id}`} className="text-xs">
                              Ghi chú (Tùy chọn - Có thể để trống)
                            </Label>
                            <Input
                              id={`note-${session._id}`}
                              placeholder="Nhập ghi chú (nếu có)..."
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              className="bg-background"
                            />
                          </div>

                          {!isCheckedIn ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <Button
                                onClick={() => {
                                  setSelectedScanSession(session);
                                  setIsScannerOpen(true);
                                }}
                                disabled={submitting}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-sm gap-2 shadow-sm"
                              >
                                <Camera className="h-5 w-5" />
                                QUÉT QR ĐIỂM DANH
                              </Button>

                              <Button
                                onClick={() => handleAction(session, false)}
                                disabled={submitting}
                                variant="outline"
                                className="w-full font-semibold py-6 text-sm gap-2 border-emerald-600/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                              >
                                <LogIn className="h-5 w-5 text-emerald-600" />
                                {submitting ? "Đang xác thực..." : "Tự Điểm Danh (WiFi/GPS)"}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleAction(session, true)}
                              disabled={submitting}
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-6 text-base"
                            >
                              <LogOut className="h-5 w-5 mr-2" />
                              {submitting ? "Đang xác thực và Check-out..." : "NÚT ĐIỂM DANH RA (CHECK-OUT)"}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <AlertDescription className="font-semibold text-center py-1">
                            Bạn đã hoàn thành điểm danh VÀO & RA cho tiết học này!
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>

                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* TAB 2: BÁO CÁO ĐIỂM DANH (ADMIN / GIẢNG VIÊN) */}
        {isAdminOrTeacher && (
          <TabsContent value="report" className="space-y-6">
            {/* THỐNG KÊ TỔNG QUAN CARDS */}
            {reportData?.summary && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-muted-foreground">Tổng Lượt</div>
                    <div className="text-2xl font-bold text-slate-800">{reportData.summary.totalRecords}</div>
                  </CardContent>
                </Card>

                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-emerald-700 font-medium">Đúng Giờ</div>
                    <div className="text-2xl font-bold text-emerald-800">{reportData.summary.presentCount}</div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-amber-700 font-medium">Đi Muộn</div>
                    <div className="text-2xl font-bold text-amber-800">{reportData.summary.lateCount}</div>
                  </CardContent>
                </Card>

                <Card className="bg-rose-50 border-rose-200">
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-rose-700 font-medium">Về Sớm</div>
                    <div className="text-2xl font-bold text-rose-800">{reportData.summary.earlyLeaveCount}</div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-red-700 font-medium">Vắng Mặt</div>
                    <div className="text-2xl font-bold text-red-800">{reportData.summary.absentCount}</div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-blue-700 font-medium">Có Phép</div>
                    <div className="text-2xl font-bold text-blue-800">{reportData.summary.excusedCount}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* BỘ LỌC TÌM KIẾM */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  Bộ Lọc Điểm Danh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Lớp học phần */}
                  <div className="space-y-1">
                    <Label className="text-xs">Lớp Học Phần</Label>
                    <Select value={filterSectionId} onValueChange={setFilterSectionId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Tất cả lớp học phần" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả lớp học phần</SelectItem>
                        {courseSectionsList.map((cs) => (
                          <SelectItem key={cs._id} value={cs._id}>
                            {cs.sectionCode} - {cs.subjectId?.subjectName || ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ngày học */}
                  <div className="space-y-1">
                    <Label className="text-xs">Ngày Học</Label>
                    <Input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* Trạng thái */}
                  <div className="space-y-1">
                    <Label className="text-xs">Trạng Thái Điểm Danh</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="present">Đúng giờ</SelectItem>
                        <SelectItem value="late">Đi muộn</SelectItem>
                        <SelectItem value="early_leave">Về sớm</SelectItem>
                        <SelectItem value="absent">Vắng mặt</SelectItem>
                        <SelectItem value="excused">Nghỉ có phép</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tìm kiếm tên / Mã SV */}
                  <div className="space-y-1">
                    <Label className="text-xs">Tìm Sinh Viên</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tên, Mã SV, Email..."
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        className="pl-8 h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterSectionId("all");
                      setFilterDate("");
                      setFilterStatus("all");
                      setFilterSearch("");
                    }}
                    className="h-8 text-xs"
                  >
                    Xóa Bộ Lọc
                  </Button>
                  <Button size="sm" onClick={loadReportData} disabled={loadingReport} className="h-8 text-xs">
                    <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loadingReport ? "animate-spin" : ""}`} /> Áp Dụng Bộ Lọc
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* BẢNG DỮ LIỆU BÁO CÁO */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Danh Sách Chi Tiết Điểm Danh</CardTitle>
                  <CardDescription className="text-xs">
                    Hiển thị thông tin điểm danh sinh viên kèm IP WiFi và khoảng cách GPS.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingReport ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    Đang tải danh sách báo cáo điểm danh...
                  </div>
                ) : !reportData || reportData.records.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    Không tìm thấy bản ghi điểm danh nào phù hợp với bộ lọc.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[180px]">Sinh Viên</TableHead>
                          <TableHead className="w-[160px]">Lớp HP / Buổi Học</TableHead>
                          <TableHead className="w-[110px]">Giờ Vào</TableHead>
                          <TableHead className="w-[110px]">Giờ Ra</TableHead>
                          <TableHead className="w-[120px]">Trạng Thái</TableHead>
                          <TableHead className="w-[200px]">Xác Thực IP & GPS</TableHead>
                          <TableHead>Ghi Chú</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.records.map((item: any) => {
                          const student = item.studentId || {};
                          const session = item.classSessionId || {};
                          const section = item.courseSectionId || {};
                          const subject = section.subjectId || {};

                          return (
                            <TableRow key={item._id}>
                              {/* Sinh Viên */}
                              <TableCell>
                                <div className="font-semibold text-sm">{student.fullName || "N/A"}</div>
                                <div className="text-xs text-muted-foreground">{student.userCode || "Chưa có mã"}</div>
                                <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                                  {student.email || ""}
                                </div>
                              </TableCell>

                              {/* Lớp HP & Buổi Học */}
                              <TableCell>
                                <div className="font-medium text-xs text-primary">{section.sectionCode || "N/A"}</div>
                                <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                                  {subject.name || ""}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                  {session.date ? new Date(session.date).toLocaleDateString("vi-VN") : ""} - Phòng {session.room || "N/A"}
                                </div>
                              </TableCell>

                              {/* Giờ Vào */}
                              <TableCell className="text-xs font-mono">
                                {item.checkInTime ? (
                                  <span className="text-emerald-700 font-semibold">
                                    {new Date(item.checkInTime).toLocaleTimeString("vi-VN")}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">--:--</span>
                                )}
                              </TableCell>

                              {/* Giờ Ra */}
                              <TableCell className="text-xs font-mono">
                                {item.checkOutTime ? (
                                  <span className="text-amber-700 font-semibold">
                                    {new Date(item.checkOutTime).toLocaleTimeString("vi-VN")}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">--:--</span>
                                )}
                              </TableCell>

                              {/* Trạng Thái Badge */}
                              <TableCell>
                                <Badge
                                  variant={
                                    item.status === "late" || item.status === "early_leave" || item.status === "absent"
                                      ? "destructive"
                                      : "default"
                                  }
                                  className="text-xs font-medium"
                                >
                                  {item.status === "present"
                                    ? "Đúng giờ"
                                    : item.status === "late"
                                    ? "Đi muộn"
                                    : item.status === "early_leave"
                                    ? "Về sớm"
                                    : item.status === "excused"
                                    ? "Có phép"
                                    : "Vắng mặt"}
                                </Badge>
                              </TableCell>

                              {/* Thiết bị & Vị trí */}
                              <TableCell className="text-xs">
                                <div className="text-[11px] text-muted-foreground">
                                  {item.deviceInfo || "Tự điểm danh trên Web"}
                                </div>
                              </TableCell>

                              {/* Ghi chú */}
                              <TableCell className="text-xs text-muted-foreground">
                                {item.note || "--"}
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
          </TabsContent>
        )}

        {/* TAB 3: ADMIN / TEACHER CONFIG */}
        {isAdminOrTeacher && (
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cấu Hình Mạng WiFi & Vị Trí GPS Hợp Lệ</CardTitle>
                <CardDescription>
                  Thiết lập cấu hình mặc định (Public IP WiFi, Tọa độ GPS mốc và bán kính điểm danh).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingConfig ? (
                  <div className="text-center py-4">Đang tải cấu hình...</div>
                ) : (
                  <>
                    {adminMsg && (
                      <Alert>
                        <ShieldCheck className="h-4 w-4" />
                        <AlertDescription>{adminMsg}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">Yêu cầu đúng WiFi (Public IP)</div>
                          <div className="text-xs text-muted-foreground">Chỉ cho phép điểm danh khi kết nối đúng WiFi</div>
                        </div>
                        <Switch
                          checked={adminForm.requireWifiCheck ?? true}
                          onCheckedChange={(checked) => setAdminForm((prev) => ({ ...prev, requireWifiCheck: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">Yêu cầu bán kính GPS</div>
                          <div className="text-xs text-muted-foreground">Kiểm tra khoảng cách với tọa độ mốc</div>
                        </div>
                        <Switch
                          checked={adminForm.requireLocationCheck ?? true}
                          onCheckedChange={(checked) => setAdminForm((prev) => ({ ...prev, requireLocationCheck: checked }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <Label>Danh Sách Public IP WiFi Cho Phép (Phân cách bằng dấu phẩy)</Label>
                        {config?.currentClientIp && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-primary border-primary/40 hover:bg-primary/10"
                            onClick={() => {
                              const curIp = config.currentClientIp;
                              if (!curIp) return;
                              const currentList = adminForm.allowedPublicIps || [];
                              if (!currentList.includes(curIp)) {
                                setAdminForm((prev) => ({
                                  ...prev,
                                  allowedPublicIps: [...currentList, curIp],
                                }));
                              }
                            }}
                          >
                            + Tự động thêm IP hiện tại ({config.currentClientIp})
                          </Button>
                        )}
                      </div>
                      <Input
                        value={adminForm.allowedPublicIps?.join(", ") || ""}
                        onChange={(e) =>
                          setAdminForm((prev) => ({
                            ...prev,
                            allowedPublicIps: e.target.value.split(",").map((ip) => ip.trim()),
                          }))
                        }
                        placeholder="127.0.0.1, ::1, 113.161.12.34"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-sm">Vị Trí Mốc Chấm Công (GPS Mặc Định)</Label>
                        {latitude && longitude && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => {
                              setAdminForm((prev) => ({
                                ...prev,
                                latitude: latitude,
                                longitude: longitude,
                              }));
                            }}
                          >
                            + Lấy tọa độ GPS hiện tại làm mốc ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        <div className="space-y-2">
                          <Label className="text-xs">Vĩ Độ (Latitude)</Label>
                          <Input
                            type="number"
                            step="any"
                            value={adminForm.latitude ?? 21.028511}
                            onChange={(e) => setAdminForm((prev) => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Kinh Độ (Longitude)</Label>
                          <Input
                            type="number"
                            step="any"
                            value={adminForm.longitude ?? 105.804817}
                            onChange={(e) => setAdminForm((prev) => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Bán Kính Cho Phép (Mét)</Label>
                          <Input
                            type="number"
                            value={adminForm.allowedRadiusMeters ?? 20}
                            onChange={(e) => setAdminForm((prev) => ({ ...prev, allowedRadiusMeters: parseInt(e.target.value, 10) }))}
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSaveConfig} disabled={savingConfig} className="w-full">
                      {savingConfig ? "Đang lưu cấu hình..." : "Lưu Thay Đổi Cấu Hình Mặc Định"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* MODAL TRÌNH CHIẾU MÃ QR CHO GIẢNG VIÊN / ADMIN */}
      <QrProjectorModal
        isOpen={isProjectorOpen}
        onClose={() => setIsProjectorOpen(false)}
        session={selectedProjectorSession}
      />

      {/* MODAL QUÉT MÃ QR CHO SINH VIÊN */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        session={selectedScanSession}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}

