"use client";

import {
  MapPin,
  Wifi,
  LocateFixed,
  ShieldAlert,
  BellRing,
  CheckCircle2,
  Cpu,
  Layers,
  Radio,
  Sliders,
} from "lucide-react";

export function InnovationBentoGrid() {
  return (
    <section id="innovation" className="py-16 sm:py-24 relative bg-slate-100/50 dark:bg-slate-950/40 border-y border-slate-200/60 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50/60 dark:bg-blue-950/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">
            <Cpu className="size-3" />
            <span>ĐỘT PHÁ CÔNG NGHỆ ĐỊNH VỊ ĐÀO TẠO</span>
          </div>

          <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] tracking-tight text-slate-900 dark:text-white leading-tight">
            Kiến trúc Điểm danh Kép GPS Geofence & Wi-Fi IP Allowlist
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-[64ch]">
            Xác thực đồng thời 2 yếu tố độc lập: Tọa độ vệ tinh GNSS/GPS phòng học và dải IP mạng Wi-Fi nội bộ trường,
            loại bỏ 100% điểm danh hộ từ xa.
          </p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tile 1: Dual-Factor GPS & Wi-Fi IP (col-span-8) */}
          <div className="lg:col-span-8 group rounded-[2rem] p-1.5 bg-slate-200/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 shadow-xl shadow-slate-900/5 transition-all duration-300 hover:shadow-2xl">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative">
              <div className="space-y-3 z-10 max-w-lg">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  <LocateFixed className="size-3.5" />
                  <span>DUAL-FACTOR LOCATION ENGINE</span>
                </div>
                <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
                  Xác thực 2 Yếu tố: Tọa độ GPS & Dải IP Wi-Fi Nội bộ
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Để check-in thành công, thiết bị của sinh viên bắt buộc phải nằm trong bán kính Geofence của phòng học
                  và đồng thời kết nối vào đúng mạng Wi-Fi có dải IP được nhà trường cấp phép.
                </p>
              </div>

              {/* Visual Demo Strip inside Tile 1 */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-3">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Độ chính xác GPS</div>
                  <div className="mt-1 font-mono text-xl font-extrabold text-blue-600 dark:text-blue-400">± 2.5 Mét</div>
                  <div className="text-[10px] text-slate-400">Bán kính Geofence 15m - 30m</div>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-3">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Kiểm tra Wi-Fi IP</div>
                  <div className="mt-1 font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">Layer 3 IP</div>
                  <div className="text-[10px] text-slate-400">Allowlist Subnet trường</div>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-3">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Thời gian xác thực</div>
                  <div className="mt-1 font-mono text-xl font-extrabold text-indigo-600 dark:text-indigo-400">&lt; 0.3 Giây</div>
                  <div className="text-[10px] text-slate-400">Phản hồi WebSocket tức thì</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tile 2: Anti-Mock GPS & VPN Shield (col-span-4) */}
          <div className="lg:col-span-4 group rounded-[2rem] p-1.5 bg-slate-200/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 shadow-xl shadow-slate-900/5 transition-all duration-300 hover:shadow-2xl">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">
                  <ShieldAlert className="size-3.5" />
                  <span>ANTI-MOCK SHIELD</span>
                </div>
                <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                  Chống Fake GPS & VPN Proxy
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Thuật toán phát hiện Mock Location API, thiết bị Root/Jailbreak, và cảnh báo ngay lập tức nếu sinh viên
                  sử dụng VPN để giả mạo IP mạng trường.
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-500/20 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-900 dark:text-teal-200">Phát hiện Fake GPS</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">100% Chặn</span>
                </div>
                <div className="text-[11px] text-teal-700 dark:text-teal-300">
                  Tự động từ chối yêu cầu check-in có dấu hiệu can thiệp tọa độ.
                </div>
              </div>
            </div>
          </div>

          {/* Tile 3: Dynamic Classroom Geofencing (col-span-4) */}
          <div className="lg:col-span-4 group rounded-[2rem] p-1.5 bg-slate-200/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 shadow-xl shadow-slate-900/5 transition-all duration-300 hover:shadow-2xl">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  <Sliders className="size-3.5" />
                  <span>DYNAMIC GEOFENCE</span>
                </div>
                <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                  Cấu hình Bán kính Phòng học
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Giảng viên và Quản trị viên có thể linh hoạt tùy chỉnh bán kính điểm danh từ 15m cho phòng học nhỏ đến
                  40m cho hội trường lớn.
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-500/20 p-4 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shrink-0">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-indigo-950 dark:text-indigo-200">240+ Giảng đường & Lab</div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400">Đã gắn tọa độ GPS chuẩn</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tile 4: Realtime Sync & Push Notifications (col-span-8) */}
          <div className="lg:col-span-8 group rounded-[2rem] p-1.5 bg-slate-200/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 shadow-xl shadow-slate-900/5 transition-all duration-300 hover:shadow-2xl">
            <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <BellRing className="size-3.5" />
                  <span>REALTIME NOTIFICATION & AUDIT</span>
                </div>
                <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
                  Tự động Đồng bộ Dữ liệu & Cảnh báo Check-in Ngoài Vùng
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Hệ thống tự động ghi nhật ký vị trí, khoảng cách so với tâm phòng học và IP Wi-Fi đã quẹt. Gửi cảnh
                  báo tức thì nếu sinh viên vắng học hoặc check-in không hợp lệ.
                </p>
              </div>

              {/* Notification Simulation Mock */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/20 p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-blue-950 dark:text-blue-200">Điểm danh thành công</div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      SV 21020018 đã check-in tại A2-302 (GPS: 3.2m, IP Wi-Fi: Hợp lệ).
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 flex items-start gap-3">
                  <BellRing className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-amber-950 dark:text-amber-200">Cảnh báo ngoài vùng GPS</div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Tọa độ thiết bị cách phòng học 120m (&gt; 25m cho phép).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
