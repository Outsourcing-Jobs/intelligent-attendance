"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Wifi,
  Radio,
  CheckCircle2,
  Users,
  ShieldCheck,
  Navigation,
  Activity,
  LocateFixed,
  Signal,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AttendanceLog = {
  id: string;
  name: string;
  mssv: string;
  time: string;
  distance: string;
  ipWifi: string;
  status: "Hợp lệ" | "Chờ duyệt";
  avatarBg: string;
};

const INITIAL_LOGS: AttendanceLog[] = [
  {
    id: "1",
    name: "Nguyễn Hoàng Nam",
    mssv: "2102089",
    time: "08:14:22",
    distance: "3.2m",
    ipWifi: "10.20.14.88",
    status: "Hợp lệ",
    avatarBg: "bg-blue-500",
  },
  {
    id: "2",
    name: "Trần Mai Anh",
    mssv: "2102104",
    time: "08:14:18",
    distance: "5.8m",
    ipWifi: "10.20.14.102",
    status: "Hợp lệ",
    avatarBg: "bg-emerald-500",
  },
  {
    id: "3",
    name: "Lê Quốc Bảo",
    mssv: "2102045",
    time: "08:14:12",
    distance: "8.1m",
    ipWifi: "10.20.14.74",
    status: "Hợp lệ",
    avatarBg: "bg-indigo-500",
  },
  {
    id: "4",
    name: "Phạm Thảo Vy",
    mssv: "2102120",
    time: "08:14:02",
    distance: "2.4m",
    ipWifi: "10.20.14.59",
    status: "Hợp lệ",
    avatarBg: "bg-teal-500",
  },
];

export function LiveAttendanceSimulator() {
  const [logs, setLogs] = useState<AttendanceLog[]>(INITIAL_LOGS);
  const [presentCount, setPresentCount] = useState(48);
  const totalCount = 50;

  // Cyclic simulated student GPS check-in pulse
  useEffect(() => {
    const interval = setInterval(() => {
      const candidates = [
        { name: "Vũ Đình Trọng", mssv: "2102155", distance: "4.5m", ipWifi: "10.20.14.112", avatarBg: "bg-violet-500" },
        { name: "Đỗ Kim Ngân", mssv: "2102078", distance: "6.1m", ipWifi: "10.20.14.95", avatarBg: "bg-pink-500" },
        { name: "Ngô Minh Khang", mssv: "2102133", distance: "3.8m", ipWifi: "10.20.14.63", avatarBg: "bg-amber-500" },
      ];
      const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      const newLog: AttendanceLog = {
        id: Date.now().toString(),
        name: randomCandidate.name,
        mssv: randomCandidate.mssv,
        time: timeStr,
        distance: randomCandidate.distance,
        ipWifi: randomCandidate.ipWifi,
        status: "Hợp lệ",
        avatarBg: randomCandidate.avatarBg,
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 3)]);
      setPresentCount((prev) => (prev >= 50 ? 46 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Outer Shell: Double-Bezel Architecture */}
      <div className="relative rounded-[2rem] p-1.5 sm:p-2 bg-gradient-to-b from-slate-200/80 via-slate-200/40 to-slate-300/60 dark:from-white/15 dark:via-white/5 dark:to-white/10 ring-1 ring-black/5 dark:ring-white/10 shadow-2xl shadow-blue-500/10">
        {/* Inner Core */}
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-slate-950 text-slate-100 p-5 sm:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] border border-slate-800/80">
          {/* Top Bar: Session & Location Geofence Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/90 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-xl bg-blue-500/10 ring-1 ring-blue-500/30 text-blue-400">
                <LocateFixed className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-white tracking-tight">
                    Giảng đường A2-302 • Tòa nhà A2
                  </span>
                  <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  CS301 - Trí tuệ Nhân tạo & Cơ sở Dữ liệu
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="bg-emerald-950/60 border-emerald-500/30 text-emerald-400 font-mono text-[10px] px-2 py-0.5">
                <Radio className="mr-1 size-3" /> GEOFENCE 25M
              </Badge>
            </div>
          </div>

          {/* Center Stage: GPS Radar & Campus Wi-Fi Validation Radar */}
          <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-inner flex flex-col justify-between p-3.5 sm:p-4">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Geofence Radar Concentric Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 sm:size-56 rounded-full border border-blue-500/20 bg-blue-500/5 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-32 sm:size-40 rounded-full border border-emerald-500/30 bg-emerald-500/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full border border-emerald-400/50 bg-emerald-500/10" />

            {/* Top Wi-Fi & GPS Status Bar */}
            <div className="relative z-10 flex items-center justify-between gap-2 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-950/85 border border-slate-800 px-2.5 py-1 text-slate-300">
                <Wifi className="size-3 text-emerald-400" />
                <span>Wi-Fi: <strong className="text-white">UTC_CAMPUS_5G</strong></span>
                <span className="text-emerald-400 font-bold ml-1">IP: 10.20.14.xx (Khớp)</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-950/85 border border-slate-800 px-2.5 py-1 text-slate-300">
                <Navigation className="size-3 text-blue-400" />
                <span>GPS: 21.0041° N, 105.8431° E</span>
              </div>
            </div>

            {/* Center Anchor Point & Student Check-in Node */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              {/* Classroom Anchor Point Pin */}
              <div className="relative flex items-center justify-center">
                <div className="grid size-9 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/50 border-2 border-white z-20">
                  <MapPin className="size-4.5" />
                </div>
                <span className="absolute -bottom-5 whitespace-nowrap rounded-md bg-slate-950/90 border border-blue-500/40 px-2 py-0.5 text-[9px] font-bold font-mono text-blue-300">
                  Tâm phòng A2-302 (Bán kính 25m)
                </span>
              </div>

              {/* Active Student Detected Node */}
              <div className="mt-7 flex items-center gap-2 rounded-xl bg-slate-950/95 border border-emerald-500/60 px-3 py-1.5 shadow-xl backdrop-blur-md">
                <div className="grid size-5 place-items-center rounded-full bg-emerald-500 text-white">
                  <Check className="size-3 font-bold" />
                </div>
                <div className="text-left text-[10px]">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Nguyễn Văn A (21020018)</span>
                    <span className="rounded bg-emerald-950 border border-emerald-500/40 px-1 py-0.2 font-mono text-[9px] text-emerald-400">
                      Khoảng cách: 3.2m
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-slate-400 mt-0.5">
                    GPS Valid • Wi-Fi IP Allowlist Match • Anti-Fake GPS: Pass
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Assurance Tag */}
            <div className="relative z-10 flex items-center justify-between rounded-xl bg-slate-950/80 border border-white/10 px-3 py-1.5 backdrop-blur-md text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="size-3 text-blue-400" />
                <span>Anti-Mock Location: <strong className="text-emerald-400">0% Fake</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Signal className="size-3 text-emerald-400" />
                <span>Độ trễ xác thực: <strong className="text-white">0.18s</strong></span>
              </div>
            </div>
          </div>

          {/* Bottom Live Metrics & Realtime Ticker */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Live Gauge Progress */}
            <div className="sm:col-span-2 rounded-xl bg-slate-900/90 border border-slate-800 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="size-3.5 text-blue-400" /> Sĩ số phòng học
                </span>
                <span className="font-mono font-bold text-white">
                  {presentCount}/{totalCount}
                </span>
              </div>

              <div className="mt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
                    style={{ width: `${(presentCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Tỉ lệ: <strong className="text-emerald-400">{((presentCount / totalCount) * 100).toFixed(0)}%</strong></span>
                <span className="text-amber-400">Chưa check-in: {totalCount - presentCount}</span>
              </div>
            </div>

            {/* Realtime Attendance Log Ticker */}
            <div className="sm:col-span-3 rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Log Check-in Vị trí Trực tiếp</span>
                <span className="text-emerald-400 font-mono">● Realtime GPS</span>
              </div>

              <div className="space-y-1 overflow-hidden">
                {logs.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg bg-slate-950/60 px-2.5 py-1 text-xs border border-white/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`size-5 rounded-full ${log.avatarBg} text-white font-bold text-[9px] grid place-items-center`}>
                        {log.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white text-[11px] leading-tight">{log.name}</span>
                        <span className="font-mono text-[9px] text-slate-400">{log.mssv} • IP: {log.ipWifi}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] text-emerald-400 font-bold block">GPS: {log.distance}</span>
                      <span className="font-mono text-[9px] text-slate-400">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
