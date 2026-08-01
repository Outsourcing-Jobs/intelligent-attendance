import { apiClient } from "@/lib/api-client";
import type { UserProfile } from "@/types/auth.types";

export interface CreateUserDto {
  email: string;
  password?: string;
  fullName?: string;
  phone?: string;
  roleCode?: string;
}

export interface UserListResponse {
  items: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const userService = {
  /**
   * Lấy thông tin cá nhân của chính người dùng đang đăng nhập (GET /users/me)
   */
  async getSelfProfile(): Promise<UserProfile> {
    return apiClient<UserProfile>("/users/me", {
      method: "GET",
    });
  },

  /**
   * Cập nhật thông tin cá nhân (PATCH /users/me)
   */
  async updateSelfProfile(data: { fullName?: string; phone?: string }): Promise<UserProfile> {
    return apiClient<UserProfile>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload tệp ảnh đại diện Avatar mới (POST /users/me/avatar)
   */
  async uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient<UserProfile>("/users/me/avatar", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Admin: Lấy danh sách người dùng (GET /admin/users)
   */
  async getUsers(params: { page?: number; limit?: number; keyword?: string } = {}): Promise<UserListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.keyword) query.append("keyword", params.keyword);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return apiClient<UserListResponse>(`/admin/users${queryString}`, {
      method: "GET",
    });
  },

  /**
   * Admin: Lấy chi tiết 1 người dùng theo ID (GET /admin/users/:id)
   */
  async getUserById(id: string): Promise<UserProfile> {
    return apiClient<UserProfile>(`/admin/users/${id}`, {
      method: "GET",
    });
  },

  /**
   * Admin: Khởi tạo tài khoản người dùng mới (POST /admin/users)
   */
  async createUser(data: CreateUserDto): Promise<UserProfile> {
    return apiClient<UserProfile>("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Admin: Cập nhật Vai trò/Role của người dùng (PATCH /admin/users/:id/role)
   */
  async updateUserRole(id: string, roleCode: string): Promise<UserProfile> {
    return apiClient<UserProfile>(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ roleCode }),
    });
  },

  /**
   * Admin: Khóa tài khoản khẩn cấp (PATCH /admin/users/:id/ban)
   */
  async banUser(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/admin/users/${id}/ban`, {
      method: "PATCH",
    });
  },

  /**
   * Admin: Mở khóa tài khoản (PATCH /admin/users/:id/unban)
   */
  async unbanUser(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/admin/users/${id}/unban`, {
      method: "PATCH",
    });
  },

  /**
   * Admin: Xóa hoàn toàn tài khoản (DELETE /admin/users/:id)
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/admin/users/${id}`, {
      method: "DELETE",
    });
  },
};
