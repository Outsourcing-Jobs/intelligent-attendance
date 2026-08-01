/**
 * Enterprise Base HTTP Client Wrapper for Next.js App Router
 * Quản lý kết nối API tập trung, tự động đính kèm Token và xử lý lỗi HTTP
 */

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "https://api.your-school.edu.vn/v1";
};

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  // Lấy token lưu ở Client
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Tự động xử lý khi Token hết hạn (401 Unauthorized)
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      // Chuyển hướng khi hết phiên đăng nhập
      if (!window.location.pathname.includes("/auth")) {
        window.location.href = "/auth/v1/login";
      }
      throw new ApiError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", 401);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(data?.message || `Yêu cầu API thất bại với mã lỗi ${response.status}`, response.status, data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || "Không thể kết nối đến máy chủ API!", 500);
  }
}
