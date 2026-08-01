import Link from "next/link";

import { Award, BookOpen, Calendar, CheckCircle2, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

import { RegisterForm } from "../../_components/register-form";

export default function RegisterV1() {
  return (
    <div className="flex h-dvh bg-slate-50/70 dark:bg-slate-950">
      {/* Left Form Card */}
      <div className="flex w-full items-center justify-center p-6 lg:w-7/12">
        <div className="w-full max-w-md space-y-6 rounded-2xl border bg-background p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="space-y-2 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <GraduationCap className="size-8" />
            </div>
            <h1 className="font-bold text-2xl tracking-tight">Kích hoạt Tài khoản Sinh viên</h1>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Nhập Mã số sinh viên (MSSV) và thông tin xác thực do Phòng Đào tạo cấp để kích hoạt tài khoản.
            </p>
          </div>

          <RegisterForm userType="student" />

          <div className="space-y-3 border-t pt-4 text-center text-xs text-muted-foreground">
            <div>
              Đã kích hoạt tài khoản Sinh viên?{" "}
              <Link
                prefetch={false}
                href="login"
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Đăng nhập ngay
              </Link>
            </div>
            <div className="text-[11px] text-muted-foreground/80">
              Cần trợ giúp kích hoạt? Liên hệ hotline{" "}
              <span className="font-medium text-foreground">Phòng Công tác Sinh viên (1900 1234)</span>.
            </div>
          </div>
        </div>
      </div>

      {/* Right Banner - School Academic Identity */}
      <div className="relative hidden w-5/12 overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-sky-600 lg:block">
        <div className="absolute -top-32 -right-32 size-[450px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-[450px] rounded-full bg-sky-300/20 blur-3xl" />

        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          {/* School Header Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
                <GraduationCap className="size-7 text-yellow-300" />
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-wide">ĐẠI HỌC CÔNG NGHỆ & ĐÀO TẠO</h1>
                <p className="text-blue-200 text-xs tracking-wider uppercase font-medium">
                  Hệ thống Đào tạo Tín chỉ Quốc gia
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="rounded-md bg-white/15 px-2.5 py-0.5 font-medium text-xs backdrop-blur-md">
                Chào mừng Tân Sinh viên K2025
              </span>
            </div>
          </div>

          {/* Academic Features Showcase */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="size-3.5 text-yellow-300" />
              Kích hoạt Nhanh chóng & An toàn
            </div>

            <h2 className="font-extrabold text-3xl leading-snug tracking-tight">
              Sẵn sàng cho Hành trình Tri thức Mới
            </h2>

            <div className="space-y-3 pt-1 text-sm text-blue-100/90">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
                <span>Liên kết hồ sơ sinh viên chính thức của nhà trường</span>
              </div>
              <div className="flex items-center gap-2.5">
                <BookOpen className="size-4 shrink-0 text-sky-300" />
                <span>Nhận ngay tài khoản thư viện số & tài liệu học tập</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4 shrink-0 text-sky-300" />
                <span>Tự động đồng bộ Lịch tuần sinh hoạt công dân K2025</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="size-4 shrink-0 text-amber-300" />
                <span>Đủ điều kiện xét học bổng khuyến khích học tập</span>
              </div>
            </div>
          </div>

          {/* Footer Info Badge */}
          <div className="flex items-center justify-between rounded-xl bg-white/10 p-3.5 text-xs text-blue-100 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-300" />
              <span>Xác thực Dữ liệu Sinh viên Chuẩn Bộ GD&ĐT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
