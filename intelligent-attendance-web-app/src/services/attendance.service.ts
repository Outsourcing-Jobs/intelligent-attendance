import { apiClient } from "@/lib/api-client";

export interface AttendanceConfig {
  gracePeriodMinutes: number;
  lateThresholdMinutes: number;
  allowSelfCheckIn: boolean;
  allowedPublicIps: string[];
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  requireWifiCheck: boolean;
  requireLocationCheck: boolean;
  isActive: boolean;
  currentClientIp?: string;
}


export interface CheckInRequest {
  classSessionId: string;
  courseSectionId: string;
  userLat?: number;
  userLng?: number;
  accuracy?: number;
  capturedImage?: string;
  note?: string;
}

export interface ScanQrRequest {
  qrToken: string;
  deviceId: string;
  userLat?: number;
  userLng?: number;
  accuracy?: number;
  capturedImage?: string;
  note?: string;
}

export interface CheckInResponse {
  message: string;
  attendance: any;
  distanceMeters: number | null;
  clientIp: string;
  status?: string;
}


export interface TodaySessionInfo {
  _id: string;
  date: string;
  room: string;
  startPeriod: number;
  numPeriods: number;
  startTime: string;
  endTime: string;
  courseSection?: {
    _id: string;
    sectionCode: string;
    subjectId?: {
      _id: string;
      subjectCode: string;
      subjectName: string;
    };
  };
  lecturer?: {
    fullName: string;
    email: string;
  };
  attendance: {
    _id?: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    status: string;
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    note: string | null;
  };
}

export interface AttendanceReportFilter {
  courseSectionId?: string;
  classSessionId?: string;
  date?: string;
  status?: string;
  search?: string;
}

export interface AttendanceReportSummary {
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  excusedCount: number;
}

export interface AttendanceReportResponse {
  summary: AttendanceReportSummary;
  records: any[];
}

export const attendanceService = {
  /**
   * Tự động lấy danh sách tiết học/buổi học hôm nay của sinh viên
   */
  async getTodaySessions(): Promise<TodaySessionInfo[]> {
    return apiClient<TodaySessionInfo[]>("/attendances/today-session", {
      method: "GET",
    });
  },

  /**
   * Sinh viên quét mã QR động để Điểm danh
   */
  async scanQrAttendance(data: ScanQrRequest): Promise<CheckInResponse> {
    return apiClient<CheckInResponse>("/attendances/scan-qr", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Sinh viên tự điểm danh vào (Check-in)
   */

  async checkIn(data: CheckInRequest): Promise<CheckInResponse> {
    return apiClient<CheckInResponse>("/attendances/check-in", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Sinh viên tự điểm danh ra (Check-out)
   */
  async checkOut(data: CheckInRequest): Promise<CheckInResponse> {
    return apiClient<CheckInResponse>("/attendances/check-out", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Lấy cấu hình điểm danh (WiFi IP, Tọa độ GPS, Bán kính)
   */
  async getConfig(): Promise<AttendanceConfig> {
    return apiClient<AttendanceConfig>("/attendances/config", {
      method: "GET",
    });
  },

  /**
   * Admin cập nhật cấu hình điểm danh
   */
  async updateConfig(data: Partial<AttendanceConfig>): Promise<AttendanceConfig> {
    return apiClient<AttendanceConfig>("/attendances/config", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Lấy lịch sử điểm danh cá nhân
   */
  async getMyHistory(): Promise<any[]> {
    return apiClient<any[]>("/attendances/my-history", {
      method: "GET",
    });
  },

  /**
   * Báo cáo danh sách điểm danh chi tiết (Admin / Giảng viên)
   */
  async getReport(filter: AttendanceReportFilter = {}): Promise<AttendanceReportResponse> {
    const params = new URLSearchParams();
    if (filter.courseSectionId && filter.courseSectionId !== "all") params.append("courseSectionId", filter.courseSectionId);
    if (filter.classSessionId && filter.classSessionId !== "all") params.append("classSessionId", filter.classSessionId);
    if (filter.date) params.append("date", filter.date);
    if (filter.status && filter.status !== "all") params.append("status", filter.status);
    if (filter.search) params.append("search", filter.search);

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return apiClient<AttendanceReportResponse>(`/attendances/report${queryStr}`, {
      method: "GET",
    });
  },

  /**
   * Lấy thống kê số lượng và danh sách điểm danh thời gian thực hiện thời của buổi học
   */
  async getSessionLiveStats(sessionId: string): Promise<{
    classSessionId: string;
    presentCount: number;
    totalStudents: number;
    recentCheckIns: any[];
  }> {
    return apiClient<{
      classSessionId: string;
      presentCount: number;
      totalStudents: number;
      recentCheckIns: any[];
    }>(`/attendances/session-live-stats/${sessionId}`, {
      method: "GET",
    });
  },
};


