export type AcademicYearStatus = "active" | "inactive";
export type SemesterStatus = "upcoming" | "active" | "closed";
export type CourseSectionStatus = "open" | "closed" | "cancelled";

export interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicYearPayload {
  name: string;
  startDate: string;
  endDate: string;
  status?: AcademicYearStatus;
}

export interface UpdateAcademicYearPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: AcademicYearStatus;
}

export interface Semester {
  _id: string;
  academicYearId: string | AcademicYear;
  name: string;
  startDate: string;
  endDate: string;
  status: SemesterStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSemesterPayload {
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  status?: SemesterStatus;
}

export interface UpdateSemesterPayload {
  academicYearId?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: SemesterStatus;
}

export interface Subject {
  _id: string;
  code: string;
  name: string;
  credits: number;
  prerequisiteSubjectId?: string | Subject | null;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubjectPayload {
  code: string;
  name: string;
  credits: number;
  prerequisiteSubjectId?: string | null;
  description?: string;
}

export interface UpdateSubjectPayload {
  code?: string;
  name?: string;
  credits?: number;
  prerequisiteSubjectId?: string | null;
  description?: string;
}

export interface StudentClass {
  _id: string;
  name: string;
  cohortYear: number;
  majorId?: string | null;
  homeroomLecturerId?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassPayload {
  name: string;
  cohortYear: number;
  majorId?: string;
  homeroomLecturerId?: string;
}

export interface UpdateClassPayload {
  name?: string;
  cohortYear?: number;
  majorId?: string;
  homeroomLecturerId?: string;
}

export interface ClassSubject {
  _id: string;
  classId: string;
  subjectId: Subject | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseSection {
  _id: string;
  subjectId: Subject | string;
  semesterId: Semester | string;
  sectionCode: string;
  maxSize: number;
  currentSize: number;
  room?: string;
  schedule?: string;
  status: CourseSectionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseSectionPayload {
  subjectId: string;
  semesterId: string;
  sectionCode: string;
  maxSize: number;
  room?: string;
  schedule?: string;
  status?: CourseSectionStatus;
}

export interface UpdateCourseSectionPayload {
  subjectId?: string;
  semesterId?: string;
  sectionCode?: string;
  maxSize?: number;
  room?: string;
  schedule?: string;
  status?: CourseSectionStatus;
}
