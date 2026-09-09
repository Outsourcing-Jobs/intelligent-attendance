"use client";

import Link from "next/link";
import {
  GraduationCap,
  School,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  MapPin,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PORTALS = [
  {
    id: "student",
    role: "Sinh viên",
    badge: "Sinh viên",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 ring-1 ring-blue-500/20",
    title: "Cổng Thông tin Sinh viên",
    description:
      "Dành cho Sinh viên điểm danh 1 chạm qua GPS phòng học & Wi-Fi trường, tra cứu lịch thi, thời khóa biểu và bảng điểm.",
    href: "/auth/student/login",
    ctaText: "Đăng nhập Sinh viên",
    icon: GraduationCap,
    accentBorder: "border-t-4 border-t-blue-600",
    accentColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-600 text-white shadow-blue-500/25",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
    features: [
      "Điểm danh 1 chạm qua GPS & Wi-Fi trường hợp lệ",
      "Lịch sử check-in vị trí, khoảng cách & thời gian",
      "Thời khóa biểu & Lịch thi cá nhân tự động",
      "Xem bảng điểm tín chỉ, GPA & Đăng ký học phần",
    ],
  },
  {
    id: "faculty",
    role: "Giảng viên",
    badge: "Giảng viên",
    badgeColor: "bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 ring-1 ring-teal-500/20",
    title: "Cổng Giảng viên & Cán bộ",
    description:
      "Dành cho Giảng viên quản lý lớp tín chỉ, mở ca điểm danh theo bán kính phòng học, duyệt điểm thi và ký số điện tử.",
    href: "/auth/teacher/login",
    ctaText: "Đăng nhập Giảng viên",

    icon: School,
    accentBorder: "border-t-4 border-t-teal-600",
    accentColor: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-600 text-white shadow-teal-500/25",
    btnColor: "bg-teal-600 hover:bg-teal-700 text-white",
    features: [
      "Mở ca điểm danh GPS Geofence theo từng phòng học",
      "Cấu hình bán kính phòng học (15m-30m) & Wi-Fi IP",
      "Theo dõi sinh viên check-in trực tiếp thời gian thực",
      "Nhập điểm thi thành phần & Ký số bảng điểm",
    ],
  },
  {
    id: "admin",
    role: "Ban Quản trị",
    badge: "Bảng Điều Hành",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 ring-1 ring-amber-500/20",
    title: "Bảng Quản trị Hệ thống",
    description:
      "Dành cho Ban Giám hiệu & Quản trị viên phòng Đào tạo quản lý tọa độ phòng học, cấu hình dải IP Wi-Fi và phân quyền.",
    href: "/auth/admin/login",
    ctaText: "Đăng nhập Quản trị (Admin)",
    icon: ShieldCheck,
    accentBorder: "border-t-4 border-t-indigo-600",
    accentColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-slate-900 dark:bg-indigo-600 text-white shadow-indigo-500/25",
    btnColor: "bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white",
    features: [
      "Quản lý danh mục phòng học & Tọa độ GPS toàn trường",
      "Cấu hình Allowlist dải IP Wi-Fi giảng đường",
      "Phát hiện & Ngăn chặn các trường hợp Fake GPS",
      "Báo cáo học vụ & Phân tích chuyên sâu toàn trường",
    ],
  },
];

export function RolePortalsSection() {
  return (
    <section id="portals" className="py-16 sm:py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50/60 dark:bg-blue-950/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">
            <Layers className="size-3" />
            <span>CỔNG PHÂN QUYỀN TRUY CẬP</span>
          </div>

          <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] tracking-tight text-slate-900 dark:text-white leading-tight">
            Lựa chọn Cổng Chức năng Tối ưu cho Từng Vai trò
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-[62ch]">
            Trải nghiệm giao diện được may đo chuyên biệt cho Sinh viên, Giảng viên và Ban Quản lý Đào tạo.
          </p>
        </div>

        {/* 3 Portal Cards with Double-Bezel Architecture */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PORTALS.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                className="group relative rounded-[2rem] p-1.5 bg-slate-200/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 shadow-xl shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                {/* Inner Core */}
                <div
                  className={`relative flex flex-col justify-between h-full rounded-[calc(2rem-0.375rem)] bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] ${portal.accentBorder}`}
                >
                  <div className="space-y-5">
                    {/* Top Tag & Icon */}
                    <div className="flex items-center justify-between">
                      <div className={`grid size-12 place-items-center rounded-2xl ${portal.iconBg} shadow-md transition-transform duration-300 group-hover:scale-105`}>
                        <Icon className="size-6 text-white" />
                      </div>
                      <span className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                        {portal.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {portal.description}
                      </p>
                    </div>

                    {/* Features Checklist */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      {portal.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className={`size-4 shrink-0 mt-0.5 ${portal.accentColor}`} />
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Island Button-in-Button CTA */}
                  <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link href={portal.href} className="w-full block">
                      <Button
                        size="lg"
                        className={`w-full justify-between h-12 rounded-full pl-5 pr-2 font-bold text-xs sm:text-sm shadow-md transition-all duration-300 active:scale-98 cursor-pointer ${portal.btnColor}`}
                      >
                        <span className="truncate">{portal.ctaText}</span>
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                          <ArrowRight className="size-4" />
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
