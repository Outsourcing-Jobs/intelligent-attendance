import Link from "next/link";
import { School, ShieldCheck } from "lucide-react";

import { LoginForm } from "../../_components/login-form";

export default function LoginV2() {
  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl border bg-background p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="space-y-2 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
          <School className="size-8" />
        </div>
        <h1 className="font-bold text-2xl tracking-tight">Đăng nhập Giảng viên</h1>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Nhập Mã Giảng viên (MSGV) hoặc Email cán bộ do nhà trường cấp để truy cập hệ thống.
        </p>
      </div>

      <LoginForm userType="faculty" />

      <div className="space-y-3 border-t pt-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground/80">
          <Link href="/auth/forgot-password" className="font-semibold text-teal-600 hover:underline dark:text-teal-400">
            Quên mật khẩu?
          </Link>
          <div className="flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-teal-600 dark:text-teal-400" />
            <span>Cổng Quản trị Nội bộ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
