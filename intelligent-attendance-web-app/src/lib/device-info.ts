/**
 * Utility quản lý định danh thiết bị (deviceId) và thông tin phần mềm/hệ điều hành phía Client
 */

export interface DevicePayload {
  deviceId: string;
  deviceName?: string;
  deviceType?: "web" | "mobile";
  os?: string;
  browser?: string;
}

const DEVICE_ID_KEY = "app_device_id";

/**
 * Lấy hoặc khởi tạo mã UUID thiết bị cố định lưu trong localStorage
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    return "server-side-uuid-fallback";
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId || deviceId.trim() === "") {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = "web-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now().toString(36);
    }
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Nhận diện thông tin Trình duyệt & Hệ điều hành
 */
export function getDeviceInfo(): { deviceName: string; os: string; browser: string; deviceType: "web" | "mobile" } {
  if (typeof window === "undefined") {
    return {
      deviceName: "Trình duyệt Web",
      os: "Unknown OS",
      browser: "Unknown Browser",
      deviceType: "web",
    };
  }

  const userAgent = navigator.userAgent || "";
  let os = "Unknown OS";
  let browser = "Unknown Browser";

  // Nhận diện Hệ điều hành
  if (userAgent.includes("Win")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("like Mac")) os = "iOS";

  // Nhận diện Trình duyệt
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg")) browser = "Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("OPR") || userAgent.includes("Opera")) browser = "Opera";

  const deviceName = `${browser} trên ${os}`;

  return {
    deviceName,
    os,
    browser,
    deviceType: "web",
  };
}

/**
 * Đóng gói đầy đủ payload thông tin thiết bị gửi lên API Đăng nhập
 */
export function getDevicePayload(): DevicePayload {
  const deviceId = getOrCreateDeviceId();
  const info = getDeviceInfo();

  return {
    deviceId,
    deviceName: info.deviceName,
    deviceType: info.deviceType,
    os: info.os,
    browser: info.browser,
  };
}
