import { apiClient } from "@/lib/api-client";
import type { UserRole } from "@/types/auth.types";

export interface CreateRolePayload {
  code: string;
  name: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export const roleService = {
  /**
   * Lấy danh sách tất cả các Role (GET /roles)
   */
  async getRoles(): Promise<UserRole[]> {
    return apiClient<UserRole[]>("/roles", {
      method: "GET",
    });
  },

  /**
   * Xem chi tiết 1 Role theo ID (GET /roles/:id)
   */
  async getRoleById(id: string): Promise<UserRole> {
    return apiClient<UserRole>(`/roles/${id}`, {
      method: "GET",
    });
  },

  /**
   * Tạo Role mới (POST /roles)
   */
  async createRole(data: CreateRolePayload): Promise<UserRole> {
    return apiClient<UserRole>("/roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật Role (PATCH /roles/:id)
   */
  async updateRole(id: string, data: UpdateRolePayload): Promise<UserRole> {
    return apiClient<UserRole>(`/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Xóa Role (DELETE /roles/:id)
   */
  async deleteRole(id: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/roles/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Lấy danh sách các quyền hạn hệ thống khả dụng (GET /roles/permissions)
   */
  async getPermissions(): Promise<{ id: string; label: string; group?: string }[]> {
    return apiClient<{ id: string; label: string; group?: string }[]>("/roles/permissions", {
      method: "GET",
    });
  },
};
