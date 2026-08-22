"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles, ShieldCheck, Play, MapPin, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveAttendanceSimulator } from "./live-attendance-simulator";

export function HeroSection() {
  return (
    <section id="overview" className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 left-1/4 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Focused Copy Stack (Max 4 Elements) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* 1. Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 shadow-sm backdrop-blur-md dark:bg-blue-950/60 dark:text-blue-400">
              <MapPin className="size-3 text-blue-600 dark:text-blue-400" />
              <span>NỀN TẢNG QUẢN LÝ ĐÀO TẠO & ĐIỂM DANH GPS - IP WIFI</span>
            </div>

            {/* 2. H1 Headline (Max 2 Lines) */}
            <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[54px] tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Quản trị Học vụ & <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
                Điểm danh với <br /> GPS & IP Wi-Fi
              </span>
            </h1>

            {/* 3. Subtext (Clear & Crisp < 20 words) */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-[54ch]">
              Xác thực sự hiện diện của sinh viên chuẩn xác qua tọa độ GPS phòng học kết hợp dải IP Wi-Fi nội bộ
              trường, chống Fake GPS thời gian thực.
            </p>

            {/* 4. Dual Island Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5 sm:gap-4">
              {/* Primary Island CTA */}
              <a href="#portals">
                <Button
                  size="lg"
                  className="group relative h-13 rounded-full bg-blue-600 pl-6 pr-2.5 font-bold text-sm text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:bg-blue-700 active:scale-98 cursor-pointer"
                >
                  <span>Truy cập Cổng Đào tạo</span>
                  <span className="ml-3 grid size-8 place-items-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="size-4" />
                  </span>
                </Button>
              </a>

              {/* Secondary Demo CTA */}
              <a href="#workflow">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-full border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 font-semibold text-sm text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer"
                >
                  <Play className="mr-2 size-3.5 fill-current text-blue-600 dark:text-blue-400" />
                  <span>Xem Quy trình Điểm danh</span>
                </Button>
              </a>
            </div>

            {/* Micro Institutional Trust Footer */}
            <div className="pt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>Chống Fake GPS & Proxy/VPN</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <Wifi className="size-3.5 text-blue-500" />
                <span>Allowlist Dải IP Wi-Fi Trường</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Simulator Stage */}
          <div className="lg:col-span-6">
            <LiveAttendanceSimulator />
          </div>
        </div>
      </div>
    </section>
  );
}
