import { apiClient } from "@/lib/api-client";
import type {
  LoginHistory,
  QueryDeviceDto,
  QueryLoginHistoryDto,
  UserDevice,
} from "@/types/device.types";

/**
 * Service quản lý các yêu cầu API liên quan đến Quản lý Thiết bị (Devices) & Lịch sử Đăng nhập
 */
export const deviceService = {
  /**
   * Lấy danh sách thiết bị của chính sinh viên đang đăng nhập (GET /devices/my-devices)
   */
  async getMyDevices(): Promise<UserDevice[]> {
    const res = await apiClient<any>("/devices/my-devices", {
      method: "GET",
    });
    return Array.isArray(res) ? res : res?.items || [];
  },

  /**
   * Lấy danh sách thiết bị đang chờ phê duyệt (Giảng viên / Admin) (GET /devices/pending)
   */
  async getPendingDevices(query?: QueryDeviceDto): Promise<UserDevice[]> {
    const params = new URLSearchParams();
    if (query?.status) params.append("status", query.status);
    if (query?.search) params.append("search", query.search);

    const queryString = params.toString();
    const endpoint = `/devices/pending${queryString ? `?${queryString}` : ""}`;

    const res = await apiClient<any>(endpoint, {
      method: "GET",
    });
    return Array.isArray(res) ? res : res?.items || [];
  },

  /**
   * Lấy danh sách thiết bị của 1 sinh viên cụ thể (Giảng viên / Admin) (GET /devices/student/:studentId)
   */
  async getStudentDevices(studentId: string): Promise<UserDevice[]> {
    const res = await apiClient<any>(`/devices/student/${studentId}`, {
      method: "GET",
    });
    return Array.isArray(res) ? res : res?.items || [];
  },

  /**
   * Phê duyệt thiết bị cho sinh viên (Giảng viên / Admin) (PATCH /devices/:id/approve)
   */
  async approveDevice(deviceRecordId: string): Promise<{ message: string; device: UserDevice }> {
    return apiClient<{ message: string; device: UserDevice }>(`/devices/${deviceRecordId}/approve`, {
      method: "PATCH",
    });
  },

  /**
   * Từ chối thiết bị cho sinh viên (Giảng viên / Admin) (PATCH /devices/:id/reject)
   */
  async rejectDevice(deviceRecordId: string, reason: string): Promise<{ message: string; device: UserDevice }> {
    return apiClient<{ message: string; device: UserDevice }>(`/devices/${deviceRecordId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Hủy kích hoạt thiết bị của sinh viên (Giảng viên / Admin) (PATCH /devices/:id/deactivate)
   */
  async deactivateDevice(deviceRecordId: string): Promise<{ message: string; device: UserDevice }> {
    return apiClient<{ message: string; device: UserDevice }>(`/devices/${deviceRecordId}/deactivate`, {
      method: "PATCH",
    });
  },

  /**
   * Lấy lịch sử đăng nhập / đăng xuất (GET /devices/login-history)
   */
  async getLoginHistory(query?: QueryLoginHistoryDto): Promise<LoginHistory[]> {
    const params = new URLSearchParams();
    if (query?.userId) params.append("userId", query.userId);
    if (query?.status) params.append("status", query.status);
    if (query?.search) params.append("search", query.search);

    const queryString = params.toString();
    const endpoint = `/devices/login-history${queryString ? `?${queryString}` : ""}`;

    const res = await apiClient<any>(endpoint, {
      method: "GET",
    });
    return Array.isArray(res) ? res : res?.items || [];
  },
};
