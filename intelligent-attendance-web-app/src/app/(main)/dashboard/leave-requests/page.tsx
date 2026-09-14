"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Filter,
  Search,
  Calendar as CalendarIcon,
  BookOpen,
  User as UserIcon,
  Paperclip,
  RefreshCw,
  Eye,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { leaveService, type LeaveRequestItem } from "@/services/leave.service";
import { useAuthStore } from "@/stores/auth-store";
import { courseSectionService } from "@/services/academic.service";
import type { CourseSection } from "@/types/academic.types";

export default function LeaveRequestsPage() {
  const { user } = useAuthStore();
  const rawRole = (user?.roleCode || (typeof user?.role === "string" ? user.role : user?.role?.code) || "").toLowerCase();
  const isAdmin = rawRole.includes("admin") || rawRole.includes("super_admin");
  const isTeacher = (rawRole.includes("teacher") || rawRole.includes("lecturer")) && !isAdmin;
  const isStudent = !isAdmin && !isTeacher;

  const initialTab: "student" | "teacher" | "admin" = isAdmin ? "admin" : isTeacher ? "teacher" : "student";
  const [activeTab, setActiveTab] = useState<"student" | "teacher" | "admin">(initialTab);

  // Sync activeTab whenever user profile loads/changes
  useEffect(() => {
    if (isAdmin) {
      setActiveTab("admin");
    } else if (isTeacher) {
      setActiveTab("teacher");
    } else if (isStudent && rawRole) {
      setActiveTab("student");
    }
  }, [rawRole, isStudent, isTeacher, isAdmin]);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create Request Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formCourseSectionId, setFormCourseSectionId] = useState("");
  const [formClassSessionId, setFormClassSessionId] = useState("");
  const [formLeaveType, setFormLeaveType] = useState<"sick" | "personal" | "family" | "other">("sick");
  const [formReason, setFormReason] = useState("");
  const [formFromDate, setFormFromDate] = useState(new Date().toISOString().split("T")[0]);
  const [formToDate, setFormToDate] = useState(new Date().toISOString().split("T")[0]);
  const [formAttachmentUrl, setFormAttachmentUrl] = useState("");

  // Approve Modal State (MODAL DIALOG THAY THẾ BROWSER ALERT)
  const [approvingItem, setApprovingItem] = useState<LeaveRequestItem | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);

  // Reject Modal State
  const [rejectingItem, setRejectingItem] = useState<LeaveRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Detail Modal State
  const [selectedDetail, setSelectedDetail] = useState<LeaveRequestItem | null>(null);

  // Load Course Sections for Dropdowns
  useEffect(() => {
    courseSectionService.getCourseSections()
      .then((data) => setCourseSections(data))
      .catch(() => { });
  }, []);

  // Fetch Leave Requests based on tab and filters
  const fetchRequests = async () => {
    setLoading(true);
    try {
      let data: LeaveRequestItem[] = [];
      if (activeTab === "student") {
        data = await leaveService.getMyLeaveRequests(statusFilter);
      } else if (activeTab === "teacher") {
        data = await leaveService.getTeacherLeaveRequests(statusFilter);
      } else {
        data = await leaveService.getAllLeaveRequests({ status: statusFilter });
      }
      setRequests(data);
    } catch (err: any) {
      toast.error("Không thể tải danh sách đơn xin nghỉ phép.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, statusFilter]);

  // Create Leave Request Handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCourseSectionId) {
      toast.error("Vui lòng chọn Lớp học phần.");
      return;
    }
    if (!formReason.trim()) {
      toast.error("Vui lòng nhập lý do xin nghỉ.");
      return;
    }
    if (!formFromDate || !formToDate) {
      toast.error("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
      return;
    }

    setSubmitLoading(true);
    try {
      await leaveService.createLeaveRequest({
        courseSectionId: formCourseSectionId,
        classSessionId: formClassSessionId || undefined,
        leaveType: formLeaveType,
        reason: formReason.trim(),
        fromDate: formFromDate,
        toDate: formToDate,
        attachmentUrl: formAttachmentUrl.trim() || undefined,
      });

      toast.success("Đã gửi đơn xin nghỉ phép thành công! Vui lòng chờ Giảng viên phê duyệt.");
      setIsCreateOpen(false);
      // Reset form
      setFormReason("");
      setFormAttachmentUrl("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.message || "Gửi đơn xin nghỉ phép thất bại.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Cancel Pending Request
  const handleCancel = async (id: string) => {
    try {
      await leaveService.cancelLeaveRequest(id);
      toast.success("Đã hủy đơn xin nghỉ phép thành công.");
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.message || "Hủy đơn thất bại.");
    }
  };

  // Approve Submit Handler (Sử dụng Modal Dialog)
  const handleApproveSubmit = async () => {
    if (!approvingItem) return;

    setApproveLoading(true);
    try {
      await leaveService.approveLeaveRequest(approvingItem._id);
      toast.success("Đã duyệt đơn xin nghỉ phép và tự động chuyển trạng thái điểm danh sang CÓ PHÉP (EXCUSED).");
      setApprovingItem(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.message || "Phê duyệt đơn thất bại.");
    } finally {
      setApproveLoading(false);
    }
  };

  // Reject Request Handler
  const handleRejectSubmit = async () => {
    if (!rejectingItem) return;
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối đơn.");
      return;
    }

    try {
      await leaveService.rejectLeaveRequest(rejectingItem._id, rejectionReason.trim());
      toast.success("Đã từ chối đơn xin nghỉ phép.");
      setRejectingItem(null);
      setRejectionReason("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.message || "Từ chối đơn thất bại.");
    }
  };

  // View Details
  const handleViewDetail = async (id: string) => {
    try {
      const detail = await leaveService.getLeaveRequestDetail(id);
      setSelectedDetail(detail);
    } catch (err: any) {
      toast.error("Không thể xem chi tiết đơn.");
    }
  };

  // Filtered requests by search query
  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const studentName = r.studentId?.fullName?.toLowerCase() || "";
    const studentCode = r.studentId?.userCode?.toLowerCase() || "";
    const reason = r.reason?.toLowerCase() || "";
    const sectionCode = r.courseSectionId?.sectionCode?.toLowerCase() || "";
    const subjectName = r.courseSectionId?.subjectId?.name?.toLowerCase() || "";

    return (
      studentName.includes(q) ||
      studentCode.includes(q) ||
      reason.includes(q) ||
      sectionCode.includes(q) ||
      subjectName.includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">
            <Clock className="size-3" /> Chờ duyệt
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
            <CheckCircle2 className="size-3" /> Đã duyệt (Excused)
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 gap-1">
            <XCircle className="size-3" /> Từ chối
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/30 gap-1">
            <Ban className="size-3" /> Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản Lý Đơn Xin Nghỉ Phép</h1>
          <p className="text-sm text-muted-foreground">
            Hệ thống xin nghỉ phép trực tuyến & Tự động chuyển trạng thái điểm danh sang Có phép (EXCUSED) khi được duyệt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>

          {(isStudent || isAdmin) && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Tạo đơn xin nghỉ
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {isAdmin ? (
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                  <TabsTrigger value="student" className="gap-2">
                    <UserIcon className="size-4" /> Sinh viên
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="gap-2">
                    <BookOpen className="size-4" /> Giảng viên Duyệt
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="gap-2">
                    <FileText className="size-4" /> Quản trị Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            ) : isTeacher ? (
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-200">
                <BookOpen className="size-4 text-blue-600" /> Đơn Xin Nghỉ Phép Thuộc Lớp HP Phụ Trách
              </div>
            ) : (
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-200">
                <UserIcon className="size-4 text-blue-600" /> Danh Sách Đơn Xin Nghỉ Phép Của Tôi
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm môn, sinh viên, lý do..."
                  className="pl-8 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] text-xs">
                  <Filter className="mr-2 size-3.5" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ duyệt (Pending)</SelectItem>
                  <SelectItem value="approved">Đã duyệt (Approved)</SelectItem>
                  <SelectItem value="rejected">Từ chối (Rejected)</SelectItem>
                  <SelectItem value="cancelled">Đã hủy (Cancelled)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex py-12 justify-center items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="size-4 animate-spin" /> Đang tải danh sách đơn xin nghỉ...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto size-10 text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-base">Không tìm thấy đơn xin nghỉ phép nào</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTab === "student"
                  ? "Bạn chưa gửi đơn xin nghỉ phép nào hoặc không phù hợp với bộ lọc."
                  : "Hiện chưa có đơn xin nghỉ phép nào cần xử lý."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {activeTab !== "student" && <TableHead>Sinh viên</TableHead>}
                    <TableHead>Môn học / Học phần</TableHead>
                    <TableHead>Thời gian nghỉ</TableHead>
                    <TableHead>Lý do nghỉ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Người duyệt</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredRequests.map((req) => {
                    const student = req.studentId;
                    const section = req.courseSectionId;
                    const subject = section?.subjectId;

                    return (
                      <TableRow key={req._id}>
                        {activeTab !== "student" && (
                          <TableCell>
                            <div className="font-medium text-xs">
                              {student?.fullName || "Sinh viên"}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              MSSV: {student?.userCode || "N/A"}
                            </div>
                          </TableCell>
                        )}

                        <TableCell>
                          <div className="font-medium text-xs">
                            {subject?.name || "Học phần"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Mã HP: {section?.sectionCode || "N/A"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium flex items-center gap-1">
                            <CalendarIcon className="size-3 text-muted-foreground" />
                            {new Date(req.fromDate).toLocaleDateString("vi-VN")}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            đến {new Date(req.toDate).toLocaleDateString("vi-VN")}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium max-w-[200px] truncate" title={req.reason}>
                            {req.reason}
                          </div>
                          <div className="text-[11px] capitalize text-muted-foreground">
                            Loại: {req.leaveType === "sick" ? "Nghỉ ốm" : req.leaveType === "personal" ? "Việc cá nhân" : req.leaveType === "family" ? "Việc gia đình" : "Khác"}
                          </div>
                        </TableCell>

                        <TableCell>{getStatusBadge(req.status)}</TableCell>

                        <TableCell>
                          <div className="text-xs">
                            {req.reviewedBy?.fullName || "Chưa có"}
                          </div>
                          {req.reviewedAt && (
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(req.reviewedAt).toLocaleDateString("vi-VN")}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => handleViewDetail(req._id)}
                            >
                              <Eye className="mr-1 size-3.5" /> Chi tiết
                            </Button>

                            {/* Actions for Student: Cancel pending */}
                            {activeTab === "student" && req.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                onClick={() => handleCancel(req._id)}
                              >
                                <Ban className="mr-1 size-3.5" /> Hủy đơn
                              </Button>
                            )}

                            {/* Actions for Teacher/Admin: Approve or Reject */}
                            {activeTab !== "student" && req.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-8 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => setApprovingItem(req)}
                                >
                                  <CheckCircle2 className="mr-1 size-3.5" /> Duyệt
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 px-2 text-xs"
                                  onClick={() => setRejectingItem(req)}
                                >
                                  <XCircle className="mr-1 size-3.5" /> Từ chối
                                </Button>
                              </>
                            )}
                          </div>
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

      {/* CREATE REQUEST DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <FileText className="size-5 text-blue-600" /> Tạo Đơn Xin Nghỉ Phép
              </DialogTitle>
              <DialogDescription>
                Nhập đầy đủ thông tin để xin phép nghỉ học. Đơn sẽ được gửi trực tiếp đến Giảng viên phụ trách.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 text-xs">
              {/* Select Course Section */}
              <div className="space-y-1.5">
                <Label htmlFor="courseSection" className="font-semibold">
                  Lớp học phần / Môn học <span className="text-rose-500">*</span>
                </Label>
                <Select value={formCourseSectionId} onValueChange={setFormCourseSectionId}>
                  <SelectTrigger id="courseSection">
                    <SelectValue placeholder="-- Chọn lớp học phần --" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseSections.map((sec) => {
                      const subjectName =
                        typeof sec.subjectId === "object" && sec.subjectId !== null
                          ? sec.subjectId.name
                          : typeof sec.subjectId === "string"
                            ? sec.subjectId
                            : "Môn học";
                      return (
                        <SelectItem key={sec._id} value={sec._id}>
                          {subjectName} - [{sec.sectionCode}] ({sec.room})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Leave Type */}
              <div className="space-y-1.5">
                <Label htmlFor="leaveType" className="font-semibold">
                  Loại nghỉ phép <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formLeaveType}
                  onValueChange={(v) => setFormLeaveType(v as any)}
                >
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Chọn loại nghỉ phép" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Nghỉ ốm / Khám chữa bệnh</SelectItem>
                    <SelectItem value="personal">Việc cá nhân quan trọng</SelectItem>
                    <SelectItem value="family">Việc gia đình / Hiếu hỷ</SelectItem>
                    <SelectItem value="other">Lý do khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fromDate" className="font-semibold">
                    Từ ngày <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={formFromDate}
                    onChange={(e) => setFormFromDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="toDate" className="font-semibold">
                    Đến ngày <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={formToDate}
                    onChange={(e) => setFormToDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <Label htmlFor="reason" className="font-semibold">
                  Lý do xin nghỉ <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  rows={3}
                  placeholder="Nhập lý do chi tiết xin nghỉ phép (Ví dụ: Em bị sốt cao cần đi khám tại BV...)"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                />
              </div>

              {/* Attachment URL */}
              <div className="space-y-1.5">
                <Label htmlFor="attachmentUrl" className="font-semibold flex items-center gap-1">
                  <Paperclip className="size-3.5 text-muted-foreground" /> Link minh chứng (Giấy khám bệnh/Đơn từ nếu có)
                </Label>
                <Input
                  id="attachmentUrl"
                  placeholder="https://drive.google.com/..."
                  value={formAttachmentUrl}
                  onChange={(e) => setFormAttachmentUrl(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={submitLoading}>
                {submitLoading ? "Đang gửi đơn..." : "Gửi Đơn Xin Nghỉ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* APPROVE MODAL DIALOG (THAY THẾ BROWSER ALERT) */}
      <Dialog open={!!approvingItem} onOpenChange={() => setApprovingItem(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="size-5" /> Phê Duyệt Đơn Xin Nghỉ Phép
            </DialogTitle>
            <DialogDescription>
              Xác nhận phê duyệt đơn xin nghỉ phép của sinh viên và tự động cập nhật hệ thống điểm danh.
            </DialogDescription>
          </DialogHeader>

          {approvingItem && (
            <div className="py-3 space-y-3 text-xs">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 space-y-1.5">
                <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Sinh viên: {approvingItem.studentId?.fullName || "Sinh viên"} (MSSV: {approvingItem.studentId?.userCode || "N/A"})
                </div>
                <div className="text-emerald-800 dark:text-emerald-300">
                  Môn học: <span className="font-medium">{approvingItem.courseSectionId?.subjectId?.name || "Học phần"}</span> [{approvingItem.courseSectionId?.sectionCode}]
                </div>
                <div className="text-emerald-700 dark:text-emerald-400">
                  Thời gian: {new Date(approvingItem.fromDate).toLocaleDateString("vi-VN")} - {new Date(approvingItem.toDate).toLocaleDateString("vi-VN")}
                </div>
                <div className="text-emerald-700 dark:text-emerald-400 italic">
                  Lý do: &quot;{approvingItem.reason}&quot;
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 bg-muted/40 p-2.5 rounded border">
                <ShieldCheck className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  Trạng thái điểm danh của sinh viên trong thời gian nghỉ sẽ được tự động cập nhật sang <strong>Có phép (EXCUSED)</strong>.
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovingItem(null)} disabled={approveLoading}>
              Hủy bỏ
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleApproveSubmit}
              disabled={approveLoading}
            >
              {approveLoading ? "Đang xử lý..." : "Xác Nhận Duyệt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT MODAL DIALOG */}
      <Dialog open={!!rejectingItem} onOpenChange={() => setRejectingItem(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <XCircle className="size-5" /> Từ Chối Đơn Xin Nghỉ Phép
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối đơn xin nghỉ để thông báo phản hồi cho sinh viên.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-2">
            <Label htmlFor="rejectionReason" className="font-semibold text-xs">
              Lý do từ chối <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="rejectionReason"
              rows={3}
              placeholder="Nhập lý do không chấp nhận đơn (Ví dụ: Lý do không rõ ràng/Không kèm giấy tờ xác nhận...)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingItem(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>
              Xác Nhận Từ Chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAIL & HISTORY DIALOG */}
      <Dialog open={!!selectedDetail} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent className="sm:max-w-[580px]">
          {selectedDetail && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Chi Tiết Đơn Xin Nghỉ Phép</span>
                  {getStatusBadge(selectedDetail.status)}
                </DialogTitle>
                <DialogDescription>
                  Mã đơn: <span className="font-mono">{selectedDetail._id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs">
                {/* Information */}
                <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg border">
                  <div>
                    <span className="text-muted-foreground">Sinh viên:</span>
                    <div className="font-semibold">{selectedDetail.studentId?.fullName || "SV"}</div>
                    <div className="text-muted-foreground">MSSV: {selectedDetail.studentId?.userCode || "N/A"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Môn học:</span>
                    <div className="font-semibold">{selectedDetail.courseSectionId?.subjectId?.name || "Học phần"}</div>
                    <div className="text-muted-foreground">Mã LHP: {selectedDetail.courseSectionId?.sectionCode}</div>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground">Thời gian xin nghỉ:</span>
                  <div className="mt-1 font-medium">
                    Từ {new Date(selectedDetail.fromDate).toLocaleDateString("vi-VN")} đến {new Date(selectedDetail.toDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground">Lý do chi tiết:</span>
                  <div className="mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-md font-medium text-slate-800 dark:text-slate-200">
                    {selectedDetail.reason}
                  </div>
                </div>

                {selectedDetail.attachmentUrl && (
                  <div>
                    <span className="font-semibold text-muted-foreground">File minh chứng:</span>
                    <div className="mt-1">
                      <a
                        href={selectedDetail.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline hover:text-blue-700 flex items-center gap-1"
                      >
                        <Paperclip className="size-3.5" /> Xem file đính kèm
                      </a>
                    </div>
                  </div>
                )}

                {selectedDetail.status === "rejected" && selectedDetail.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-800">
                    <span className="font-bold">Lý do từ chối:</span> {selectedDetail.rejectionReason}
                  </div>
                )}

                {/* Audit History Log */}
                {selectedDetail.histories && selectedDetail.histories.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    <span className="font-semibold text-muted-foreground">Lịch sử tác động:</span>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {selectedDetail.histories.map((hist: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between text-[11px] p-2 bg-muted/30 rounded border">
                          <div>
                            <span className="font-bold capitalize">{hist.action}</span> - {hist.performedBy?.fullName || "Hệ thống"}
                            {hist.note && <div className="text-muted-foreground italic">{hist.note}</div>}
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(hist.createdAt).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedDetail(null)}>
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
