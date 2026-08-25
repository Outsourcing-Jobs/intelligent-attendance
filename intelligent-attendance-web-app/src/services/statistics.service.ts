import { apiClient } from "@/lib/api-client";

export interface StudentStatisticsResponse {
  kpi: {
    totalSessions: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    attendanceRate: number;
  };
  chart: { name: string; value: number; color: string }[];
  subjects: {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    sectionCode: string;
    totalSessions: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    rate: number;
  }[];
}

export interface TeacherStatisticsResponse {
  kpi: {
    totalStudents: number;
    totalCourseSections: number;
    totalSessions: number;
    totalAttendanceRecords: number;
    pendingLeaveCount: number;
  };
  chart: { name: string; value: number; color: string }[];
  studentRanking: {
    studentId: string;
    userCode: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    className: string;
    totalSessions: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    attendanceRate: number;
    risk: "NORMAL" | "WARNING" | "DANGER";
  }[];
}

export interface AdminStatisticsResponse {
  kpi: {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalCourseSections: number;
    totalSessions: number;
    totalAttendanceRecords: number;
    pendingLeaveRequests: number;
  };
  chart: { name: string; value: number; color: string }[];
}

export const statisticsService = {
  async getStudentStatistics(semesterId?: string): Promise<StudentStatisticsResponse> {
    const query = semesterId ? `?semesterId=${semesterId}` : "";
    return apiClient<StudentStatisticsResponse>(`/statistics/student${query}`, {
      method: "GET",
    });
  },

  async getTeacherStatistics(courseSectionId?: string): Promise<TeacherStatisticsResponse> {
    const query = courseSectionId ? `?courseSectionId=${courseSectionId}` : "";
    return apiClient<TeacherStatisticsResponse>(`/statistics/teacher${query}`, {
      method: "GET",
    });
  },

  async getAdminStatistics(): Promise<AdminStatisticsResponse> {
    return apiClient<AdminStatisticsResponse>("/statistics/admin", {
      method: "GET",
    });
  },
};
