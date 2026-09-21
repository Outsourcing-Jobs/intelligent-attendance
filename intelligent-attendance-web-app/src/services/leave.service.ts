import { apiClient } from "@/lib/api-client";

export interface CreateLeaveRequestPayload {
  courseSectionId: string;
  classSessionId?: string;
  leaveType: "sick" | "personal" | "family" | "other" | string;
  reason: string;
  fromDate: string;
  toDate: string;
  attachmentUrl?: string;
}

export interface LeaveRequestItem {
  _id: string;
  studentId: any;
  courseSectionId: any;
  classSessionId?: any;
  leaveType: string;
  reason: string;
  attachmentUrl?: string;
  fromDate: string;
  toDate: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewedBy?: any;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  histories?: any[];
}

export interface LeaveRequestQuery {
  status?: string;
  courseSectionId?: string;
  studentId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface LeaveRequestListResponse {
  items: LeaveRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const leaveService = {
  async createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequestItem> {
    return apiClient<LeaveRequestItem>("/leave-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMyLeaveRequests(
    query?: LeaveRequestQuery | string,
    page?: number,
    limit?: number,
  ): Promise<LeaveRequestListResponse> {
    const params = new URLSearchParams();
    if (typeof query === "string") {
      if (query && query !== "all") params.append("status", query);
      if (page) params.append("page", String(page));
      if (limit) params.append("limit", String(limit));
    } else if (query) {
      if (query.status && query.status !== "all") params.append("status", query.status);
      if (query.page) params.append("page", String(query.page));
      if (query.limit) params.append("limit", String(query.limit));
      if (query.search) params.append("search", query.search);
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await apiClient<any>(`/leave-requests/my${queryString}`, {
      method: "GET",
    });
    if (Array.isArray(res)) {
      return { items: res, total: res.length, page: 1, limit: res.length, totalPages: 1 };
    }
    return res;
  },

  async getTeacherLeaveRequests(
    query?: (LeaveRequestQuery & { courseSectionId?: string }) | string,
    courseSectionId?: string,
  ): Promise<LeaveRequestListResponse> {
    const params = new URLSearchParams();
    if (typeof query === "string") {
      if (query && query !== "all") params.append("status", query);
      if (courseSectionId && courseSectionId !== "all") params.append("courseSectionId", courseSectionId);
    } else if (query) {
      if (query.status && query.status !== "all") params.append("status", query.status);
      if (query.courseSectionId && query.courseSectionId !== "all") params.append("courseSectionId", query.courseSectionId);
      if (query.page) params.append("page", String(query.page));
      if (query.limit) params.append("limit", String(query.limit));
      if (query.search) params.append("search", query.search);
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await apiClient<any>(`/leave-requests/teacher${queryString}`, {
      method: "GET",
    });
    if (Array.isArray(res)) {
      return { items: res, total: res.length, page: 1, limit: res.length, totalPages: 1 };
    }
    return res;
  },

  async getPendingCountForTeacher(): Promise<{ count: number }> {
    return apiClient<{ count: number }>("/leave-requests/pending-count", {
      method: "GET",
    });
  },

  async getAllLeaveRequests(queryObj?: LeaveRequestQuery): Promise<LeaveRequestListResponse> {
    const params = new URLSearchParams();
    if (queryObj?.status && queryObj.status !== "all") params.append("status", queryObj.status);
    if (queryObj?.courseSectionId && queryObj.courseSectionId !== "all") params.append("courseSectionId", queryObj.courseSectionId);
    if (queryObj?.studentId) params.append("studentId", queryObj.studentId);
    if (queryObj?.page) params.append("page", String(queryObj.page));
    if (queryObj?.limit) params.append("limit", String(queryObj.limit));
    if (queryObj?.search) params.append("search", queryObj.search);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await apiClient<any>(`/leave-requests/all${queryString}`, {
      method: "GET",
    });
    if (Array.isArray(res)) {
      return { items: res, total: res.length, page: 1, limit: res.length, totalPages: 1 };
    }
    return res;
  },

  async getLeaveRequestDetail(id: string): Promise<LeaveRequestItem> {
    return apiClient<LeaveRequestItem>(`/leave-requests/${id}`, {
      method: "GET",
    });
  },

  async cancelLeaveRequest(id: string): Promise<{ message: string; leaveRequest: LeaveRequestItem }> {
    return apiClient<{ message: string; leaveRequest: LeaveRequestItem }>(`/leave-requests/${id}/cancel`, {
      method: "PATCH",
    });
  },

  async approveLeaveRequest(id: string): Promise<{ message: string; leaveRequest: LeaveRequestItem }> {
    return apiClient<{ message: string; leaveRequest: LeaveRequestItem }>(`/leave-requests/${id}/approve`, {
      method: "PATCH",
    });
  },

  async rejectLeaveRequest(id: string, rejectionReason: string): Promise<{ message: string; leaveRequest: LeaveRequestItem }> {
    return apiClient<{ message: string; leaveRequest: LeaveRequestItem }>(`/leave-requests/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ rejectionReason }),
    });
  },
};
