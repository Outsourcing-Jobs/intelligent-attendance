"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { attendanceService } from "@/services/attendance.service";

export interface LiveCheckInEvent {
  studentId: string;
  studentCode: string;
  fullName: string;
  avatar: string | null;
  checkInTime: string;
  status: "present" | "late" | string;
  presentCount: number;
  totalStudents: number;
}

export interface QrTickData {
  classSessionId: string;
  token: string;
  expiresIn: number;
  timestamp: number;
}

const getSocketBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  return apiUrl.replace(/\/api\/v1\/?$/, "");
};

// Âm thanh thông báo nhẹ khi có SV vừa quét thành công
const playCheckInSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignore audio context autoplay restriction
  }
};

export function useQrAttendanceSocket(classSessionId?: string, isLecturer = false) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentQrToken, setCurrentQrToken] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number>(20);
  const [countdown, setCountdown] = useState<number>(20);
  const [recentCheckIns, setRecentCheckIns] = useState<LiveCheckInEvent[]>([]);
  const [liveStats, setLiveStats] = useState<{ presentCount: number; totalStudents: number }>({
    presentCount: 0,
    totalStudents: 0,
  });

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Tự động tải dữ liệu điểm danh ban đầu của buổi học (REST API fallback)
  useEffect(() => {
    if (!classSessionId) return;

    let isMounted = true;
    attendanceService
      .getSessionLiveStats(classSessionId)
      .then((data) => {
        if (!isMounted || !data) return;
        setLiveStats({
          presentCount: data.presentCount || 0,
          totalStudents: data.totalStudents || 0,
        });
        if (Array.isArray(data.recentCheckIns)) {
          setRecentCheckIns(data.recentCheckIns);
        }
      })
      .catch((err) => {
        console.warn("Không thể tải thống kê điểm danh ban đầu:", err?.message);
      });

    return () => {
      isMounted = false;
    };
  }, [classSessionId]);

  // 2. Khởi tạo và kết nối Socket
  useEffect(() => {
    if (!classSessionId) return;

    const socketUrl = `${getSocketBaseUrl()}/attendance-qr`;
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      if (isLecturer) {
        socket.emit("start_qr_stream", { classSessionId, intervalSec: 20 });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Lắng nghe dữ liệu thống kê ban đầu từ WebSocket
    socket.on("session_initial_stats", (data: {
      classSessionId: string;
      presentCount: number;
      totalStudents: number;
      recentCheckIns: LiveCheckInEvent[];
    }) => {
      if (data.classSessionId === classSessionId) {
        setLiveStats({
          presentCount: data.presentCount || 0,
          totalStudents: data.totalStudents || 0,
        });
        if (Array.isArray(data.recentCheckIns)) {
          setRecentCheckIns(data.recentCheckIns);
        }
      }
    });

    // Lắng nghe mã QR mới từ server mỗi chu kỳ
    socket.on("qr_tick", (data: QrTickData) => {
      if (data.classSessionId === classSessionId) {
        setCurrentQrToken(data.token);
        setExpiresIn(data.expiresIn || 20);
        setCountdown(data.expiresIn || 20);

        // Reset đếm ngược countdown từng giây
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }
        countdownTimerRef.current = setInterval(() => {
          setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
        }, 1000);
      }
    });

    // Lắng nghe sự kiện sinh viên vừa điểm danh thành công theo thời gian thực
    socket.on("attendance_realtime_update", (data: LiveCheckInEvent) => {
      playCheckInSound();
      setRecentCheckIns((prev) => {
        // Lọc bỏ trùng lặp nếu sinh viên đã có trong danh sách
        const filtered = prev.filter((item) => item.studentId !== data.studentId && item.studentCode !== data.studentCode);
        return [data, ...filtered.slice(0, 49)];
      });
      if (data.presentCount !== undefined) {
        setLiveStats({
          presentCount: data.presentCount,
          totalStudents: data.totalStudents,
        });
      }
    });

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (isLecturer && socket.connected) {
        socket.emit("stop_qr_stream", { classSessionId });
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [classSessionId, isLecturer]);

  const restartStream = useCallback(
    (intervalSec = 20) => {
      if (socketRef.current && socketRef.current.connected && classSessionId) {
        socketRef.current.emit("start_qr_stream", { classSessionId, intervalSec });
      }
    },
    [classSessionId],
  );

  const stopStream = useCallback(() => {
    if (socketRef.current && socketRef.current.connected && classSessionId) {
      socketRef.current.emit("stop_qr_stream", { classSessionId });
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  }, [classSessionId]);

  return {
    isConnected,
    currentQrToken,
    expiresIn,
    countdown,
    recentCheckIns,
    liveStats,
    restartStream,
    stopStream,
  };
}
