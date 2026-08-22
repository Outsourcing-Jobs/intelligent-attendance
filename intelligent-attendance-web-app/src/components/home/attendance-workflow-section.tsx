"use client";

import { Wifi, MapPin, ShieldCheck, CheckCircle2, ArrowRight, Radio } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Kết nối Wi-Fi Trường & Bật GPS",
    desc: "Sinh viên bước vào giảng đường, kết nối mạng Wi-Fi trường học và mở Cổng Sinh viên (V1) để bắt đầu check-in.",
    icon: Wifi,
    accent: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/60",
    border: "border-blue-500/30",
  },
  {
    step: "02",
    title: "Xác thực GPS & Subnet Wi-Fi",
    desc: "Hệ thống tự động so sánh tọa độ thiết bị với tâm phòng học và kiểm tra IP mạng thuộc danh sách Allowlist của trường.",
    icon: MapPin,
    accent: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/60",
    border: "border-teal-500/30",
  },
  {
    step: "03",
    title: "Quét Chống Fake GPS & VPN",
    desc: "Thuật toán kiểm tra cảm biến thiết bị, chặn ngay các ứng dụng giả lập tọa độ (Mock Location) hoặc VPN che giấu IP.",
    icon: ShieldCheck,
    accent: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/60",
    border: "border-indigo-500/30",
  },
  {
    step: "04",
    title: "Ghi nhận Có mặt & Đồng bộ Realtime",
    desc: "Ghi nhận điểm danh thành công, sĩ số lớp tự động nhảy số tức thì qua WebSocket trên màn hình của Giảng viên.",
    icon: CheckCircle2,
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    border: "border-emerald-500/30",
  },
];

export function AttendanceWorkflowSection() {
  return (
    <section id="workflow" className="py-16 sm:py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50/60 dark:bg-blue-950/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">
            <Radio className="size-3" />
            <span>QUY TRÌNH VẬN HÀNH THÔNG MINH</span>
          </div>

          <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] tracking-tight text-slate-900 dark:text-white leading-tight">
            Quy trình Điểm danh 1 Chạm GPS & Wi-Fi IP
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-[62ch]">
            Tối giản thời gian điểm danh chỉ trong 1 thao tác chạm đơn giản, đảm bảo 100% sinh viên đang có mặt thực tế
            tại phòng học.
          </p>
        </div>

        {/* 4-Step Track */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative rounded-[2rem] p-1.5 bg-slate-200/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 shadow-lg shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white dark:bg-slate-900 p-6 flex flex-col justify-between space-y-6">
                  <div>
                    {/* Step Header */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-slate-300 dark:text-slate-700">
                        {item.step}
                      </span>
                      <div className={`grid size-10 place-items-center rounded-xl ${item.bg} ${item.accent}`}>
                        <Icon className="size-5" />
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="mt-4">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Flow Arrow (For non-last on desktop) */}
                  {idx < STEPS.length - 1 && (
                    <div className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>Chuyển tiếp bước {STEPS[idx + 1].step}</span>
                      <ArrowRight className="size-3 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
