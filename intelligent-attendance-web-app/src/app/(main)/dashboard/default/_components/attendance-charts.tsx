"use client";

import { useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

const weeklyAttendanceData = [
  { week: "Tuần 1", present: 412, late: 24, absent: 14, excused: 8, rate: 94.2 },
  { week: "Tuần 2", present: 425, late: 18, absent: 11, excused: 12, rate: 95.1 },
  { week: "Tuần 3", present: 398, late: 32, absent: 22, excused: 9, rate: 91.8 },
  { week: "Tuần 4", present: 430, late: 15, absent: 8, excused: 10, rate: 96.3 },
  { week: "Tuần 5", present: 388, late: 38, absent: 29, excused: 15, rate: 89.6 },
  { week: "Tuần 6", present: 418, late: 21, absent: 17, excused: 11, rate: 93.8 },
  { week: "Tuần 7 (Hiện tại)", present: 436, late: 16, absent: 12, excused: 7, rate: 94.9 },
];

const aiRiskDistributionData = [
  { name: "An Toàn (Low Risk)", count: 284, percentage: "81.8%", color: "#10B981", desc: "Tỷ lệ chuyên cần ≥ 80%, Điểm CC ≥ 8.0" },
  { name: "Cần Theo Dõi (Medium)", count: 42, percentage: "12.1%", color: "#F59E0B", desc: "Tỷ lệ chuyên cần 65% - 79%, Điểm CC 6.0 - 7.5" },
  { name: "Nguy Cơ Cấm Thi (High Risk)", count: 21, percentage: "6.1%", color: "#EF4444", desc: "Tỷ lệ chuyên cần < 65% hoặc vắng ≥ 20%" },
];

export function AttendanceCharts() {
  const [activeTab, setActiveTab] = useState<"weekly" | "risk">("weekly");

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold sm:text-lg">
              Phân Tích Xu Hướng Điểm Danh & Chuyên Cần
            </CardTitle>
            <Badge variant="outline" className="border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px]">
              Thời gian thực
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Dữ liệu tổng hợp theo tuần học và mô hình AI Random Forest dự báo nguy cơ cấm thi
          </CardDescription>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
          <TabsList className="grid grid-cols-2 h-8 text-xs">
            <TabsTrigger value="weekly" className="text-xs px-3">Theo Tuần Học</TabsTrigger>
            <TabsTrigger value="risk" className="text-xs px-3">Phân Bố Rủi Ro AI</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {activeTab === "weekly" ? (
          <div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="lateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(15, 23, 42, 0.9)", 
                      borderRadius: "8px", 
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                    formatter={(val: any, name: any) => {
                      const labels: Record<string, string> = {
                        present: "Có mặt đúng giờ",
                        late: "Đi muộn",
                        absent: "Vắng không phép",
                        excused: "Có phép"
                      };
                      return [`${val} lượt`, labels[name] || name];
                    }}
                  />
                  <Area type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#presentGrad)" name="present" />
                  <Area type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#lateGrad)" name="late" />
                  <Area type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#absentGrad)" name="absent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Micro Highlights strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Có mặt đúng giờ</p>
                  <p className="font-bold text-foreground">94.9% trung bình</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <span className="size-2.5 rounded-full bg-amber-500" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Đi muộn</p>
                  <p className="font-bold text-foreground">3.7% trung bình</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                <span className="size-2.5 rounded-full bg-rose-500" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Vắng không phép</p>
                  <p className="font-bold text-foreground">2.4% (Cần lưu ý)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <span className="size-2.5 rounded-full bg-blue-500" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Có phép (Excused)</p>
                  <p className="font-bold text-foreground">1.8% đã duyệt</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiRiskDistributionData} layout="vertical" margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted/40" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={160} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(15, 23, 42, 0.9)", 
                      borderRadius: "8px", 
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                    formatter={(val: any) => [`${val} sinh viên`, "Số lượng"]}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={26}>
                    {aiRiskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Risk Breakdown Explanations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t text-xs">
              {aiRiskDistributionData.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border bg-muted/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs" style={{ color: item.color }}>{item.name}</span>
                    <Badge variant="outline" className="text-[10px] font-bold" style={{ borderColor: `${item.color}40`, color: item.color }}>
                      {item.percentage}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
