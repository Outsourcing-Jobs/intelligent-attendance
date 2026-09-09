"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from "html5-qrcode";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  RefreshCw,
  SwitchCamera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Smartphone,
  ShieldCheck,
  QrCode,
  KeyRound,
  Send,
} from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getOrCreateDeviceId } from "@/lib/device-info";
import { attendanceService, TodaySessionInfo, CheckInResponse } from "@/services/attendance.service";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TodaySessionInfo | null;
  onSuccess?: (res: CheckInResponse) => void;
}

export function QrScannerModal({
  isOpen,
  onClose,
  session,
  onSuccess,
}: QrScannerModalProps) {
  const { latitude, longitude, accuracy, getLocation, loading: geoLoading } = useGeolocation();
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [scannerReady, setScannerReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [manualToken, setManualToken] = useState("");

  // Result States
  const [scanResult, setScanResult] = useState<{
    type: "success" | "error";
    message: string;
    status?: string;
    details?: any;
  } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const isScanningRef = useRef(false);
  const readerElementId = "qr-reader-viewport";

  // Trigger lấy GPS khi mở Modal
  useEffect(() => {
    if (isOpen) {
      getLocation();
      setScanResult(null);
      setManualToken("");
      isProcessingRef.current = false;
    }
  }, [isOpen, getLocation]);

  // Khởi động Camera Scanner
  const startCamera = useCallback(async () => {
    if (!isOpen || scanResult) return;

    try {
      if (html5QrCodeRef.current) {
        try {
          if (isScanningRef.current) {
            await html5QrCodeRef.current.stop();
          }
        } catch {}
        html5QrCodeRef.current = null;
        isScanningRef.current = false;
      }

      // Đảm bảo DOM element đã tồn tại
      const container = document.getElementById(readerElementId);
      if (!container) return;

      const html5QrCode = new Html5Qrcode(readerElementId);
      html5QrCodeRef.current = html5QrCode;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 15,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: facingMode },
        config,
        (decodedText) => {
          // Bắt được chuỗi mã QR
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          handleQrCodeScanned(decodedText);
        },
        () => {
          // Bỏ qua frame không có QR
        },
      );

      isScanningRef.current = true;
      setScannerReady(true);
    } catch (err: any) {
      console.warn("Lỗi khởi tạo Camera:", err);
      setScannerReady(false);
      isScanningRef.current = false;
    }
  }, [isOpen, facingMode, scanResult]);

  // Khởi động / Dừng camera theo trạng thái mở Modal & Tab
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && activeTab === "camera" && !scanResult) {
      timer = setTimeout(() => {
        startCamera();
      }, 250);
    } else {
      if (html5QrCodeRef.current && isScanningRef.current) {
        html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
          isScanningRef.current = false;
          html5QrCodeRef.current = null;
        });
      }
    }

    return () => {
      clearTimeout(timer);
      if (html5QrCodeRef.current && isScanningRef.current) {
        html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
          isScanningRef.current = false;
          html5QrCodeRef.current = null;
        });
      }
    };
  }, [isOpen, activeTab, scanResult, startCamera]);

  // Đổi Camera trước / sau
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Xử lý chuỗi Token quét được từ Camera hoặc nhập thủ công
  const handleQrCodeScanned = async (qrToken: string) => {
    if (!session || !qrToken.trim()) {
      isProcessingRef.current = false;
      return;
    }

    // Dừng camera an toàn
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
      isScanningRef.current = false;
    }

    setSubmitting(true);
    const deviceId = getOrCreateDeviceId();

    try {
      const res = await attendanceService.scanQrAttendance({
        qrToken: qrToken.trim(),
        deviceId,
        userLat: latitude || undefined,
        userLng: longitude || undefined,
        accuracy: accuracy || undefined,
        note: activeTab === "camera" ? "Điểm danh qua Camera QR" : "Điểm danh qua Mã Token",
      });

      // Bắn pháo hoa ăn mừng khi thành công
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch {}

      setScanResult({
        type: "success",
        message: res.message || "Điểm danh qua mã QR thành công!",
        status: res.status || "present",
        details: res,
      });

      onSuccess?.(res);
    } catch (err: any) {
      console.error("Lỗi xác thực QR điểm danh:", err);
      const errMsg =
        err?.message ||
        err?.data?.message ||
        "Mã QR không hợp lệ hoặc đã hết hạn. Vui lòng quét lại mã mới trên máy chiếu.";

      setScanResult({
        type: "error",
        message: errMsg,
      });
    } finally {
      setSubmitting(false);
      isProcessingRef.current = false;
    }
  };

  // Quét lại
  const handleResetScan = () => {
    setScanResult(null);
    setManualToken("");
    isProcessingRef.current = false;
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-md max-w-md p-0 overflow-hidden border-border/80 bg-background shadow-2xl"
      >
        {/* HEADER */}
        <div className="px-5 py-4 border-b bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold truncate">
                Quét QR Điểm Danh
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                {session.courseSection?.subjectId?.subjectName || "Buổi học hôm nay"} - Phòng {session.room}
              </DialogDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
          >
            <XCircle className="w-5 h-5" />
            <span className="sr-only">Đóng</span>
          </Button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">
          {/* TRẠNG THÁI TIỀN ĐIỀU KIỆN (PRE-CHECKS) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl border bg-muted/30 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="truncate">
                <p className="font-semibold text-[11px] text-muted-foreground">Định vị GPS</p>
                <p className="font-mono text-xs font-bold truncate">
                  {latitude ? `±${Math.round(accuracy || 0)}m` : geoLoading ? "Đang lấy..." : "Chưa bật"}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border bg-muted/30 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary shrink-0" />
              <div className="truncate">
                <p className="font-semibold text-[11px] text-muted-foreground">Thiết bị</p>
                <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Đã kết nối
                </p>
              </div>
            </div>
          </div>

          {/* HIỂN THỊ KẾT QUẢ SCAN NẾU CÓ */}
          {scanResult ? (
            <div className="py-3 space-y-4 text-center animate-in zoom-in-95 duration-200">
              {scanResult.type === "success" ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border-2 border-emerald-500/30">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Điểm Danh Thành Công!</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      {scanResult.message}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Môn học:</span>
                      <span className="font-bold text-foreground truncate max-w-[200px]">
                        {session.courseSection?.subjectId?.subjectName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phòng học:</span>
                      <span className="font-bold font-mono">Phòng {session.room}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <Badge
                        variant="default"
                        className={
                          scanResult.status === "late"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        }
                      >
                        {scanResult.status === "late" ? "Đi muộn" : "Đúng giờ"}
                      </Badge>
                    </div>
                  </div>

                  <Button onClick={onClose} className="w-full">
                    Hoàn tất & Đóng
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border-2 border-rose-500/30">
                    <XCircle className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
                      Chưa Thể Điểm Danh
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 px-4">
                      {scanResult.message}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Đóng
                    </Button>
                    <Button onClick={handleResetScan} className="flex-1 gap-1.5">
                      <RefreshCw className="w-4 h-4" /> Thử lại
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="camera" className="text-xs gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Quét Camera
                </TabsTrigger>
                <TabsTrigger value="manual" className="text-xs gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Nhập Token
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: CAMERA SCANNER */}
              <TabsContent value="camera" className="space-y-3 mt-0">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-[290px] border shadow-inner flex items-center justify-center">
                  <div id={readerElementId} className="w-full h-full object-cover" />

                  {/* Khung ngắm laser animation */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-52 h-52 border-2 border-primary/60 rounded-2xl relative">
                      {/* 4 góc viền sáng */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-primary rounded-br-lg" />

                      {/* Vệt laser quét */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-bounce-slow" />
                    </div>
                  </div>

                  {submitting && (
                    <div className="absolute inset-0 bg-background/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-primary z-20">
                      <RefreshCw className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-bold">Đang xác thực điểm danh...</span>
                    </div>
                  )}
                </div>

                {/* NÚT ĐIỀU KHIỂN CAMERA */}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Hướng camera vào máy chiếu giảng viên
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCamera}
                    className="gap-1.5 text-xs h-8"
                    type="button"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" /> Đổi Cam
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 2: NHẬP TOKEN THỦ CÔNG */}
              <TabsContent value="manual" className="space-y-3 mt-0">
                <div className="p-4 rounded-2xl border bg-muted/20 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Mã Token bảo mật từ màn hình QR
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Dành cho trường hợp camera bị mờ hoặc thiết bị không hỗ trợ quét trực tiếp.
                    </p>
                  </div>

                  <Input
                    placeholder="Dán hoặc nhập chuỗi mã QR..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="font-mono text-xs"
                    disabled={submitting}
                  />

                  <Button
                    onClick={() => handleQrCodeScanned(manualToken)}
                    disabled={!manualToken.trim() || submitting}
                    className="w-full gap-2 text-xs"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Đang xác thực...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Xác nhận Điểm Danh
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
