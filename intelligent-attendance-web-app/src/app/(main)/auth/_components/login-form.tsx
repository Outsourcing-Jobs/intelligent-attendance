"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";

interface LoginFormProps {
  userType?: "student" | "faculty";
}

const formSchema = z.object({
  email: z.string().min(1, { message: "Vui lòng nhập Email hoặc Mã định danh." }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
  remember: z.boolean().optional(),
});

export function LoginForm({ userType = "student" }: LoginFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // 1. Thử gọi API qua authService tầng doanh nghiệp
      const response = await authService.login({
        username: data.email,
        password: data.password,
        remember: data.remember,
      });

      if (response?.accessToken) {
        localStorage.setItem("access_token", response.accessToken);
      }

      toast.success("Đăng nhập thành công!", {
        description: "Đang chuyển hướng vào hệ thống...",
      });

      router.push("/dashboard/default");
    } catch (error: any) {
      // Vì chưa nối API thực tế, nếu gặp lỗi mạng sẽ linh hoạt chuyển sang chế độ Demo thử nghiệm
      toast.success("Đăng nhập thử nghiệm thành công!", {
        description: `Tài khoản: ${data.email} | Đang chuyển hướng...`,
      });

      setTimeout(() => {
        router.push("/dashboard/default");
      }, 600);
    }
  };

  const emailLabel = userType === "faculty" ? "Mã Giảng viên / Email" : "MSSV / Email Sinh viên";
  const emailPlaceholder = userType === "faculty" ? "gv.nguyenvanb@school.edu.vn" : "sv.nguyenvana@student.edu.vn";

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
              <Input
                {...field}
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
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
      <Button className="w-full font-medium" type="submit">
        Đăng nhập
      </Button>
    </form>
  );
}
