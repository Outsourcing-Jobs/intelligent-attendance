"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Eye, EyeOff, Laptop, Loader2, ShieldAlert } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getDevicePayload } from "@/lib/device-info";
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

  const [showPassword, setShowPassword] = useState(false);
  const [pendingDeviceModalOpen, setPendingDeviceModalOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Đóng gói thông tin thiết bị (deviceId UUID cố định + thông số browser/OS)
      const devicePayload = getDevicePayload();

      // 1. Gọi action login từ Zustand Store
      const response = await login({
        email: data.email,
        password: data.password,
        ...devicePayload,
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

      const msgLower = errorMessage.toLowerCase();
      const isPendingDeviceError =
        msgLower.includes("thiết bị") ||
        msgLower.includes("chờ") ||
        msgLower.includes("phê duyệt") ||
        msgLower.includes("pending") ||
        error?.data?.status === "pending" ||
        error?.data?.status === "pending_device";

      // Nếu lỗi do thiết bị mới đang chờ phê duyệt
      if (isPendingDeviceError) {
        setPendingMessage(errorMessage);
        setPendingDeviceModalOpen(true);
      } else {
        toast.error("Đăng nhập thất bại", {
          description: errorMessage,
        });
      }
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
    <>
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
              Đang xác thực & đăng ký thiết bị...
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

      {/* Modal Thông báo Thiết bị Đang chờ Duyệt */}
      <Dialog open={pendingDeviceModalOpen} onOpenChange={setPendingDeviceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="size-6 animate-pulse" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">Yêu cầu Thiết bị Đang chờ Phê duyệt</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Thiết bị mới của bạn đã được ghi nhận vào hệ thống và đang chờ duyệt từ Cán bộ / Giảng viên.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive" className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="font-semibold text-amber-800 dark:text-amber-300">Thông báo từ hệ thống</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed mt-1">
              {pendingMessage || "Yêu cầu thay đổi/thêm thiết bị mới của bạn đang ở trạng thái chờ duyệt. Vui lòng liên hệ Giảng viên hoặc Quản trị viên để được phê duyệt truy cập."}
            </AlertDescription>
          </Alert>

          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              className="bg-amber-600 text-white hover:bg-amber-700 w-full sm:w-auto"
              onClick={() => setPendingDeviceModalOpen(false)}
            >
              Đã hiểu & Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
