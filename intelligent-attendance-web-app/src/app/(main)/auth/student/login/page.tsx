import Link from "next/link";

import { Award, BookOpen, Calendar, CheckCircle2, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

import { LoginForm } from "../../_components/login-form";

export default function LoginV1() {
  return (
    <div className="flex h-dvh bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/40 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      {/* Left Banner - School Academic Identity */}
      <div className="relative hidden w-5/12 overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 lg:block">
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -left-24 size-[400px] rounded-full bg-white/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-[400px] rounded-full bg-sky-300/25 blur-3xl pointer-events-none" />

        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-9 text-white">
          {/* School Header Identity */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <img src="/R-circle.svg" alt="Logo" className="size-11 object-contain drop-shadow-md" />
              <div>
                <h1 className="font-extrabold text-lg tracking-tight leading-snug">TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VIỆT HUNG</h1>
                <p className="text-sky-200 text-[11px] tracking-wider uppercase font-medium">
                  Hệ thống Đào tạo Thông minh
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="rounded-full bg-white/15 border border-white/10 px-3 py-0.5 font-medium text-[11px] backdrop-blur-md">
                Mã trường: VIU
              </span>
              <span className="rounded-full bg-white/15 border border-white/10 px-3 py-0.5 font-medium text-[11px] backdrop-blur-md">
                Cổng Sinh Viên
              </span>
            </div>
          </div>

          {/* Academic Features Showcase */}
          <div className="space-y-5 my-auto py-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md text-amber-200">
              <Sparkles className="size-3.5 text-amber-300" />
              Cổng Thông tin Học tập & Điểm danh
            </div>

            <h2 className="font-extrabold text-3xl leading-snug tracking-tight">
              Tra cứu Lịch học, Điểm danh <br />& Quản lý Học tập
            </h2>

            <div className="space-y-2.5 text-xs text-blue-50/95 font-medium">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
                <Calendar className="size-4 shrink-0 text-sky-300" />
                <span>Thời khóa biểu & Lịch thi cá nhân tự động</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
                <Award className="size-4 shrink-0 text-amber-300" />
                <span>Điểm danh tự động qua định vị GPS & IP WiFi</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
                <BookOpen className="size-4 shrink-0 text-sky-300" />
                <span>Xem lịch sử chuyên cần & Thống kê cá nhân</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
                <span>Nhận thông báo chính thức từ Phòng Đào tạo</span>
              </div>
            </div>
          </div>

          {/* Footer Info Badge */}
          <div className="flex items-center justify-between rounded-2xl bg-white/10 border border-white/10 p-3 text-xs text-blue-100 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-300" />
              <span>Hệ thống Đăng nhập SSO Sinh viên VIU</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex w-full items-center justify-center p-4 sm:p-6 lg:w-7/12">
        <div className="w-full max-w-md space-y-5 rounded-3xl border border-slate-200/80 bg-white/90 p-7 sm:p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none">
          <div className="space-y-2 text-center">
            <div className="mx-auto grid size-13 place-items-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-sm dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-900">
              <GraduationCap className="size-7" />
            </div>
            <h1 className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Đăng nhập Sinh viên</h1>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Nhập Mã số sinh viên (MSSV) hoặc Email nhà trường cấp để truy cập cổng thông tin.
            </p>
          </div>

          <LoginForm userType="student" />

          <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="font-semibold text-xs text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400"
              >
                Quên mật khẩu?
              </Link>
              <Link
                href="/auth/student/register"
                className="font-semibold text-xs text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
              >
                Kích hoạt tài khoản
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
