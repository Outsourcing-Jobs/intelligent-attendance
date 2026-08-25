import { FloatingNavbar } from "@/components/home/floating-navbar";
import { HeroSection } from "@/components/home/hero-section";
import { AcademicMetricsStrip } from "@/components/home/academic-metrics-strip";
import { RolePortalsSection } from "@/components/home/role-portals-section";
import { InnovationBentoGrid } from "@/components/home/innovation-bento-grid";
import { AttendanceWorkflowSection } from "@/components/home/attendance-workflow-section";
import { SecurityTrustSection } from "@/components/home/security-trust-section";
import { InstitutionalFooter } from "@/components/home/institutional-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/80 text-slate-900 selection:bg-blue-600 selection:text-white dark:bg-[#090D16] dark:text-slate-100 font-sans antialiased transition-colors">
      {/* Floating Fluid Glass Navbar */}
      <FloatingNavbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Asymmetrical Split & Live Attendance Simulator */}
        <HeroSection />

        {/* Academic Metrics & Realtime Trust Strip */}
        <AcademicMetricsStrip />

        {/* 3-Tier Dedicated Role Portals (Student V1, Faculty V2, Admin) */}
        <RolePortalsSection />

        {/* Core Innovation & Engineering Bento Grid */}
        <InnovationBentoGrid />

        {/* 4-Step Attendance & Education Workflow */}
        <AttendanceWorkflowSection />

        {/* Institutional Security & Compliance Trust */}
        <SecurityTrustSection />
      </main>

      {/* High-End Institutional Footer */}
      <InstitutionalFooter />
    </div>
  );
}
