"use client";

import Link from "next/link";
import { 
  GraduationCap, 
  Users, 
  FileSpreadsheet, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CourseSectionItem {
  id: string;
  sectionCode: string;
  courseCode: string;
  courseName: string;
  credits: number;
  totalStudents: number;
  avgAttendanceRate: number;
  avgScore: number;
  highRiskCount: number;
  mediumRiskCount: number;
}

const defaultCourseSections: CourseSectionItem[] = [
  {
    id: "cs-01",
    sectionCode: "K18-CNTT1.01",
    courseCode: "INT1340",
    courseName: "Lập trình Web Nâng Cao",
    credits: 3,
    totalStudents: 42,
    avgAttendanceRate: 94.8,
    avgScore: 8.9,
    highRiskCount: 1,
    mediumRiskCount: 2,
  },
  {
    id: "cs-02",
    sectionCode: "K18-CNTT2.02",
    courseCode: "INT1432",
    courseName: "Học Máy & Trí Tuệ Nhân Tạo",
    credits: 3,
    totalStudents: 40,
    avgAttendanceRate: 92.5,
    avgScore: 8.4,
    highRiskCount: 2,
    mediumRiskCount: 3,
  },
  {
    id: "cs-03",
    sectionCode: "K18-KTPM1.01",
    courseCode: "INT1221",
    courseName: "Cấu Trúc Dữ Liệu & Giải Thuật",
    credits: 4,
    totalStudents: 45,
    avgAttendanceRate: 96.1,
    avgScore: 9.1,
    highRiskCount: 0,
    mediumRiskCount: 1,
  },
  {
    id: "cs-04",
    sectionCode: "K18-HTTT1.01",
    courseCode: "INT1302",
    courseName: "Cơ Sở Dữ Liệu Phân Tán",
    credits: 3,
    totalStudents: 38,
    avgAttendanceRate: 89.2,
    avgScore: 7.8,
    highRiskCount: 3,
    mediumRiskCount: 2,
  },
];

export function CourseSectionsOverview() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <GraduationCap className="size-4" />
            </div>
            <CardTitle className="text-base font-bold sm:text-lg">
              Danh Sách Lớp Học Phần Đang Phụ Trách
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Tổng quan sĩ số, tỷ lệ chuyên cần trung bình và số lượng sinh viên diện cảnh báo AI cấm thi
          </CardDescription>
        </div>

        <Link href="/dashboard/attendance">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <FileSpreadsheet className="size-3.5 text-emerald-600" />
            <span>Xuất Báo Cáo Chuyên Cần Excel</span>
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-xs">
                <TableHead className="font-bold">Lớp Học Phần</TableHead>
                <TableHead className="font-bold">Môn Học</TableHead>
                <TableHead className="font-bold text-center">Tín Chỉ</TableHead>
                <TableHead className="font-bold text-center">Sĩ Số</TableHead>
                <TableHead className="font-bold text-center">Tỷ Lệ Chuyên Cần</TableHead>
                <TableHead className="font-bold text-center">Điểm CC Trung Bình</TableHead>
                <TableHead className="font-bold text-center">Cảnh Báo AI Sớm</TableHead>
                <TableHead className="font-bold text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {defaultCourseSections.map((sec) => (
                <TableRow key={sec.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-bold text-foreground">
                    {sec.sectionCode}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="font-semibold text-foreground">{sec.courseName}</span>
                      <p className="font-mono text-[10px] text-muted-foreground">{sec.courseCode}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {sec.credits} TC
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {sec.totalStudents} SV
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {sec.avgAttendanceRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-foreground">
                      {sec.avgScore.toFixed(1)} / 10
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {sec.highRiskCount > 0 ? (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px] font-bold gap-0.5">
                          <ShieldAlert className="size-2.5" />
                          {sec.highRiskCount} Nguy cơ cao
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                          <CheckCircle2 className="size-2.5 mr-0.5" />
                          0 cấm thi
                        </Badge>
                      )}
                      {sec.mediumRiskCount > 0 && (
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold border-amber-500/30 text-amber-600 bg-amber-500/10">
                          {sec.mediumRiskCount} Theo dõi
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href="/dashboard/attendance">
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-500/10 gap-1">
                        <span>Vào lớp</span>
                        <ArrowRight className="size-3" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
