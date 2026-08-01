import { Suspense } from "react";
import { Lock } from "lucide-react";

import { ResetPasswordForm } from "../_components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-slate-50/70 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6 rounded-2xl border bg-background p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="space-y-2 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Lock className="size-8" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight">Đặt lại mật khẩu</h1>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Vui lòng nhập mật khẩu mới bảo mật cho tài khoản của bạn.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-xs text-muted-foreground">Đang tải biểu mẫu...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
