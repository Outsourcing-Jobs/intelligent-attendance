"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  School,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  MapPin,
  Wifi,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/app/(main)/dashboard/_components/header/theme-switcher";

const NAV_LINKS = [
  { label: "Tổng quan", href: "#overview" },
  { label: "Cổng Đào tạo", href: "#portals" },
  { label: "Công nghệ GPS", href: "#innovation" },
  { label: "Quy trình", href: "#workflow" },
  { label: "Bảo mật", href: "#security" },
];

export function FloatingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-3 sm:top-4 z-50 mx-auto w-full max-w-7xl px-3 sm:px-6">
      <div className="relative flex items-center justify-between gap-4 rounded-full border border-slate-200/80 bg-white/85 px-4 py-2.5 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/20 sm:px-6 sm:py-3">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          <div className="relative grid size-9 sm:size-10 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105">
            <MapPin className="size-5 sm:size-5.5 text-white" />
            <span className="absolute -top-1 -right-1 flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                VIU
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20 whitespace-nowrap">
                GPS + Wi-Fi IP
              </span>
            </div>
            <span className="hidden md:block text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 whitespace-nowrap">
              Quản lý Đào tạo & Điểm danh Vị trí
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Switcher */}
          <div className="rounded-full border border-slate-200/80 bg-slate-100/70 p-0.5 dark:border-white/10 dark:bg-slate-900/80 shrink-0">
            <ThemeSwitcher />
          </div>

          {/* Quick Access Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="group relative h-9 sm:h-10 rounded-full bg-blue-600 px-4 sm:px-5 font-semibold text-xs text-white shadow-md shadow-blue-500/25 transition-all duration-300 hover:bg-blue-700 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Đăng nhập Cổng</span>
                <ChevronDown className="ml-1.5 size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-64 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
            >
              <DropdownMenuLabel className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Chọn Cổng Truy Cập
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 opacity-50" />

              <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2.5 focus:bg-blue-50 dark:focus:bg-blue-950/50">
                <Link href="/auth/v1/login" className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <GraduationCap className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">Cổng Sinh viên</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Điểm danh GPS, lịch học (V1)</div>
                    </div>
                  </div>
                  <ArrowUpRight className="size-3.5 text-slate-400" />
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2.5 focus:bg-teal-50 dark:focus:bg-teal-950/50">
                <Link href="/auth/v2/login" className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                      <School className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">Cổng Giảng viên</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Mở ca, cấu hình Wi-Fi (V2)</div>
                    </div>
                  </div>
                  <ArrowUpRight className="size-3.5 text-slate-400" />
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-2.5 focus:bg-indigo-50 dark:focus:bg-indigo-950/50">
                <Link href="/auth/admin/login" className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">Ban Quản trị (Admin)</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Tọa độ trường & Dải IP Wi-Fi</div>
                    </div>
                  </div>
                  <ArrowUpRight className="size-3.5 text-slate-400" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden rounded-full size-9 text-slate-700 dark:text-slate-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95 transition-all duration-300">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-white/10 flex flex-col gap-2">
            <Link href="/auth/v1/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start rounded-xl text-xs font-medium">
                <GraduationCap className="mr-2 size-4 text-blue-600" />
                Cổng Sinh viên (V1)
              </Button>
            </Link>
            <Link href="/auth/v2/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start rounded-xl text-xs font-medium">
                <School className="mr-2 size-4 text-teal-600" />
                Cổng Giảng viên (V2)
              </Button>
            </Link>
            <Link href="/auth/admin/login" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-start rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-medium">
                <ShieldCheck className="mr-2 size-4 text-amber-400 dark:text-amber-500" />
                Cổng Ban Quản trị (Admin)
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
