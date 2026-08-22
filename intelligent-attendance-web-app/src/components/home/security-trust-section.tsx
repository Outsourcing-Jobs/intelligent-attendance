"use client";

import { ShieldCheck, Lock, Award, KeyRound, Wifi, MapPin } from "lucide-react";

const TRUST_ITEMS = [
  {
    title: "Mã hóa Tọa độ & IP AES-256",
    desc: "Gói tin định vị và thông tin mạng được mã hóa đầu cuối, bảo vệ quyền riêng tư tuyệt đối.",
    icon: Lock,
    badge: "MÃ HÓA CẤP QUÂN SỰ",
  },
  {
    title: "Bảo mật Mạng Campus Network",
    desc: "Kiểm soát truy cập tầng mạng (Layer 3 IP & BSSID) ngăn chặn thiết bị ngoài trường check-in.",
    icon: Wifi,
    badge: "CAMPUS NETWORK ACCESS",
  },
  {
    title: "Quy chế Đào tạo Quốc gia",
    desc: "Tương thích 100% với hệ thống tính điểm tín chỉ và quy chế học vụ của Bộ GD&ĐT.",
    icon: Award,
    badge: "CHUẨN BỘ GD&ĐT",
  },
  {
    title: "Chống Gian lận Vị trí",
    desc: "Thuật toán phát hiện Mock Location API và VPN Proxy bảo đảm tính trung thực học vụ.",
    icon: ShieldCheck,
    badge: "ANTI-MOCK SHIELD",
  },
];

export function SecurityTrustSection() {
  return (
    <section id="security" className="py-16 sm:py-20 relative bg-slate-900 text-white overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-400">
            <ShieldCheck className="size-3" />
            <span>AN TOÀN DỮ LIỆU & BẢO MẬT HỌC VỤ</span>
          </div>

          <h2 className="font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight text-white">
            Bảo mật Cấp Tổ chức & Tuân thủ Tiêu chuẩn Đào tạo
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-[56ch] mx-auto">
            Hạ tầng quản lý đào tạo được thiết kế theo mô hình bảo mật Zero-Trust, bảo vệ quyền riêng tư vị trí của sinh
            viên.
          </p>
        </div>

        {/* 4 Trust Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white tracking-tight">{item.title}</h3>
                    <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
