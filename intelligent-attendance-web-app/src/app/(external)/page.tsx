import Link from "next/link";

import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Lock,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight sm:text-lg">ĐẠI HỌC CÔNG NGHỆ & ĐÀO TẠO</span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Hệ thống Cổng Thông tin Đào tạo Quốc gia
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/v1/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <GraduationCap className="mr-1.5 size-4 text-blue-600 dark:text-blue-400" />
                Cổng Sinh viên
              </Button>
            </Link>
            <Link href="/auth/v2/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <School className="mr-1.5 size-4 text-teal-600 dark:text-teal-400" />
                Cổng Giảng viên
              </Button>
            </Link>
            <Link href="/auth/v2/login">
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                <LayoutDashboard className="mr-1.5 size-4" />
                Trang Quản trị
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-400/20 via-sky-300/20 to-teal-400/20 blur-3xl" />
        <div className="absolute top-10 right-10 -z-10 size-72 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-semibold text-blue-600 shadow-sm backdrop-blur-md dark:text-blue-400">
            <Sparkles className="size-3.5 text-amber-500" />
            CỔNG ĐÀO TẠO THÔNG MINH NIÊN HỌC 2025 - 2026
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl font-extrabold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
            Hệ thống Quản lý Đào tạo & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Cổng Thông tin Trường học
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-base sm:text-lg">
            Giải pháp kết nối toàn diện giữa Sinh viên, Giảng viên và Ban Quản trị Đào tạo. Tra cứu thời khóa biểu, nhập
            điểm thi và quản lý học vụ tập trung trên cùng một nền tảng.
          </p>

          {/* Quick Access CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/v1/login">
              <Button
                size="lg"
                className="h-12 bg-blue-600 px-6 font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-700"
              >
                <GraduationCap className="mr-2 size-5" />
                Vào Cổng Sinh viên (V1)
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>

            <Link href="/auth/v2/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-slate-300 px-6 font-semibold dark:border-slate-800"
              >
                <School className="mr-2 size-5 text-teal-600 dark:text-teal-400" />
                Vào Cổng Giảng viên (V2)
              </Button>
            </Link>

            <Link href="/auth/v2/login">
              <Button size="lg" variant="secondary" className="h-12 px-6 font-semibold">
                <LayoutDashboard className="mr-2 size-5 text-indigo-600 dark:text-indigo-400" />
                Bảng Quản trị (Admin)
              </Button>
            </Link>
          </div>

          {/* Statistics Strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border bg-background/60 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-md sm:grid-cols-4 lg:gap-8 dark:shadow-none">
            <div className="space-y-1">
              <div className="font-extrabold text-2xl text-blue-600 sm:text-3xl dark:text-blue-400">45,000+</div>
              <div className="text-muted-foreground text-xs font-medium">Sinh viên Đang theo học</div>
            </div>
            <div className="space-y-1">
              <div className="font-extrabold text-2xl text-teal-600 sm:text-3xl dark:text-teal-400">1,200+</div>
              <div className="text-muted-foreground text-xs font-medium">Giảng viên & Cán bộ</div>
            </div>
            <div className="space-y-1">
              <div className="font-extrabold text-2xl text-indigo-600 sm:text-3xl dark:text-indigo-400">120+</div>
              <div className="text-muted-foreground text-xs font-medium">Chuyên ngành Đào tạo</div>
            </div>
            <div className="space-y-1">
              <div className="font-extrabold text-2xl text-emerald-600 sm:text-3xl dark:text-emerald-400">99.9%</div>
              <div className="text-muted-foreground text-xs font-medium">Độ khả dụng Hệ thống</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Portals Grid Section */}
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-bold text-2xl tracking-tight sm:text-3xl">Lựa chọn Cổng Chức năng Truy cập</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Hệ thống được thiết kế tối ưu riêng biệt cho từng vai trò người dùng trong nhà trường.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {/* Card 1: Student Portal */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-slate-50/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 dark:bg-slate-900/40">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                    <GraduationCap className="size-7" />
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700 text-xs dark:bg-blue-950 dark:text-blue-300">
                    Mẫu V1 (Sinh viên)
                  </span>
                </div>

                <h3 className="font-bold text-xl">Cổng Thông tin Sinh viên</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Dành cho Sinh viên đăng nhập tra cứu kết quả học tập, lịch thi, thời khóa biểu và đăng ký môn học trực
                  tuyến.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                    <span>Thời khóa biểu & Lịch thi cá nhân</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                    <span>Xem bảng điểm tín chỉ & điểm rèn luyện</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                    <span>Đăng ký học phần & nộp lệ phí học phí</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t">
                <Link href="/auth/v1/login" className="w-full">
                  <Button className="w-full justify-between bg-blue-600 text-white hover:bg-blue-700">
                    <span>Đăng nhập Sinh viên</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 2: Faculty Portal */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-slate-50/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10 dark:bg-slate-900/40">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
                    <School className="size-7" />
                  </div>
                  <span className="rounded-full bg-teal-100 px-3 py-1 font-semibold text-teal-700 text-xs dark:bg-teal-950 dark:text-teal-300">
                    Mẫu V2 (Giảng viên)
                  </span>
                </div>

                <h3 className="font-bold text-xl">Cổng Giảng viên & Cán bộ</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Công cụ dành cho Giảng viên & Cán bộ Đào tạo quản lý lớp tín chỉ, nhập điểm thi và phê duyệt thủ tục
                  học vụ.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Danh sách lớp học phần & Điểm danh</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Nhập điểm thi thành phần & Khóa bảng điểm</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Xác thực chữ ký số cán bộ giảng dạy</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t">
                <Link href="/auth/v2/login" className="w-full">
                  <Button className="w-full justify-between bg-teal-600 text-white hover:bg-teal-700">
                    <span>Đăng nhập Giảng viên</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 3: Admin Dashboard */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-slate-50/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 dark:bg-slate-900/40">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="grid size-12 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                    <LayoutDashboard className="size-7" />
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 font-semibold text-indigo-700 text-xs dark:bg-indigo-950 dark:text-indigo-300">
                    Bảng Điều Hành
                  </span>
                </div>

                <h3 className="font-bold text-xl">Bảng Quản trị Hệ thống</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Bảng điều khiển trung tâm cho Ban Giám hiệu & Quản trị viên theo dõi toàn bộ số liệu đào tạo và phân
                  quyền.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Báo cáo thống kê & Biểu đồ tăng trưởng</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Quản lý danh sách Người dùng & Phân quyền</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Cấu hình giao diện & Thiết lập hệ thống</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t">
                <Link href="/auth/v2/login" className="w-full">
                  <Button className="w-full justify-between bg-indigo-600 text-white hover:bg-indigo-700">
                    <span>Đăng nhập Quản trị</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-slate-900 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <GraduationCap className="size-4 text-blue-400" />
              <span>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ & ĐÀO TẠO</span>
            </div>
            <div>Bản quyền © 2026 UTC. Tất cả các quyền được bảo lưu.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
