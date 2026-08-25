"use client";

import { useEffect, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Globe,
  History,
  Laptop,
  Monitor,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldX,
  Smartphone,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { deviceService } from "@/services/device.service";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginHistory, UserDevice } from "@/types/device.types";

export default function DevicesPage() {
  const { user } = useAuthStore();

  const roleCode =
    user?.roleCode ||
    (user as any)?.role?.code ||
    (typeof user?.role === "string" ? user?.role : "student");

  const isStudent = roleCode === "student";
  const isTeacherOrAdmin = roleCode === "admin" || roleCode === "teacher";

  // States
  const [myDevices, setMyDevices] = useState<UserDevice[]>([]);
  const [pendingDevices, setPendingDevices] = useState<UserDevice[]>([]);
  const [loginHistories, setLoginHistories] = useState<LoginHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>(isStudent ? "my-devices" : "pending-requests");
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("Web Device");

  // Search & Filter States
  const [searchPending, setSearchPending] = useState<string>("");
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("all");

  // Rejection Dialog State
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [selectedDeviceForReject, setSelectedDeviceForReject] = useState<UserDevice | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Student Lookup State
  const [searchStudentId, setSearchStudentId] = useState<string>("");
  const [searchedStudentDevices, setSearchedStudentDevices] = useState<UserDevice[] | null>(null);
  const [isSearchingStudent, setIsSearchingStudent] = useState<boolean>(false);

  // Fetch Data Function
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isStudent) {
        const [devicesData, historyData] = await Promise.all([
          deviceService.getMyDevices().catch(() => []),
          deviceService.getLoginHistory().catch(() => []),
        ]);
        setMyDevices(devicesData);
        setLoginHistories(historyData);
      } else {
        const [pendingData, historyData] = await Promise.all([
          deviceService.getPendingDevices().catch(() => []),
          deviceService.getLoginHistory().catch(() => []),
        ]);
        setPendingDevices(pendingData);
        setLoginHistories(historyData);
      }
    } catch (err: any) {
      toast.error("Không thể tải dữ liệu thiết bị!", {
        description: err.message || "Vui lòng kiểm tra lại kết nối mạng.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("app_device_id");
      if (id) {
        setCurrentDeviceId(id.substring(0, 18) + "...");
      }
    }
  }, [roleCode]);

  // Phê duyệt thiết bị
  const handleApproveDevice = async (device: UserDevice) => {
    try {
      setIsActionLoading(true);
      const res = await deviceService.approveDevice(device._id);
      toast.success("Đã phê duyệt thiết bị thành công!", {
        description: res.message || `Thiết bị ${device.deviceName} đã được duyệt.`,
      });
      if (searchStudentId.trim()) {
        const updated = await deviceService.getStudentDevices(searchStudentId.trim());
        setSearchedStudentDevices(updated);
      }
      loadData();
    } catch (err: any) {
      toast.error("Phê duyệt thất bại", {
        description: err.message || "Không thể thực hiện phê duyệt.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Hủy kích hoạt thiết bị
  const handleDeactivateDevice = async (device: UserDevice) => {
    try {
      setIsActionLoading(true);
      const res = await deviceService.deactivateDevice(device._id);
      toast.success("Đã hủy kích hoạt thiết bị!", {
        description: res.message || `Thiết bị ${device.deviceName} đã ngưng hoạt động.`,
      });
      if (searchStudentId.trim()) {
        const updated = await deviceService.getStudentDevices(searchStudentId.trim());
        setSearchedStudentDevices(updated);
      }
      loadData();
    } catch (err: any) {
      toast.error("Hủy kích hoạt thất bại", {
        description: err.message || "Không thể hủy kích hoạt thiết bị.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Mở Dialog Từ Chối
  const openRejectDialog = (device: UserDevice) => {
    setSelectedDeviceForReject(device);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  // Thực hiện Từ Chối
  const handleConfirmReject = async () => {
    if (!selectedDeviceForReject) return;
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      setIsActionLoading(true);
      const res = await deviceService.rejectDevice(selectedDeviceForReject._id, rejectReason.trim());
      toast.success("Đã từ chối yêu cầu thiết bị", {
        description: res.message || `Thiết bị ${selectedDeviceForReject.deviceName} bị từ chối.`,
      });
      setRejectModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error("Từ chối thất bại", {
        description: err.message || "Không thể từ chối thiết bị.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Tra cứu thiết bị theo Student ID
  const handleSearchStudentDevices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchStudentId.trim()) return;

    try {
      setIsSearchingStudent(true);
      const data = await deviceService.getStudentDevices(searchStudentId.trim());
      setSearchedStudentDevices(data);
    } catch (err: any) {
      toast.error("Tra cứu thất bại", {
        description: err.message || "Không tìm thấy thông tin sinh viên.",
      });
      setSearchedStudentDevices([]);
    } finally {
      setIsSearchingStudent(false);
    }
  };

  // Format Helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Helper render Badge trạng thái thiết bị
  const renderDeviceBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/30 dark:text-emerald-400">
            <CheckCircle2 className="mr-1 size-3" /> Đã duyệt (Hoạt động)
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/30 dark:text-amber-400">
            <Clock className="mr-1 size-3 animate-pulse" /> Chờ phê duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border-rose-500/30 dark:text-rose-400">
            <XCircle className="mr-1 size-3" /> Bị từ chối
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Ngưng hoạt động
          </Badge>
        );
    }
  };

  // Helper render Badge trạng thái đăng nhập
  const renderLoginStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-emerald-600/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400">
            Thành công
          </Badge>
        );
      case "pending_device":
        return (
          <Badge className="bg-amber-600/15 text-amber-700 border-amber-500/30 dark:text-amber-400">
            Thiết bị chờ duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-600/15 text-rose-700 border-rose-500/30 dark:text-rose-400">
            Từ chối
          </Badge>
        );
      default:
        return <Badge variant="secondary">Thất bại</Badge>;
    }
  };

  // Lọc danh sách Lịch sử Đăng nhập
  const safeLoginHistories = Array.isArray(loginHistories) ? loginHistories : [];
  const filteredHistory = safeLoginHistories.filter((item) => {
    const matchStatus = historyStatusFilter === "all" || item.status === historyStatusFilter;
    const searchLower = historySearch.toLowerCase();
    const matchSearch =
      !historySearch ||
      item.userEmail?.toLowerCase().includes(searchLower) ||
      item.userFullName?.toLowerCase().includes(searchLower) ||
      item.ipAddress?.includes(searchLower) ||
      item.deviceId?.toLowerCase().includes(searchLower);

    return matchStatus && matchSearch;
  });

  // Lọc danh sách thiết bị chờ duyệt
  const safePendingDevices = Array.isArray(pendingDevices) ? pendingDevices : [];
  const filteredPending = safePendingDevices.filter((item) => {
    if (!searchPending) return true;
    const searchLower = searchPending.toLowerCase();
    const userInfo = typeof item.userId === "object" ? item.userId : null;
    return (
      userInfo?.fullName?.toLowerCase().includes(searchLower) ||
      userInfo?.email?.toLowerCase().includes(searchLower) ||
      userInfo?.userCode?.toLowerCase().includes(searchLower) ||
      item.deviceName?.toLowerCase().includes(searchLower) ||
      item.deviceId?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Laptop className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quản lý Thiết bị & An toàn Đăng nhập</h1>
              <p className="text-sm text-muted-foreground">
                Quản lý các thiết bị được phép điểm danh và theo dõi lịch sử truy cập hệ thống.
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} className="self-start sm:self-auto">
          <RefreshCw className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isStudent ? "Thiết bị Đã kích hoạt" : "Yêu cầu Chờ Phê duyệt"}
            </CardTitle>

            {isStudent ? (
              <ShieldCheck className="size-5 text-emerald-500" />
            ) : (
              <Clock className="size-5 text-amber-500 animate-pulse" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : isStudent ? (
                (Array.isArray(myDevices) ? myDevices : []).filter((d) => d.status === "approved" || d.status === "active").length
              ) : (
                safePendingDevices.length
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isStudent ? "Thiết bị cố định dùng để điểm danh" : "Cần Giảng viên / Admin xem xét"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Lượt đăng nhập gần đây
            </CardTitle>
            <History className="size-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : loginHistories.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tổng lượt truy cập đã ghi nhận</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Thiết bị hiện tại
            </CardTitle>
            <Monitor className="size-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {currentDeviceId}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Đã liên kết với trình duyệt này
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Component */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
          {isStudent ? (
            <>
              <TabsTrigger value="my-devices" className="gap-2">
                <Laptop className="size-4" /> Thiết bị của tôi
              </TabsTrigger>
              <TabsTrigger value="login-history" className="gap-2">
                <History className="size-4" /> Lịch sử đăng nhập
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="pending-requests" className="gap-2">
                <Clock className="size-4" /> Yêu cầu chờ duyệt ({pendingDevices.length})
              </TabsTrigger>
              <TabsTrigger value="login-history" className="gap-2">
                <History className="size-4" /> Lịch sử đăng nhập toàn hệ thống
              </TabsTrigger>
              <TabsTrigger value="student-lookup" className="gap-2 hidden md:inline-flex">
                <Search className="size-4" /> Tra cứu Sinh viên
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* TAB 1 FOR STUDENT: MY DEVICES */}
        {isStudent && (
          <TabsContent value="my-devices" className="mt-6 space-y-4">
            <Alert className="border-blue-500/30 bg-blue-50/50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
              <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="font-semibold">Quy định Đóng băng Thiết bị Đăng ký</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1">
                Mỗi sinh viên chỉ được phép sử dụng 1 thiết bị chính thức (`Approved`) để điểm danh. Khi bạn đăng nhập ở thiết bị mới, yêu cầu sẽ được chuyển cho Giảng viên / Admin xem xét phê duyệt.
              </AlertDescription>
            </Alert>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
            ) : myDevices.length === 0 ? (
              <Card className="text-center p-8">
                <AlertCircle className="size-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                <h3 className="font-semibold text-lg">Chưa có thông tin thiết bị</h3>
                <p className="text-sm text-muted-foreground mt-1">Thiết bị của bạn sẽ tự động lưu lại khi đăng nhập thành công.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myDevices.map((dev) => (
                  <Card key={dev._id} className="relative overflow-hidden border bg-card/60 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {dev.deviceType === "mobile" ? <Smartphone className="size-5" /> : <Laptop className="size-5" />}
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold">{dev.deviceName || "Trình duyệt Web"}</CardTitle>
                            <CardDescription className="text-xs font-mono break-all">
                              ID: {dev.deviceId}
                            </CardDescription>
                          </div>
                        </div>
                        {renderDeviceBadge(dev.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2 text-muted-foreground pt-0">
                      <div className="flex justify-between border-t pt-2">
                        <span>Hệ điều hành / Trình duyệt:</span>
                        <span className="font-medium text-foreground">{dev.os || "Web"} ({dev.browser || "Browser"})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lần hoạt động cuối:</span>
                        <span className="font-medium text-foreground">{formatDate(dev.lastActiveAt || dev.updatedAt)}</span>
                      </div>

                      {dev.status === "rejected" && dev.rejectionReason && (
                        <div className="mt-2 rounded bg-rose-50 p-2.5 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
                          <span className="font-semibold">Lý do từ chối:</span> {dev.rejectionReason}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* TAB 1 FOR TEACHER/ADMIN: PENDING REQUESTS */}
        {isTeacherOrAdmin && (
          <TabsContent value="pending-requests" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo Tên SV, MSSV, Email, Device ID..."
                  value={searchPending}
                  onChange={(e) => setSearchPending(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Hiển thị <span className="font-bold text-foreground">{filteredPending.length}</span> yêu cầu chờ duyệt
              </div>
            </div>

            <Card className="overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Sinh viên</TableHead>
                    <TableHead>Thông tin Thiết bị</TableHead>
                    <TableHead>HĐH & Trình duyệt</TableHead>
                    <TableHead>Thời gian yêu cầu</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ) : filteredPending.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2 opacity-70" />
                        Không có yêu cầu thiết bị nào đang chờ phê duyệt.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPending.map((dev) => {
                      const userInfo = typeof dev.userId === "object" ? dev.userId : null;
                      return (
                        <TableRow key={dev._id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{userInfo?.fullName || "Chưa cập nhật"}</span>
                              <span className="text-xs text-muted-foreground">{userInfo?.email}</span>
                              {userInfo?.userCode && (
                                <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                                  MSSV: {userInfo.userCode}
                                </span>
                              )}
                              {(userInfo as any)?.classId?.name && (
                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5 self-start font-medium">
                                  Lớp: {(userInfo as any).classId.name}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-xs">{dev.deviceName || "Trình duyệt Web"}</span>
                              <span className="text-[11px] font-mono text-muted-foreground break-all">
                                {/* {dev.deviceId} */}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs">
                            <div>{dev.os || "N/A"}</div>
                            <div className="text-muted-foreground">{dev.browser || "N/A"}</div>
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(dev.createdAt)}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs gap-1"
                                onClick={() => handleApproveDevice(dev)}
                                disabled={isActionLoading}
                              >
                                <UserCheck className="size-3.5" /> Phê duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-8 text-xs gap-1"
                                onClick={() => openRejectDialog(dev)}
                                disabled={isActionLoading}
                              >
                                <UserX className="size-3.5" /> Từ chối
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}

        {/* TAB 2 FOR ALL: LOGIN HISTORY */}
        <TabsContent value="login-history" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo Email, Họ tên, IP, Device ID..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                <SelectTrigger className="w-[180px] text-xs">
                  <Filter className="mr-1.5 size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="pending_device">Thiết bị chờ duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <span className="text-xs text-muted-foreground self-end sm:self-auto">
              Tổng số: <span className="font-bold text-foreground">{filteredHistory.length}</span> lượt log
            </span>
          </div>

          <Card className="overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Địa chỉ IP</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian đăng nhập</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ) : filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy lịch sử đăng nhập nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item) => (
                    <TableRow key={item._id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs">{item.userFullName || "Người dùng"}</span>
                          <span className="text-[11px] text-muted-foreground">{item.userEmail}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-xs">{item.deviceName || "Trình duyệt Web"}</span>
                          <span className="text-[10px] font-mono text-muted-foreground break-all">
                            {item.deviceId}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs font-mono text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Globe className="size-3 text-slate-400" />
                          <span>{item.ipAddress || "0.0.0.0"}</span>
                        </div>
                      </TableCell>

                      <TableCell>{renderLoginStatusBadge(item.status)}</TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TAB 3 FOR TEACHER/ADMIN: STUDENT LOOKUP */}
        {isTeacherOrAdmin && (
          <TabsContent value="student-lookup" className="mt-6 space-y-4">
            <Card className="p-6">
              <CardTitle className="text-base font-bold mb-1">Tra cứu Thiết bị Sinh viên</CardTitle>
              <CardDescription className="text-xs mb-4">
                Nhập Mã số sinh viên (MSSV) hoặc Email sinh viên để tra cứu danh sách thiết bị đã liên kết.
              </CardDescription>

              <form onSubmit={handleSearchStudentDevices} className="flex gap-2 max-w-lg">
                <Input
                  placeholder="Nhập MSSV (VD: 21DTH123) hoặc Email sinh viên..."
                  value={searchStudentId}
                  onChange={(e) => setSearchStudentId(e.target.value)}
                  className="text-sm"
                />
                <Button type="submit" disabled={isSearchingStudent}>
                  {isSearchingStudent ? <RefreshCw className="size-4 animate-spin" /> : <Search className="size-4 mr-1" />}
                  Tra cứu
                </Button>
              </form>

              {searchedStudentDevices !== null && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-3">Kết quả tra cứu ({searchedStudentDevices.length} thiết bị):</h4>

                  {searchedStudentDevices.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Không tìm thấy thiết bị nào khớp với MSSV / Email đã nhập.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchedStudentDevices.map((dev) => {
                        const studentInfo = typeof dev.userId === "object" ? dev.userId : null;
                        return (
                          <Card key={dev._id} className="p-4 border bg-card/60 shadow-sm">
                            {studentInfo && (
                              <div className="mb-2.5 pb-2 border-b text-xs">
                                <span className="font-bold text-foreground">{studentInfo.fullName || "Sinh viên"}</span>
                                {studentInfo.userCode && <span className="ml-2 font-mono text-blue-600 dark:text-blue-400">({studentInfo.userCode})</span>}
                                <div className="text-[11px] text-muted-foreground">{studentInfo.email}</div>
                              </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-xs text-foreground">{dev.deviceName || "Trình duyệt Web"}</span>
                              {renderDeviceBadge(dev.status)}
                            </div>
                            <div className="text-[11px] text-muted-foreground space-y-1">
                              <div>Hệ điều hành: <span className="font-medium text-foreground">{dev.os || "N/A"} ({dev.browser || "N/A"})</span></div>
                              <div>Lần hoạt động cuối: <span className="font-medium text-foreground">{formatDate(dev.lastActiveAt || dev.updatedAt)}</span></div>
                            </div>

                            {/* Nút thao tác trực tiếp */}
                            <div className="mt-3 pt-2.5 border-t flex items-center justify-end gap-2">
                              {dev.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs px-2.5 gap-1"
                                    onClick={() => handleApproveDevice(dev)}
                                    disabled={isActionLoading}
                                  >
                                    <UserCheck className="size-3" /> Phê duyệt
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-7 text-xs px-2.5 gap-1"
                                    onClick={() => openRejectDialog(dev)}
                                    disabled={isActionLoading}
                                  >
                                    <UserX className="size-3" /> Từ chối
                                  </Button>
                                </>
                              )}

                              {(dev.status === "approved" || dev.status === "active") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 h-7 text-xs px-2.5 gap-1"
                                  onClick={() => handleDeactivateDevice(dev)}
                                  disabled={isActionLoading}
                                >
                                  <XCircle className="size-3" /> Hủy kích hoạt
                                </Button>
                              )}

                              {(dev.status === "inactive" || dev.status === "rejected") && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs px-2.5 gap-1"
                                  onClick={() => handleApproveDevice(dev)}
                                  disabled={isActionLoading}
                                >
                                  <CheckCircle2 className="size-3" /> Kích hoạt lại
                                </Button>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* DIALOG TỪ CHỐI THIẾT BỊ */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <ShieldX className="size-5" /> Từ chối Yêu cầu Thiết bị
            </DialogTitle>
            <DialogDescription className="text-xs">
              Vui lòng nhập lý do từ chối để thông báo lại cho sinh viên.
            </DialogDescription>
          </DialogHeader>

          {selectedDeviceForReject && (
            <div className="rounded-md border p-3 bg-muted/30 text-xs space-y-1">
              <div><span className="font-semibold">Thiết bị:</span> {selectedDeviceForReject.deviceName}</div>
              <div className="font-mono break-all"><span className="font-semibold font-sans">ID:</span> {selectedDeviceForReject.deviceId}</div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold">Lý do từ chối (*)</label>
            <Textarea
              placeholder="VD: Không đúng thiết bị đăng ký học phần, thiết bị không hợp lệ..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Đang xử lý..." : "Xác nhận Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
