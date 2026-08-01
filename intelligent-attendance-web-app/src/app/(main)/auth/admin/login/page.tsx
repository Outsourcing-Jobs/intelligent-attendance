import Link from "next/link";
import { Activity, Crown, KeyRound, Lock, Server, ShieldAlert, ShieldCheck } from "lucide-react";

import { LoginForm } from "../../_components/login-form";

export default function AdminLogin() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-slate-950 px-4 text-slate-100">
      {/* Background Glow Highlights */}
      <div className="absolute top-1/3 left-1/2 -z-10 size-[500px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]" />
      <div className="absolute top-10 right-10 -z-10 size-72 rounded-full bg-amber-500/10 blur-[100px]" />

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="space-y-3 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-indigo-600/20 to-purple-600/20 text-amber-400 shadow-inner">
            <Crown className="size-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-300">
            <ShieldAlert className="size-3.5" />
            CỔNG QUẢN TRỊ TRUNG TÂM (ADMIN ONLY)
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-white">Đăng nhập Quản trị viên</h1>
          <p className="text-slate-400 text-xs leading-relaxed">
            Khu vực hạn chế. Vui lòng nhập tài khoản Admin hệ thống để truy cập bảng điều khiển và phân quyền.
          </p>
        </div>

        <LoginForm userType="admin" />

        <div className="space-y-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <Link href="/auth/forgot-password" className="text-[11px] font-medium text-amber-400 hover:underline">
              Quên mật khẩu?
            </Link>
            <span className="flex items-center gap-1 text-[11px]">
              <Lock className="size-3.5 text-amber-400" />
              Bảo mật 2FA / SSO
            </span>
          </div>

          <div className="text-center text-[11px] text-slate-500 pt-1">
            Không có quyền Admin?{" "}
            <Link href="/auth/v1/login" className="text-blue-400 hover:underline font-medium">
              Vào Cổng Sinh viên
            </Link>{" "}
            |{" "}
            <Link href="/auth/v2/login" className="text-teal-400 hover:underline font-medium">
              Cổng Giảng viên
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
