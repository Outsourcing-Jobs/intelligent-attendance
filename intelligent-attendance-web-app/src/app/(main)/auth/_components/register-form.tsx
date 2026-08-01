"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface RegisterFormProps {
  userType?: "student" | "faculty";
}

const formSchema = z
  .object({
    email: z.string().min(1, { message: "Vui lòng nhập Email hoặc Mã định danh." }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
    confirmPassword: z.string().min(6, { message: "Mật khẩu xác nhận phải có ít nhất 6 ký tự." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp.",
    path: ["confirmPassword"],
  });

function onSubmit(data: z.infer<typeof formSchema>) {
  toast.success("Đăng ký tài khoản thành công!", {
    description: `Tài khoản: ${data.email}`,
  });
}

export function RegisterForm({ userType = "student" }: RegisterFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

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
              <FieldLabel htmlFor="register-email">{emailLabel}</FieldLabel>
              <Input
                {...field}
                id="register-email"
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
              <FieldLabel htmlFor="register-password">Mật khẩu</FieldLabel>
              <Input
                {...field}
                id="register-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-confirm-password">Xác nhận mật khẩu</FieldLabel>
              <Input
                {...field}
                id="register-confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button className="w-full font-medium" type="submit">
        Đăng ký tài khoản
      </Button>
    </form>
  );
}
