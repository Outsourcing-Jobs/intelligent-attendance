import { KeyRound } from "lucide-react";

import { ForgotPasswordForm } from "../_components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-slate-50/70 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-background p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-2 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <KeyRound className="size-8" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight">Quên mật khẩu?</h1>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Nhập địa chỉ email đăng ký tài khoản của bạn để nhận liên kết khôi phục mật khẩu.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
