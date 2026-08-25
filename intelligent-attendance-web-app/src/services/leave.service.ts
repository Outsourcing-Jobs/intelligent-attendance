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

export const leaveService = {
  async createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequestItem> {
    return apiClient<LeaveRequestItem>("/leave-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMyLeaveRequests(status?: string): Promise<LeaveRequestItem[]> {
    const query = status && status !== "all" ? `?status=${status}` : "";
    return apiClient<LeaveRequestItem[]>(`/leave-requests/my${query}`, {
      method: "GET",
    });
  },

  async getTeacherLeaveRequests(status?: string, courseSectionId?: string): Promise<LeaveRequestItem[]> {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (courseSectionId && courseSectionId !== "all") params.append("courseSectionId", courseSectionId);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiClient<LeaveRequestItem[]>(`/leave-requests/teacher${query}`, {
      method: "GET",
    });
  },

  async getPendingCountForTeacher(): Promise<{ count: number }> {
    return apiClient<{ count: number }>("/leave-requests/pending-count", {
      method: "GET",
    });
  },

  async getAllLeaveRequests(queryObj?: { status?: string; courseSectionId?: string; studentId?: string }): Promise<LeaveRequestItem[]> {
    const params = new URLSearchParams();
    if (queryObj?.status && queryObj.status !== "all") params.append("status", queryObj.status);
    if (queryObj?.courseSectionId && queryObj.courseSectionId !== "all") params.append("courseSectionId", queryObj.courseSectionId);
    if (queryObj?.studentId) params.append("studentId", queryObj.studentId);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiClient<LeaveRequestItem[]>(`/leave-requests/all${query}`, {
      method: "GET",
    });
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
