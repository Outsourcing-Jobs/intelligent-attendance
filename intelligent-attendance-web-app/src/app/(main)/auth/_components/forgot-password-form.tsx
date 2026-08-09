"use client";

import { useState } from "react";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";

const formSchema = z.object({
  email: z.string().email({ message: "Vui lòng nhập email hợp lệ." }),
});

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [testResetUrl, setTestResetUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Gọi API POST /api/v1/auth/forgot-password
      const response = await authService.forgotPassword({ email: data.email });

      setResetSuccess(true);

      // Nếu Backend trả về resetLink (chứa oobCode từ Firebase Admin)
      if (response.resetLink) {
        try {
          const url = new URL(response.resetLink);
          const oobCode = url.searchParams.get("oobCode");
          if (oobCode) {
            setTestResetUrl(`/auth/reset-password?oobCode=${oobCode}`);
          }
        } catch {
          // Trường hợp link không thể parse URL
          setTestResetUrl(`/auth/reset-password?oobCode=test123456`);
        }
      }

      toast.success("Yêu cầu khôi phục thành công!", {
        description: response.message || "Link đặt lại mật khẩu đã được khởi tạo.",
      });
    } catch (error: any) {
      const errorMessage = error?.message || "Không tìm thấy tài khoản với email này!";
      toast.error("Gửi yêu cầu thất bại", {
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
        <h3 className="font-bold text-lg text-foreground">Yêu cầu đã được khởi tạo</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Đã tạo yêu cầu đặt lại mật khẩu cho tài khoản <strong className="text-foreground">{form.getValues("email")}</strong>.
        </p>

        {/* Khối hỗ trợ cho môi trường Local / Dev khi chưa cấu hình máy chủ SMTP gửi mail thực tế */}
        {testResetUrl && (
          <div className="mt-3 space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-left">
            <div className="font-semibold text-xs text-amber-600 dark:text-amber-400">
              🛠️ [Dev Local Test]: Server chưa bật SMTP gửi Mail đến Gmail thực tế.
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sử dụng liên kết này để mở trang <strong>Đặt mật khẩu mới</strong> với mã `oobCode` vừa tạo:
            </p>
            <Link
              href={testResetUrl}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-amber-600 py-2 font-semibold text-xs text-white hover:bg-amber-700 transition-colors"
            >
              Chuyển sang trang Đặt mật khẩu mới ngay
            </Link>
          </div>
        )}

        <div className="pt-2">
          <Link href="/auth/student/login" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400">
            <ArrowLeft className="size-3.5" />
            Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="forgot-email">Email đăng ký tài khoản</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="forgot-email"
                  type="email"
                  disabled={isLoading}
                  placeholder="your.email@school.edu.vn"
                  autoComplete="email"
                  className="pl-9"
                  aria-invalid={fieldState.invalid}
                />
                <Mail className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button className="w-full font-medium" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang sinh link khôi phục...
          </>
        ) : (
          "Gửi link đặt lại mật khẩu"
        )}
      </Button>

      <div className="text-center pt-1">
        <Link href="/auth/student/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Quay lại trang Đăng nhập
        </Link>
      </div>
    </form>
  );
}
