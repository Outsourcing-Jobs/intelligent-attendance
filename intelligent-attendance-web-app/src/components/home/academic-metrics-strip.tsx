"use client";

import { Users, School, LocateFixed, Activity } from "lucide-react";

const METRICS = [
  {
    label: "Sinh viên Đang theo học",
    value: "45,000+",
    sub: "Check-in 1 chạm tại phòng học",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    label: "Giảng viên & Cán bộ",
    value: "1,200+",
    sub: "Quản lý ca & bán kính geofence",
    icon: School,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/10",
  },
  {
    label: "Tốc độ Xác thực Vị trí",
    value: "< 0.3s",
    sub: "GPS Geofence + IP Wi-Fi Allowlist",
    icon: LocateFixed,
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    label: "Độ khả dụng Hệ thống",
    value: "99.98%",
    sub: "Chuẩn vận hành SLA Đào tạo",
    icon: Activity,
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

export function AcademicMetricsStrip() {
  return (
    <section className="py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Double-Bezel Metric Wrapper */}
        <div className="rounded-[2rem] p-1.5 bg-slate-200/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 shadow-xl shadow-slate-900/5">
          <div className="rounded-[calc(2rem-0.375rem)] bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              {METRICS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex flex-col justify-between ${idx > 0 ? "sm:pl-6 pt-4 sm:pt-0" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {item.label}
                      </span>
                      <div className={`grid size-7 place-items-center rounded-lg ${item.bg} ${item.color}`}>
                        <Icon className="size-3.5" />
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {item.value}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {item.sub}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
