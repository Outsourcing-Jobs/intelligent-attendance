import { apiClient } from "@/lib/api-client";
import type { LoginDto, LoginResponse, RegisterDto, UserProfile } from "@/types/auth.types";

/**
 * Tầng Service quản lý tất cả các yêu cầu API liên quan đến Authentication
 */
export const authService = {
  /**
   * Gọi API Đăng nhập
   */
  async login(credentials: LoginDto): Promise<LoginResponse> {
    return apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Gọi API Đăng ký tài khoản
   */
  async register(data: RegisterDto): Promise<{ success: boolean; message?: string }> {
    return apiClient<{ success: boolean; message?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Lấy thông tin cá nhân của người dùng hiện tại
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient<UserProfile>("/auth/profile", {
      method: "GET",
    });
  },

  /**
   * Đăng xuất hệ thống
   */
  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    return apiClient<void>("/auth/logout", {
      method: "POST",
    });
  },
};
