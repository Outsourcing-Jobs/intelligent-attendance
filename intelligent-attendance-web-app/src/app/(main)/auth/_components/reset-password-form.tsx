"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Lock } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";

const formSchema = z
  .object({
    newPassword: z.string().min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự." }),
    confirmPassword: z.string().min(6, { message: "Mật khẩu xác nhận phải có ít nhất 6 ký tự." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") || searchParams.get("code") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!oobCode) {
      toast.error("Mã khôi phục không hợp lệ", {
        description: "Thiếu mã oobCode từ đường dẫn email. Vui lòng thử gửi lại yêu cầu Quên mật khẩu.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API POST /api/v1/auth/reset-password
      const response = await authService.resetPassword({
        oobCode,
        newPassword: data.newPassword,
      });

      setResetSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!", {
        description: response.message || "Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.",
      });

      setTimeout(() => {
        router.push("/auth/v1/login");
      }, 1500);
    } catch (error: any) {
      const errorMessage = error?.message || "Mã khôi phục oobCode không hợp lệ hoặc đã hết hạn!";
      toast.error("Đặt lại mật khẩu thất bại", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500/20 text-emerald-500">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="font-bold text-lg text-foreground">Đổi mật khẩu thành công!</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Mật khẩu tài khoản của bạn đã được cập nhật an toàn. Đang chuyển hướng về trang Đăng nhập...
        </p>

        <div className="pt-2">
          <Link href="/auth/v1/login" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400">
            <ArrowLeft className="size-3.5" />
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {!oobCode && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
          ⚠️ Không tìm thấy mã `oobCode` trên URL. Vui lòng truy cập từ liên kết trong Email hoặc yêu cầu lại.
        </div>
      )}

      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="new-password">Mật khẩu mới</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="new-password"
                  type="password"
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="pl-9"
                  aria-invalid={fieldState.invalid}
                />
                <Lock className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirm-password">Xác nhận mật khẩu mới</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="confirm-password"
                  type="password"
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="pl-9"
                  aria-invalid={fieldState.invalid}
                />
                <KeyRound className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button className="w-full font-medium" type="submit" disabled={isLoading || !oobCode}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang cập nhật mật khẩu...
          </>
        ) : (
          "Đổi mật khẩu"
        )}
      </Button>

      <div className="text-center pt-1">
        <Link href="/auth/v1/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Quay lại trang Đăng nhập
        </Link>
      </div>
    </form>
  );
}
