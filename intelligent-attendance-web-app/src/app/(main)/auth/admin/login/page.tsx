import Link from "next/link";
import { Activity, Crown, KeyRound, Lock, Server, ShieldAlert, ShieldCheck } from "lucide-react";

import { LoginForm } from "../../_components/login-form";

export default function AdminLogin() {
  return (
    <div className="flex h-dvh bg-slate-50/70 dark:bg-slate-950">
      {/* Left Banner - Admin Control Identity */}
      <div className="relative hidden w-5/12 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 lg:block">
        <div className="absolute -top-32 -left-32 size-[450px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 size-[450px] rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Subtle Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          {/* School Header Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/R-circle.svg" alt="Logo" className="size-12 object-contain" />
              <div>
                <h1 className="font-extrabold text-lg tracking-wide leading-tight">TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VIỆT HUNG</h1>
                <p className="text-indigo-300 text-xs tracking-wider uppercase font-medium">
                  Hệ thống Đào tạo Thông Minh
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="rounded-md bg-white/10 px-2.5 py-0.5 font-medium text-xs backdrop-blur-md text-indigo-200 border border-white/5">
                Cổng Quản trị Viên
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-0.5 font-medium text-xs backdrop-blur-md text-indigo-200 border border-white/5">
                VIU Terminal
              </span>
            </div>
          </div>

          {/* Academic Features Showcase */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-400/20 px-3.5 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md">
              <Crown className="size-3.5 text-amber-400" />
              Bảng Điều Hành Trung Tâm (Central Control)
            </div>

            <h2 className="font-extrabold text-3xl leading-snug tracking-tight">
              Giám sát, Cấu hình & <br /> Quản trị Dữ liệu Đào tạo
            </h2>

            <div className="space-y-3 pt-1 text-sm text-indigo-200/90">
              <div className="flex items-center gap-2.5">
                <Server className="size-4 shrink-0 text-sky-400" />
                <span>Cấu hình tham số WiFi IP & Vị trí GPS phòng học</span>
              </div>
              <div className="flex items-center gap-2.5">
                <KeyRound className="size-4 shrink-0 text-amber-400" />
                <span>Quản lý danh sách Người dùng & Phân quyền tài khoản</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Activity className="size-4 shrink-0 text-rose-400" />
                <span>Theo dõi lịch sử chuyên cần & Thống kê thời gian thực</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 shrink-0 text-emerald-400" />
                <span>Giám sát liên kết thiết bị di động, chống điểm danh hộ</span>
              </div>
            </div>
          </div>

          {/* Footer Info Badge */}
          <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 p-3.5 text-xs text-indigo-300 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-400" />
              <span>Khu vực hạn chế truy cập</span>
            </div>
            <span className="font-mono text-[10px] text-indigo-400">Server Status: Online</span>
          </div>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex w-full items-center justify-center p-6 lg:w-7/12">
        <div className="w-full max-w-md space-y-6 rounded-2xl border bg-background p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="space-y-2 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Crown className="size-8" />
            </div>
            <h1 className="font-bold text-2xl tracking-tight text-slate-950 dark:text-white">Đăng nhập Quản trị viên</h1>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Vui lòng đăng nhập bằng tài khoản Quản trị viên hệ thống để truy cập trang điều hành.
            </p>
          </div>

          <LoginForm userType="admin" />

          <div className="space-y-4 border-t pt-4 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                Quên mật khẩu?
              </Link>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Lock className="size-3.5" />
                Bảo mật 2FA / SSO
              </span>
            </div>

            <div className="text-center text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/50">
              Không phải Quản trị viên?{" "}
              <Link href="/auth/student/login" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold dark:text-blue-400">
                Vào Cổng Sinh viên
              </Link>{" "}
              |{" "}
              <Link href="/auth/teacher/login" className="text-teal-600 hover:text-teal-700 hover:underline font-semibold dark:text-teal-400">
                Cổng Giảng viên
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
