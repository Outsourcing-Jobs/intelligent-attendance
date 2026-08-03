"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Layers,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AcademicYearsTab } from "./_components/academic-years-tab";
import { SubjectsTab } from "./_components/subjects-tab";
import { ClassesTab } from "./_components/classes-tab";
import { CourseSectionsTab } from "./_components/course-sections-tab";
import {
  academicYearService,
  classService,
  courseSectionService,
  subjectService,
} from "@/services/academic.service";

export default function AcademicPage() {
  const [activeTab, setActiveTab] = useState("years");

  // Summary Metrics State
  const [stats, setStats] = useState({
    academicYears: 0,
    activeSemesters: 0,
    subjects: 0,
    classes: 0,
    courseSections: 0,
  });

  const loadSummary = async () => {
    try {
      const [ayList, subList, classList, csList] = await Promise.all([
        academicYearService.getAcademicYears().catch(() => []),
        subjectService.getSubjects().catch(() => []),
        classService.getClasses().catch(() => []),
        courseSectionService.getCourseSections().catch(() => []),
      ]);

      setStats({
        academicYears: ayList.length,
        activeSemesters: ayList.filter((a) => a.status === "active").length,
        subjects: subList.length,
        classes: classList.length,
        courseSections: csList.length,
      });
    } catch (error) {
      // Ignore initial stats error quietly
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Quản lý Chương trình Đào tạo
          </h1>
          <p className="text-muted-foreground text-sm">
            Hệ thống quản lý tín chỉ: Năm học, Học kỳ, Danh mục môn học, Lớp sinh viên và Lớp học phần.
          </p>
        </div>
      </div>

      {/* KPI / Overview Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.academicYears}</div>
              <div className="text-xs text-muted-foreground">Năm học hệ thống</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.subjects}</div>
              <div className="text-xs text-muted-foreground">Môn học trong danh mục</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.classes}</div>
              <div className="text-xs text-muted-foreground">Lớp sinh viên (Cohort)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.courseSections}</div>
              <div className="text-xs text-muted-foreground">Lớp học phần</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 gap-6">
          <TabsTrigger
            value="years"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 font-medium"
          >
            <Calendar className="h-4 w-4 mr-2 inline" />
            Năm học & Học kỳ
          </TabsTrigger>

          <TabsTrigger
            value="subjects"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 font-medium"
          >
            <BookOpen className="h-4 w-4 mr-2 inline" />
            Danh mục Môn học
          </TabsTrigger>

          <TabsTrigger
            value="classes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 font-medium"
          >
            <Users className="h-4 w-4 mr-2 inline" />
            Lớp Sinh viên
          </TabsTrigger>

          <TabsTrigger
            value="sections"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-2 font-medium"
          >
            <Layers className="h-4 w-4 mr-2 inline" />
            Lớp Học phần
          </TabsTrigger>
        </TabsList>

        <TabsContent value="years" className="pt-2">
          <AcademicYearsTab />
        </TabsContent>

        <TabsContent value="subjects" className="pt-2">
          <SubjectsTab />
        </TabsContent>

        <TabsContent value="classes" className="pt-2">
          <ClassesTab />
        </TabsContent>

        <TabsContent value="sections" className="pt-2">
          <CourseSectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
