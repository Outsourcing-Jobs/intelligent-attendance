"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

interface LoginFormProps {
  userType?: "student" | "faculty" | "admin";
}

const formSchema = z.object({
  email: z.string().min(1, { message: "Vui lòng nhập Email hoặc Mã định danh." }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
  remember: z.boolean().optional(),
});

export function LoginForm({ userType = "student" }: LoginFormProps) {
  const router = useRouter();
  const { login, logout, isLoading } = useAuthStore();

  const defaultEmail =
    userType === "admin"
      ? "admin@school.edu.vn"
      : userType === "faculty"
      ? "teacher@school.edu.vn"
      : "student@school.edu.vn";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail,
      password: "Password123!",
      remember: true,
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // 1. Gọi action login từ Zustand Store (POST /api/v1/auth/login)
      const response = await login({
        email: data.email,
        password: data.password,
      });

      const userRole = response.user?.roleCode;

      // 2. Kiểm tra phân quyền nghiêm ngặt theo Cổng Đăng Nhập
      if (userType === "admin" && userRole !== "admin") {
        await logout();
        toast.error("Truy cập bị từ chối", {
          description: "Chỉ tài khoản Quản trị viên (Admin) mới có quyền truy cập Cổng Quản trị Hệ thống!",
        });
        return;
      }

      if (userType === "faculty" && (userRole === "student" || userRole === "admin")) {
        await logout();
        toast.error("Truy cập bị từ chối", {
          description:
            userRole === "student"
              ? "Tài khoản Sinh viên không thể đăng nhập tại Cổng Giảng viên. Vui lòng sử dụng Cổng Sinh viên (V1)."
              : "Tài khoản Quản trị viên vui lòng sử dụng Cổng Quản trị Admin.",
        });
        return;
      }

      if (userType === "student" && userRole && userRole !== "student") {
        await logout();
        toast.error("Truy cập bị từ chối", {
          description: `Tài khoản của bạn (${response.user?.roleName || userRole}) không phải Sinh viên. Vui lòng đăng nhập đúng cổng tương ứng.`,
        });
        return;
      }

      toast.success(response.message || "Đăng nhập thành công!", {
        description: `Chào mừng ${response.user?.fullName || response.user?.name || data.email}! Đang chuyển hướng...`,
      });

      router.push("/dashboard/default");
    } catch (error: any) {
      const errorMessage = error?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!";
      toast.error("Đăng nhập thất bại", {
        description: errorMessage,
      });
    }
  };

  const emailLabel =
    userType === "admin"
      ? "Email / Tài khoản Admin"
      : userType === "faculty"
      ? "Mã Giảng viên / Email Cán bộ"
      : "MSSV / Email Sinh viên";

  const emailPlaceholder =
    userType === "admin"
      ? "admin@school.edu.vn"
      : userType === "faculty"
      ? "teacher@school.edu.vn"
      : "student@school.edu.vn";

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email">{emailLabel}</FieldLabel>
              <Input
                {...field}
                id="login-email"
                type="text"
                disabled={isLoading}
                placeholder={emailPlaceholder}
                autoComplete="username"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password">Mật khẩu</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="remember"
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id="login-remember"
                name={field.name}
                disabled={isLoading}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                aria-invalid={fieldState.invalid}
              />
              <FieldContent>
                <FieldLabel htmlFor="login-remember" className="font-normal text-xs">
                  Duy trì đăng nhập trong 30 ngày
                </FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>
      <Button className="w-full font-medium" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang xác thực...
          </>
        ) : (
          "Đăng nhập"
        )}
      </Button>

      <div className="rounded-lg border bg-muted/40 p-2.5 text-center text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Tài khoản mẫu:</span>{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">{defaultEmail}</code> /{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">Password123!</code>
      </div>
    </form>
  );
}
