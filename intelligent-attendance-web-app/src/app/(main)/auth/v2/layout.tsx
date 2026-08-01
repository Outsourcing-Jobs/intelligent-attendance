import type { ReactNode } from "react";

import { Award, BookOpenCheck, CheckCircle2, FileCheck2, School, ShieldCheck, UserCheck } from "lucide-react";

import { Separator } from "@/components/ui/separator";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="bg-slate-50/70 dark:bg-slate-950">
      <div className="grid h-dvh justify-center p-3 lg:grid-cols-2">
        {/* Left Side Decorative Academic Panel */}
        <div className="relative order-2 hidden h-full overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-emerald-700 to-cyan-700 lg:flex">
          <div className="absolute -top-32 -left-32 size-[450px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 size-[450px] rounded-full bg-emerald-200/20 blur-3xl" />

          {/* Subtle Background Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            {/* School Header Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
                  <School className="size-7 text-emerald-200" />
                </div>
                <div>
                  <h1 className="font-extrabold text-xl tracking-wide">ĐẠI HỌC CÔNG NGHỆ & ĐÀO TẠO</h1>
                  <p className="text-emerald-200 text-xs tracking-wider uppercase font-medium">
                    Hệ thống Quản trị Giảng dạy & Đào tạo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="rounded-md bg-white/15 px-2.5 py-0.5 font-medium text-xs backdrop-blur-md">
                  Khu vực Cán bộ / Giảng viên
                </span>
                <span className="rounded-md bg-white/15 px-2.5 py-0.5 font-medium text-xs backdrop-blur-md">
                  Niên khóa 2025 - 2026
                </span>
              </div>
            </div>

            {/* Faculty Features List */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                <Award className="size-3.5 text-yellow-300" />
                Cổng Quản lý Học vụ Giảng viên
              </div>

              <h2 className="font-extrabold text-3xl leading-snug tracking-tight">Đồng hành cùng Chất lượng Đào tạo</h2>

              <div className="space-y-3 pt-1 text-sm text-emerald-100/90">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="size-4 shrink-0 text-cyan-300" />
                  <span>Quản lý Danh sách Lớp học & Điểm danh Sinh viên</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="size-4 shrink-0 text-amber-300" />
                  <span>Nhập điểm Thi, Điểm thành phần & Khóa sổ điểm</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookOpenCheck className="size-4 shrink-0 text-cyan-300" />
                  <span>Phê duyệt Đăng ký học phần & Đơn hoãn thi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
                  <span>Xác thực Chữ ký số Cán bộ Giảng dạy an toàn</span>
                </div>
              </div>
            </div>

            {/* Footer Support Info */}
            <div className="flex items-center justify-between rounded-xl bg-white/10 p-3.5 text-xs text-emerald-100 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-300" />
                <span>Bảo mật Chuẩn ISO/IEC 27001</span>
              </div>
              <span className="font-medium text-white/90">Hỗ trợ Kỹ thuật: (024) 3838 9999</span>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="relative order-1 flex h-full items-center justify-center p-4">{children}</div>
      </div>
    </main>
  );
}
