"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AttendanceRiskResult } from "@/services/attendance.service";
import { AlertTriangle, Bot, CheckCircle2, Info, ShieldAlert, Sparkles, User } from "lucide-react";

interface AiRiskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  studentCode?: string;
  riskData: AttendanceRiskResult | null;
  isLecturerView?: boolean;
}

export function AiRiskDetailDialog({
  open,
  onOpenChange,
  studentName,
  studentCode,
  riskData,
  isLecturerView = true,
}: AiRiskDetailDialogProps) {
  if (!riskData) return null;

  const isHigh = riskData.risk === "HIGH";
  const isMedium = riskData.risk === "MEDIUM";

  const badgeColor = isHigh
    ? "bg-rose-100 text-rose-800 border-rose-300"
    : isMedium
    ? "bg-amber-100 text-amber-800 border-amber-300"
    : "bg-emerald-100 text-emerald-800 border-emerald-300";

  const probabilityPct = (riskData.riskProbability * 100).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wide uppercase">
            <Bot className="h-4 w-4" /> Hệ Thống Cảnh Báo Sớm Điểm Chuyên Cần AI
          </div>
          <DialogTitle className="text-lg flex items-center justify-between pt-1">
            <span>Chi Tiết Đánh Giá Rủi Ro</span>
            <Badge variant="outline" className={`text-xs px-2 py-0.5 font-bold ${badgeColor}`}>
              {riskData.riskLevel?.label || riskData.risk}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Dự báo dựa trên mô hình Machine Learning ({riskData.model || "Random Forest"}) phân tích hành vi điểm danh theo chuỗi thời gian.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs pt-1">
          {/* Thông tin sinh viên */}
          {(studentName || studentCode) && (
            <div className="flex items-center gap-2 p-2.5 bg-muted/60 rounded-md border text-muted-foreground">
              <User className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="font-semibold text-foreground">{studentName || "Sinh viên"}</span>
                {studentCode && <span className="ml-1.5 font-mono">({studentCode})</span>}
              </div>
            </div>
          )}

          {/* Xác suất và mô hình */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted/40 rounded-lg border">
              <span className="text-muted-foreground text-[11px] block">Xác Suất Rủi Ro AI</span>
              <div className="text-xl font-bold mt-1 flex items-baseline gap-1">
                <span className={isHigh ? "text-rose-600" : isMedium ? "text-amber-600" : "text-emerald-600"}>
                  {probabilityPct}%
                </span>
                <span className="text-[10px] font-normal text-muted-foreground">nguy cơ</span>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-lg border">
              <span className="text-muted-foreground text-[11px] block">Thuật Toán Phục Vụ</span>
              <div className="text-sm font-semibold mt-1 flex items-center gap-1.5 text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>{riskData.model}</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                {riskData.is_fallback ? "Chế độ dự phòng nội bộ" : "FastAPI Microservice"}
              </span>
            </div>
          </div>

          {/* Khuyến nghị AI thông minh */}
          <div className={`p-3.5 rounded-lg border ${
            isHigh
              ? "bg-rose-50/70 border-rose-200 text-rose-950"
              : isMedium
              ? "bg-amber-50/70 border-amber-200 text-amber-950"
              : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
          }`}>
            <div className="flex items-center gap-1.5 font-semibold text-xs mb-1.5">
              {isHigh ? (
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
              ) : isMedium ? (
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              )}
              <span>{isLecturerView ? "Đề Xuất Hành Động Giảng Viên" : "Khuyến Nghị Dành Cho Bạn"}</span>
            </div>
            <p className="text-xs leading-relaxed">
              {isLecturerView
                ? riskData.recommendation?.for_lecturer
                : riskData.recommendation?.for_student}
            </p>
          </div>

          {/* Các đặc trưng trích xuất */}
          {riskData.features && (
            <div className="space-y-1.5">
              <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Info className="h-3 w-3" /> Chỉ Số Điểm Danh Thời Điểm Dự Báo
              </span>
              <div className="grid grid-cols-3 gap-2 text-[11px] p-2 bg-muted/30 rounded border">
                <div>
                  <span className="text-muted-foreground block">Đã học:</span>
                  <span className="font-semibold">{riskData.features.total_sessions} buổi</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Vắng liên tiếp:</span>
                  <span className={`font-semibold ${riskData.features.consecutive_absence >= 2 ? "text-rose-600 font-bold" : ""}`}>
                    {riskData.features.consecutive_absence} buổi
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Tỷ lệ vắng:</span>
                  <span className={`font-semibold ${riskData.features.absence_rate >= 0.2 ? "text-rose-600 font-bold" : ""}`}>
                    {(riskData.features.absence_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Đi muộn:</span>
                  <span className="font-semibold">{riskData.features.late_count} lần</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Vắng 3b gần nhất:</span>
                  <span className="font-semibold">{(riskData.features.recent_absence_rate * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Xu hướng:</span>
                  <span className={`font-semibold ${riskData.features.attendance_trend < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {riskData.features.attendance_trend > 0 ? "+" : ""}{(riskData.features.attendance_trend * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
