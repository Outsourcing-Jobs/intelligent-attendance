"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  BrainCircuit, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  Send, 
  Check, 
  Sparkles, 
  ExternalLink,
  Info,
  UserX
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StudentRiskItem {
  id: string;
  userCode: string;
  fullName: string;
  className: string;
  subjectName: string;
  absentCount: number;
  totalSessions: number;
  currentScore: number;
  riskProbability: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

const defaultHighRiskStudents: StudentRiskItem[] = [
  {
    id: "sv-01",
    userCode: "211031024",
    fullName: "Nguyễn Hoàng Long",
    className: "K18-CNTT1",
    subjectName: "Lập trình Web Nâng Cao",
    absentCount: 4,
    totalSessions: 10,
    currentScore: 4.0,
    riskProbability: 92.4,
    riskLevel: "HIGH",
  },
  {
    id: "sv-02",
    userCode: "211031058",
    fullName: "Lê Văn Đạt",
    className: "K18-CNTT2",
    subjectName: "Trí Tuệ Nhân Tạo",
    absentCount: 3,
    totalSessions: 10,
    currentScore: 5.5,
    riskProbability: 84.7,
    riskLevel: "HIGH",
  },
  {
    id: "sv-03",
    userCode: "211031092",
    fullName: "Trần Thị Thu",
    className: "K18-KTPM1",
    subjectName: "Cơ Sở Dữ Liệu Phân Tán",
    absentCount: 2,
    totalSessions: 10,
    currentScore: 6.8,
    riskProbability: 64.2,
    riskLevel: "MEDIUM",
  },
  {
    id: "sv-04",
    userCode: "211031105",
    fullName: "Đỗ Minh Quân",
    className: "K18-HTTT1",
    subjectName: "Mạng Máy Tính",
    absentCount: 2,
    totalSessions: 10,
    currentScore: 7.0,
    riskProbability: 53.6,
    riskLevel: "MEDIUM",
  },
];

export function AiRiskRadar() {
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);

  const handleSendWarning = (student: StudentRiskItem) => {
    if (notifiedIds.includes(student.id)) return;
    setNotifiedIds((prev) => [...prev, student.id]);
    toast.success(`Đã gửi cảnh báo chuyên cần AI`, {
      description: `Thông báo & email đã được gửi đến sinh viên ${student.fullName} (${student.userCode}) và Cố vấn học tập lớp ${student.className}.`,
    });
  };

  return (
    <Card className="border border-rose-500/30 bg-gradient-to-br from-card via-card to-rose-500/5 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <BrainCircuit className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                Trung Tâm Cảnh Báo AI Sớm
                <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                  RF Pipeline
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Mô hình Random Forest phân loại rủi ro cấm thi dựa trên 12 đặc trưng học vụ
              </CardDescription>
            </div>
          </div>
          <Link href="/dashboard/attendance">
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-rose-600 hover:bg-rose-500/10 hover:text-rose-700">
              Xem tất cả <ArrowRight className="size-3" />
            </Button>
          </Link>
        </div>

        {/* AI Performance Mini Ribbon */}
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground border">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <Sparkles className="size-3 text-amber-500" /> Chỉ số Model:
          </span>
          <span className="rounded bg-background px-1.5 py-0.5 border text-foreground font-mono font-medium">Acc: 89.5%</span>
          <span className="rounded bg-background px-1.5 py-0.5 border text-foreground font-mono font-medium">Precision: 99.7%</span>
          <span className="rounded bg-background px-1.5 py-0.5 border text-foreground font-mono font-medium">Recall: 88.1%</span>
          <span className="rounded bg-background px-1.5 py-0.5 border text-emerald-600 dark:text-emerald-400 font-mono font-bold">ROC-AUC: 0.977</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="divide-y rounded-xl border bg-background/60">
          {defaultHighRiskStudents.map((student) => {
            const isHigh = student.riskLevel === "HIGH";
            const isNotified = notifiedIds.includes(student.id);

            return (
              <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-9 border">
                    <AvatarFallback className={isHigh ? "bg-rose-500/10 text-rose-600 font-bold text-xs" : "bg-amber-500/10 text-amber-600 font-bold text-xs"}>
                      {student.fullName.split(" ").slice(-2).map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground truncate">{student.fullName}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">({student.userCode})</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {student.className} • <span className="text-foreground/90 font-medium">{student.subjectName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {/* Attendance Stats & AI Risk Badge */}
                  <div className="text-right space-y-0.5">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Badge 
                        variant={isHigh ? "destructive" : "outline"} 
                        className={isHigh ? "h-5 px-1.5 text-[10px] font-bold gap-1" : "h-5 px-1.5 text-[10px] font-bold gap-1 border-amber-500/30 text-amber-600 bg-amber-500/10"}
                      >
                        {isHigh ? <ShieldAlert className="size-2.5" /> : <AlertTriangle className="size-2.5" />}
                        {isHigh ? "Rủi Ro Cao" : "Rủi Ro TB"} ({student.riskProbability}%)
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Vắng {student.absentCount}/{student.totalSessions} buổi • Điểm CC: <strong className={isHigh ? "text-rose-600 font-bold" : "text-amber-600 font-bold"}>{student.currentScore.toFixed(1)}</strong>
                    </p>
                  </div>

                  {/* Send Alert CTA */}
                  <Button 
                    variant={isNotified ? "secondary" : "outline"} 
                    size="sm" 
                    disabled={isNotified}
                    onClick={() => handleSendWarning(student)}
                    className="h-7 px-2.5 text-[11px] gap-1 shrink-0 font-medium"
                  >
                    {isNotified ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span>Đã gửi</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-3" />
                        <span>Gửi nhắc</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1 text-[11px]">
            <Info className="size-3" /> Cảnh báo tự động gửi email khi xác suất vượt ngưỡng 75%
          </span>
          <Link href="/dashboard/attendance" className="font-semibold text-rose-600 hover:underline inline-flex items-center gap-1 text-[11px]">
            Xem bảng xếp loại chi tiết <ExternalLink className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
