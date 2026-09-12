"use client";

import { useAuthStore } from "@/stores/auth-store";
import { StudentDashboard } from "./_components/student-dashboard";
import { TeacherDashboard } from "./_components/teacher-dashboard";

export default function DefaultDashboardPage() {
  const { user } = useAuthStore();
  const rawRole = (
    user?.roleCode || 
    (typeof user?.role === "string" ? user.role : user?.role?.code) || 
    ""
  ).toLowerCase();

  // Strict role checking:
  // If role is not admin and not teacher/lecturer -> it is student
  const isTeacherOrAdmin = rawRole.includes("teacher") || rawRole.includes("lecturer") || rawRole.includes("admin");
  const isStudent = !isTeacherOrAdmin;

  if (isStudent) {
    return <StudentDashboard />;
  }

  return <TeacherDashboard />;
}
