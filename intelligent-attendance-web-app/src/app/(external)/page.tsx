import { FloatingNavbar } from "@/components/home/floating-navbar";
import { HeroSection } from "@/components/home/hero-section";
import { AcademicMetricsStrip } from "@/components/home/academic-metrics-strip";
import { RolePortalsSection } from "@/components/home/role-portals-section";
import { InnovationBentoGrid } from "@/components/home/innovation-bento-grid";
import { AttendanceWorkflowSection } from "@/components/home/attendance-workflow-section";
import { SecurityTrustSection } from "@/components/home/security-trust-section";
import { InstitutionalFooter } from "@/components/home/institutional-footer";

export default function Home() {
  return (
<<<<<<< Updated upstream
    <div className="flex min-h-screen flex-col bg-slate-50/70 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-center sm:justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/R-circle.svg" alt="Logo" className="size-16 sm:size-10 object-contain" />
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight sm:text-lg">TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VIỆT HUNG</span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Hệ thống Cổng Thông tin Đào tạo
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <Link href="/auth/student/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <GraduationCap className="mr-1.5 size-4 text-blue-600 dark:text-blue-400" />
                Cổng Sinh viên
              </Button>
            </Link>
            <Link href="/auth/teacher/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <School className="mr-1.5 size-4 text-teal-600 dark:text-teal-400" />
                Cổng Giảng viên
              </Button>
            </Link>
            <Link href="/auth/admin/login">
              <Button size="sm" className="hidden sm:inline-flex bg-indigo-600 text-white hover:bg-indigo-700">
                <Crown className="mr-1.5 size-4 text-amber-400" />
                Quản trị viên
              </Button>
            </Link>
          </div>
        </div>
      </header>
=======
    <div className="flex min-h-screen flex-col bg-slate-50/80 text-slate-900 selection:bg-blue-600 selection:text-white dark:bg-[#090D16] dark:text-slate-100 font-sans antialiased transition-colors">
      {/* Floating Fluid Glass Navbar */}
      <FloatingNavbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Asymmetrical Split & Live Attendance Simulator */}
        <HeroSection />
>>>>>>> Stashed changes

        {/* Academic Metrics & Realtime Trust Strip */}
        <AcademicMetricsStrip />

<<<<<<< Updated upstream
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-semibold text-blue-600 shadow-sm backdrop-blur-md dark:text-blue-400">
            <Sparkles className="size-3.5 text-amber-500" />
            CỔNG QUẢN LÝ ĐÀO TẠO THÔNG MINH
          </div>
=======
        {/* 3-Tier Dedicated Role Portals (Student V1, Faculty V2, Admin) */}
        <RolePortalsSection />
>>>>>>> Stashed changes

        {/* Core Innovation & Engineering Bento Grid */}
        <InnovationBentoGrid />

<<<<<<< Updated upstream
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-base sm:text-lg">
            Giải pháp kết nối toàn diện giữa Sinh viên, Giảng viên và Ban Quản trị Đào tạo.
          </p>

          {/* Quick Access CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/student/login">
              <Button
                size="lg"
                className="h-12 bg-blue-600 px-6 font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-700"
              >
                <GraduationCap className="mr-2 size-5" />
                Cổng Sinh viên
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>

            <Link href="/auth/teacher/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-slate-300 px-6 font-semibold dark:border-slate-800"
              >
                <School className="mr-2 size-5 text-teal-600 dark:text-teal-400" />
                Cổng Giảng viên
              </Button>
            </Link>

            <Link href="/auth/admin/login">
              <Button size="lg" variant="secondary" className="h-12 border border-slate-700 bg-slate-900 px-6 font-semibold text-white hover:bg-slate-800">
                <Crown className="mr-2 size-5 text-amber-400" />
                Quản trị viên
              </Button>
            </Link>
          </div>

          {/* Statistics Strip */}
          <div className="mt-16 grid grid-cols-2 gap-6 rounded-2xl border bg-background/60 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-md sm:grid-cols-4 lg:gap-8 dark:shadow-none">
            <div className="space-y-2 text-center">
              <div className="font-extrabold text-3xl text-sky-500 sm:text-4xl dark:text-sky-400">49</div>
              <div className="text-sky-600 dark:text-sky-400 text-xs font-semibold leading-relaxed">
                Năm truyền thống đào tạo
              </div>
            </div>
            <div className="space-y-2 text-center">
              <div className="font-extrabold text-3xl text-sky-500 sm:text-4xl dark:text-sky-400">91.5%</div>
              <div className="text-sky-600 dark:text-sky-400 text-xs font-semibold leading-relaxed">
                Sinh viên có việc làm ngay sau khi tốt nghiệp
              </div>
            </div>
            <div className="space-y-2 text-center">
              <div className="font-extrabold text-3xl text-sky-500 sm:text-4xl dark:text-sky-400">100%</div>
              <div className="text-sky-600 dark:text-sky-400 text-xs font-semibold leading-relaxed">
                Sinh viên được thực tập tại các công ty, tập đoàn uy tín
              </div>
            </div>
            <div className="space-y-2 text-center">
              <div className="font-extrabold text-3xl text-sky-500 sm:text-4xl dark:text-sky-400">50.350</div>
              <div className="text-sky-600 dark:text-sky-400 text-xs font-semibold leading-relaxed">
                Học sinh, sinh viên đã tốt nghiệp
              </div>
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
                </div>

                <h3 className="font-bold text-xl">Cổng Thông tin Sinh viên</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Dành cho Sinh viên đăng nhập tra cứu lịch học cá nhân, thực hiện điểm danh thông minh qua định vị và quản lý thiết bị học tập.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                    <span>Tra cứu lịch học & phòng học thời gian thực</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                    <span>Tự điểm danh thông minh qua định vị GPS & IP WiFi lớp học</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                    <span>Quản lý & liên kết thiết bị di động cá nhân</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
                    <span>Xem chi tiết lịch sử chuyên cần & thống kê cá nhân</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t">
                <Link href="/auth/student/login" className="w-full">
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
                </div>

                <h3 className="font-bold text-xl">Cổng Giảng viên & Cán bộ</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Công cụ dành cho Giảng viên quản lý thông tin giảng dạy, kiểm tra báo cáo chuyên cần lớp học và duyệt thiết bị sinh viên.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Theo dõi lịch giảng dạy & danh sách lớp học phần</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Quản lý trạng thái điểm danh lớp học (muộn, vắng, đúng giờ)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Phê duyệt yêu cầu đăng ký/đổi thiết bị điểm danh của sinh viên (để chống điểm danh hộ)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Xuất báo cáo chuyên cần & thống kê lớp học phần</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t">
                <Link href="/auth/teacher/login" className="w-full">
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
                  Bảng điều khiển trung tâm dành cho Quản trị viên để cấu hình hệ thống điểm danh, quản lý dữ liệu đào tạo và phân quyền tài khoản.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Cấu hình GPS phòng học, dải IP WiFi trường & sai số cho phép</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Quản lý năm học, học kỳ, môn học và lập lịch buổi học</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Quản lý tài khoản (Sinh viên, Giảng viên) & Phân quyền hệ thống</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Giám sát danh sách thiết bị đăng ký & Lịch sử đăng nhập</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t">
                <Link href="/auth/admin/login" className="w-full">
                  <Button className="w-full justify-between bg-slate-900 border border-slate-700 text-white hover:bg-slate-800">
                    <span>Đăng nhập Admin (Quản trị)</span>
                    <ChevronRight className="size-4 text-amber-400" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-blue-900 bg-blue-950 text-blue-300 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 pb-8 border-b border-blue-900">
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/R-circle.svg" alt="Logo" className="size-12 object-contain" />
                <div>
                  <h4 className="font-extrabold text-sm text-white tracking-wide leading-tight">
                    TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP VIỆT HUNG
                  </h4>
                  <p className="text-[11px] text-blue-400">
                    Viet Hung Industrial University (VIU)
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-300/80 leading-relaxed">
                Hệ thống Cổng Thông tin Đào tạo & Quản lý điểm danh thông minh. Đổi mới, sáng tạo và nâng cao chất lượng giáo dục.
              </p>
              <div className="text-xs text-blue-400 font-medium">
                Website chính thức:{" "}
                <a
                  href="http://www.viu.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  www.viu.edu.vn
                </a>
              </div>
            </div>

            {/* Column 2: Portals */}
            <div className="space-y-4 md:pl-8">
              <h4 className="font-bold text-sm text-white tracking-wider uppercase">Cổng Chức Năng</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/auth/student/login" className="hover:text-sky-300 transition-colors">
                    Cổng Thông tin Sinh viên
                  </Link>
                </li>
                <li>
                  <Link href="/auth/teacher/login" className="hover:text-sky-300 transition-colors">
                    Cổng Giảng viên & Cán bộ
                  </Link>
                </li>
                <li>
                  <Link href="/auth/admin/login" className="hover:text-sky-300 transition-colors">
                    Trang Quản trị viên
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact details */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white tracking-wider uppercase">Liên Hệ & Hỗ Trợ</h4>
              <div className="space-y-2 text-xs">
                <p className="leading-relaxed">
                  <strong className="text-white">Cơ sở Sơn Tây:</strong> Số 16 Hữu Nghị, Xuân Khanh, Sơn Tây, Hà Nội.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-white">Cơ sở Thạch Thất:</strong> Khu B Bình Phú, Thạch Thất, Hà Nội.
                </p>
                <p>
                  <strong className="text-white">Điện thoại:</strong> 02433 838 345 | <strong className="text-white">Hotline:</strong> 0974.966.966
                </p>
                <p>
                  <strong className="text-white">Email:</strong> viethung@viu.edu.vn
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-blue-400 sm:flex-row">
            <div>Bản quyền © 2026 VIU. Tất cả các quyền được bảo lưu.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-sky-300 hover:underline">Chính sách bảo mật</a>
              <a href="#" className="hover:text-sky-300 hover:underline">Điều khoản dịch vụ</a>
            </div>
          </div>
        </div>
      </footer>
=======
        {/* 4-Step Attendance & Education Workflow */}
        <AttendanceWorkflowSection />

        {/* Institutional Security & Compliance Trust */}
        <SecurityTrustSection />
      </main>

      {/* High-End Institutional Footer */}
      <InstitutionalFooter />
>>>>>>> Stashed changes
    </div>
  );
}
