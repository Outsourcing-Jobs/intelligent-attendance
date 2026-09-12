"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { attendanceService } from "@/services/attendance.service";
import { toast } from "sonner";
import { Loader2, History, AlertCircle } from "lucide-react";

interface AttendanceRecord {
  _id: string;
  status: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  note?: string | null;
  studentId?: {
    _id?: string;
    fullName?: string;
    userCode?: string;
    email?: string;
  };
  courseSectionId?: {
    sectionCode?: string;
    subjectId?: {
      name?: string;
      code?: string;
    };
  };
  classSessionId?: {
    date?: string;
    room?: string;
    startPeriod?: number;
  };
}

interface AttendanceAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AttendanceRecord | null;
  onSuccess: () => void;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  present: { label: "Đúng giờ (Có mặt)", variant: "default" },
  late: { label: "Đi muộn", variant: "destructive" },
  early_leave: { label: "Về sớm", variant: "destructive" },
  excused: { label: "Có phép (Excused)", variant: "secondary" },
  absent: { label: "Vắng mặt không phép", variant: "destructive" },
};

export function AttendanceAdjustmentDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: AttendanceAdjustmentDialogProps) {
  const [newStatus, setNewStatus] = useState<string>("present");
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [audits, setAudits] = useState<any[]>([]);
  const [loadingAudits, setLoadingAudits] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    if (record) {
      setNewStatus(record.status || "present");
      setReason("");
      setShowHistory(false);
      loadAudits(record._id);
    }
  }, [record]);

  const loadAudits = async (attendanceId: string) => {
    try {
      setLoadingAudits(true);
      const res = await attendanceService.getAudits(attendanceId);
      setAudits(res || []);
    } catch {
      setAudits([]);
    } finally {
      setLoadingAudits(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record?._id) return;

    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do điều chỉnh điểm danh");
      return;
    }

    try {
      setSubmitting(true);
      await attendanceService.updateStatus(record._id, {
        status: newStatus,
        reason: reason.trim(),
      });

      toast.success("Điều chỉnh trạng thái điểm danh thành công!");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật trạng thái điểm danh.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!record) return null;

  const student = record.studentId || {};
  const currentStatusInfo = STATUS_LABELS[record.status] || {
    label: record.status,
    variant: "outline",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            Điều Chỉnh Trạng Thái Điểm Danh
          </DialogTitle>
          <DialogDescription>
            Thực hiện thay đổi trạng thái chuyên cần của sinh viên và lưu lại lịch sử truy vết (Audit Log).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Thông tin sinh viên */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">
                {student.fullName || "Sinh viên"}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                Mã SV: {student.userCode || "N/A"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Email: {student.email || "N/A"}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">Trạng thái hiện tại:</span>
              <Badge variant={currentStatusInfo.variant} className="text-xs">
                {currentStatusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Chọn trạng thái mới */}
          <div className="space-y-1.5">
            <Label htmlFor="status-select" className="text-sm font-medium">
              Trạng thái mới <span className="text-destructive">*</span>
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger id="status-select" className="w-full">
                <SelectValue placeholder="Chọn trạng thái điểm danh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Đúng giờ (Có mặt)</SelectItem>
                <SelectItem value="late">Đi muộn</SelectItem>
                <SelectItem value="early_leave">Về sớm</SelectItem>
                <SelectItem value="excused">Có phép (Đơn xin nghỉ được duyệt)</SelectItem>
                <SelectItem value="absent">Vắng mặt không phép</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lý do / Ghi chú điều chỉnh */}
          <div className="space-y-1.5">
            <Label htmlFor="adjustment-reason" className="text-sm font-medium">
              Lý do điều chỉnh <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="adjustment-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do cụ thể (ví dụ: Sinh viên có đơn xác nhận của khoa, sửa lỗi nhận diện camera...)"
              rows={3}
              className="resize-none"
              required
            />
          </div>

          {/* Xem lịch sử Audit Log */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-primary flex items-center gap-1 hover:underline focus:outline-none"
            >
              <History className="h-3.5 w-3.5" />
              {showHistory ? "Ẩn lịch sử điều chỉnh" : `Xem lịch sử điều chỉnh (${audits.length})`}
            </button>

            {showHistory && (
              <div className="mt-2 p-2.5 border rounded-md bg-muted/30 max-h-40 overflow-y-auto space-y-2 text-xs">
                {loadingAudits ? (
                  <div className="py-2 text-center text-muted-foreground">Đang tải lịch sử...</div>
                ) : audits.length === 0 ? (
                  <div className="py-2 text-center text-muted-foreground">
                    Chưa có lần chỉnh sửa nào trước đây.
                  </div>
                ) : (
                  audits.map((item, idx) => (
                    <div key={item._id || idx} className="border-b last:border-b-0 pb-1.5">
                      <div className="flex justify-between font-medium">
                        <span>
                          {STATUS_LABELS[item.previousStatus]?.label || item.previousStatus} →{" "}
                          <span className="text-primary font-semibold">
                            {STATUS_LABELS[item.newStatus]?.label || item.newStatus}
                          </span>
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-0.5">
                        Người sửa: <span className="font-medium text-foreground">{item.updatedBy?.fullName || "Admin"}</span>
                      </div>
                      <div className="text-muted-foreground italic mt-0.5">
                        Lý do: &quot;{item.reason}&quot;
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Xác nhận cập nhật
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
