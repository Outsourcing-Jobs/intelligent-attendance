import { apiClient } from "@/lib/api-client";
import type {
  ForgotPasswordDto,
  ForgotPasswordResponse,
  LoginDto,
  LoginResponse,
  RegisterDto,
  ResetPasswordDto,
  ResetPasswordResponse,
  UserProfile,
} from "@/types/auth.types";

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
   * Gọi API Quên mật khẩu (POST /auth/forgot-password)
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    return apiClient<ForgotPasswordResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Gọi API Đặt lại mật khẩu (POST /auth/reset-password)
   */
  async resetPassword(data: ResetPasswordDto): Promise<ResetPasswordResponse> {
    return apiClient<ResetPasswordResponse>("/auth/reset-password", {
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
   * Đăng xuất hệ thống (POST /auth/logout)
   */
  async logout(): Promise<void> {
    try {
      await apiClient<void>("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Bỏ qua lỗi nếu token đã hết hạn khi đăng xuất
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user_profile");
      }
    }
  },
};
