"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Wifi } from "lucide-react";

export function InstitutionalFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 & 2: Institutional Brand & Contact (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white shadow-md shadow-blue-500/25">
                <MapPin className="size-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block">
                  TRƯỜNG ĐẠI HỌC CÔNG NGHỆ & ĐÀO TẠO
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Hệ thống Quản lý Đào tạo & Điểm danh GPS - IP Wi-Fi
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Nền tảng số hóa học vụ toàn diện, tích hợp công nghệ định vị GPS phòng học và xác thực dải IP Wi-Fi nội
              bộ đạt chuẩn quốc gia.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Hotline Phòng Đào tạo: (024) 3869 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Email hỗ trợ: daotao@university.edu.vn</span>
              </div>
            </div>
          </div>

          {/* Col 3: Cổng Chức năng */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Cổng Trực tuyến
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/auth/v1/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Cổng Sinh viên (V1)
                </Link>
              </li>
              <li>
                <Link href="/auth/v2/login" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Cổng Giảng viên (V2)
                </Link>
              </li>
              <li>
                <Link href="/auth/admin/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Bảng Quản trị (Admin)
                </Link>
              </li>
              <li>
                <a href="#overview" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Tra cứu Lịch thi & Thời khóa biểu
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Quy chế & Hướng dẫn */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Quy chế & Hướng dẫn
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#security" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Quy chế Đào tạo Tín chỉ
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Hướng dẫn Điểm danh GPS & Wi-Fi
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Chính sách Bảo mật Quyền riêng tư
                </a>
              </li>
              <li>
                <a href="#overview" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Hỏi đáp (FAQ) Sinh viên
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Vận hành Kỹ thuật */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Vận hành Hệ thống
            </h4>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Trạng thái:</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Uptime SLA: <strong>99.98%</strong> • GPS Gateway Online
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              Đơn vị chủ quản: <strong>Trung tâm CNTT & Truyền thông</strong>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            Bản quyền © 2026 <strong>Trường Đại học Công nghệ & Đào tạo</strong>. Tất cả các quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>Phiên bản v2.4.2 LTS</span>
            <span>•</span>
            <span>Hạ tầng Định vị & Wi-Fi Trường học</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
