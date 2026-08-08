export type DeviceStatus = "approved" | "pending" | "rejected" | "inactive" | "active";

export interface UserDevice {
  _id: string;
  userId: {
    _id?: string;
    fullName?: string;
    email?: string;
    userCode?: string;
    phone?: string;
  } | string;
  deviceId: string;
  deviceName: string;
  deviceType?: string;
  os?: string;
  browser?: string;
  userAgent?: string;
  status: DeviceStatus;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type LoginStatus = "success" | "pending_device" | "rejected" | "failed";

export interface LoginHistory {
  _id: string;
  userId: string;
  userEmail: string;
  userFullName?: string;
  roleCode?: string;
  deviceId: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  status: LoginStatus;
  message?: string;
  createdAt: string;
}

export interface QueryDeviceDto {
  status?: DeviceStatus;
  studentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QueryLoginHistoryDto {
  userId?: string;
  status?: LoginStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface RejectDeviceDto {
  reason: string;
}
