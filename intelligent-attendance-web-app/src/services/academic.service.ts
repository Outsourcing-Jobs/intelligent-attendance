import { apiClient } from "@/lib/api-client";
import type {
  AcademicYear,
  ClassSession,
  ClassSubject,
  CourseSection,
  CreateAcademicYearPayload,
  CreateClassPayload,
  CreateCourseSectionPayload,
  CreateSemesterPayload,
  CreateSubjectPayload,
  Semester,
  StudentClass,
  Subject,
  UpdateAcademicYearPayload,
  UpdateClassPayload,
  UpdateCourseSectionPayload,
  UpdateSemesterPayload,
  UpdateSubjectPayload,
} from "@/types/academic.types";
import type { UserProfile } from "@/types/auth.types";

/**
 * Common Academic Helpers
 */
export const academicService = {
  getLecturers: async (): Promise<UserProfile[]> => {
    return apiClient<UserProfile[]>("/course-sections/lecturers-list", { method: "GET" });
  },
};

/**
 * Academic Year API Service
 */
export const academicYearService = {
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    return apiClient<AcademicYear[]>("/academic-years", { method: "GET" });
  },

  getAcademicYearById: async (id: string): Promise<AcademicYear> => {
    return apiClient<AcademicYear>(`/academic-years/${id}`, { method: "GET" });
  },

  createAcademicYear: async (data: CreateAcademicYearPayload): Promise<AcademicYear> => {
    return apiClient<AcademicYear>("/academic-years", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAcademicYear: async (id: string, data: UpdateAcademicYearPayload): Promise<AcademicYear> => {
    return apiClient<AcademicYear>(`/academic-years/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteAcademicYear: async (id: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/academic-years/${id}`, { method: "DELETE" });
  },
};

/**
 * Semester API Service
 */
export const semesterService = {
  getSemesters: async (academicYearId?: string): Promise<Semester[]> => {
    const query = academicYearId ? `?academicYearId=${encodeURIComponent(academicYearId)}` : "";
    return apiClient<Semester[]>(`/semesters${query}`, { method: "GET" });
  },

  getSemesterById: async (id: string): Promise<Semester> => {
    return apiClient<Semester>(`/semesters/${id}`, { method: "GET" });
  },

  createSemester: async (data: CreateSemesterPayload): Promise<Semester> => {
    return apiClient<Semester>("/semesters", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateSemester: async (id: string, data: UpdateSemesterPayload): Promise<Semester> => {
    return apiClient<Semester>(`/semesters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteSemester: async (id: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/semesters/${id}`, { method: "DELETE" });
  },
};

/**
 * Subject API Service
 */
export const subjectService = {
  getSubjects: async (): Promise<Subject[]> => {
    return apiClient<Subject[]>("/subjects", { method: "GET" });
  },

  getSubjectById: async (id: string): Promise<Subject> => {
    return apiClient<Subject>(`/subjects/${id}`, { method: "GET" });
  },

  createSubject: async (data: CreateSubjectPayload): Promise<Subject> => {
    return apiClient<Subject>("/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateSubject: async (id: string, data: UpdateSubjectPayload): Promise<Subject> => {
    return apiClient<Subject>(`/subjects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteSubject: async (id: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/subjects/${id}`, { method: "DELETE" });
  },
};

/**
 * Class API Service
 */
export const classService = {
  getClasses: async (): Promise<StudentClass[]> => {
    return apiClient<StudentClass[]>("/classes", { method: "GET" });
  },

  getClassById: async (id: string): Promise<StudentClass> => {
    return apiClient<StudentClass>(`/classes/${id}`, { method: "GET" });
  },

  createClass: async (data: CreateClassPayload): Promise<StudentClass> => {
    return apiClient<StudentClass>("/classes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateClass: async (id: string, data: UpdateClassPayload): Promise<StudentClass> => {
    return apiClient<StudentClass>(`/classes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteClass: async (id: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/classes/${id}`, { method: "DELETE" });
  },

  getClassSubjects: async (classId: string): Promise<ClassSubject[]> => {
    return apiClient<ClassSubject[]>(`/classes/${classId}/subjects`, { method: "GET" });
  },

  assignSubject: async (classId: string, subjectId: string): Promise<ClassSubject> => {
    return apiClient<ClassSubject>(`/classes/${classId}/subjects`, {
      method: "POST",
      body: JSON.stringify({ subjectId }),
    });
  },

  removeSubject: async (classId: string, subjectId: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/classes/${classId}/subjects/${subjectId}`, {
      method: "DELETE",
    });
  },

  getClassStudents: async (classId: string): Promise<any[]> => {
    return apiClient<any[]>(`/classes/${classId}/students`, { method: "GET" });
  },
};

/**
 * Course Section API Service
 */
export const courseSectionService = {
  getCourseSections: async (semesterId?: string, subjectId?: string): Promise<CourseSection[]> => {
    const params = new URLSearchParams();
    if (semesterId) params.append("semesterId", semesterId);
    if (subjectId) params.append("subjectId", subjectId);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiClient<CourseSection[]>(`/course-sections${queryString}`, { method: "GET" });
  },

  getCourseSectionById: async (id: string): Promise<CourseSection> => {
    return apiClient<CourseSection>(`/course-sections/${id}`, { method: "GET" });
  },

  createCourseSection: async (data: CreateCourseSectionPayload): Promise<CourseSection> => {
    return apiClient<CourseSection>("/course-sections", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateCourseSection: async (id: string, data: UpdateCourseSectionPayload): Promise<CourseSection> => {
    return apiClient<CourseSection>(`/course-sections/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteCourseSection: async (id: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/course-sections/${id}`, { method: "DELETE" });
  },

  getLecturers: async (sectionId: string): Promise<any[]> => {
    return apiClient<any[]>(`/course-sections/${sectionId}/lecturers`, { method: "GET" });
  },

  assignLecturer: async (sectionId: string, lecturerId: string, role = "main"): Promise<any> => {
    return apiClient<any>(`/course-sections/${sectionId}/lecturers`, {
      method: "POST",
      body: JSON.stringify({ lecturerId, role }),
    });
  },

  removeLecturer: async (sectionId: string, lecturerId: string): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/course-sections/${sectionId}/lecturers/${lecturerId}`, {
      method: "DELETE",
    });
  },

  getCourseSectionStudents: async (sectionId: string): Promise<any[]> => {
    return apiClient<any[]>(`/course-sections/${sectionId}/students`, { method: "GET" });
  },

  getCourseSectionSessions: async (sectionId: string): Promise<ClassSession[]> => {
    return apiClient<ClassSession[]>(`/course-sections/${sectionId}/sessions`, { method: "GET" });
  },

  updateCourseSectionSession: async (
    sectionId: string,
    sessionId: string,
    data: {
      lecturerId?: string | null;
      room?: string;
      status?: string;
      date?: string;
      startPeriod?: number;
      numPeriods?: number;
    }
  ): Promise<ClassSession> => {
    return apiClient<ClassSession>(`/course-sections/${sectionId}/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  createCourseSectionSession: async (
    sectionId: string,
    data: {
      date: string;
      startPeriod: number;
      numPeriods: number;
      room?: string;
      lecturerId?: string;
      status?: string;
    }
  ): Promise<ClassSession> => {
    return apiClient<ClassSession>(`/course-sections/${sectionId}/sessions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteCourseSectionSession: async (
    sectionId: string,
    sessionId: string
  ): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/course-sections/${sectionId}/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },


  getMySessions: async (): Promise<ClassSession[]> => {
    return apiClient<ClassSession[]>("/course-sections/my-sessions", { method: "GET" });
  },

  enrollCourseSection: async (sectionId: string): Promise<any> => {
    return apiClient<any>(`/course-sections/${sectionId}/enroll`, { method: "POST" });
  },

  withdrawCourseSection: async (sectionId: string): Promise<any> => {
    return apiClient<any>(`/course-sections/${sectionId}/withdraw`, { method: "POST" });
  },
};
