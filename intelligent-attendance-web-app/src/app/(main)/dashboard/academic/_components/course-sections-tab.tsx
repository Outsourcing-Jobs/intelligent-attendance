"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  GraduationCap,
  Layers,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  academicService,
  courseSectionService,
  semesterService,
  subjectService,
} from "@/services/academic.service";
import { useAuthStore } from "@/stores/auth-store";
import type {
  CourseSection,
  CourseSectionStatus,
  Semester,
  Subject,
} from "@/types/academic.types";
import type { UserProfile } from "@/types/auth.types";

export function CourseSectionsTab() {
  const user = useAuthStore((state) => state.user);
  const roleCode =
    user?.roleCode ||
    (typeof user?.role === "object" ? user?.role?.code : typeof user?.roleId === "object" ? (user?.roleId as any)?.code : "");
  const isAdmin = roleCode === "admin";
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allLecturers, setAllLecturers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [filterSemesterId, setFilterSemesterId] = useState<string>("all");
  const [filterSubjectId, setFilterSubjectId] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  // CourseSection Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCS, setEditingCS] = useState<CourseSection | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [sectionCode, setSectionCode] = useState("");
  const [maxSize, setMaxSize] = useState<number>(40);
  const [room, setRoom] = useState("");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState<CourseSectionStatus>("open");
  const [initialLecturerId, setInitialLecturerId] = useState<string>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lecturer Assignment Dialog State
  const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);
  const [selectedCS, setSelectedCS] = useState<CourseSection | null>(null);
  const [assignedLecturers, setAssignedLecturers] = useState<any[]>([]);
  const [lecturerToAssign, setLecturerToAssign] = useState<string>("");
  const [lecturerRole, setLecturerRole] = useState<string>("main");
  const [isLoadingLecturers, setIsLoadingLecturers] = useState(false);
  const [isAssigningLecturer, setIsAssigningLecturer] = useState(false);

  // Enrolled Students Dialog State
  const [isCSStudentModalOpen, setIsCSStudentModalOpen] = useState(false);
  const [selectedCSForStudents, setSelectedCSForStudents] = useState<CourseSection | null>(null);
  const [csStudents, setCSStudents] = useState<any[]>([]);
  const [isLoadingCSStudents, setIsLoadingCSStudents] = useState(false);

  const handleOpenCSStudentModal = async (cs: CourseSection) => {
    setSelectedCSForStudents(cs);
    setIsCSStudentModalOpen(true);
    setIsLoadingCSStudents(true);
    try {
      const data = await courseSectionService.getCourseSectionStudents(cs._id);
      setCSStudents(data || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách sinh viên lớp học phần", {
        description: error?.message,
      });
    } finally {
      setIsLoadingCSStudents(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [csData, semData, subData] = await Promise.all([
        courseSectionService.getCourseSections(
          filterSemesterId === "all" ? undefined : filterSemesterId,
          filterSubjectId === "all" ? undefined : filterSubjectId
        ),
        semesterService.getSemesters(),
        subjectService.getSubjects(),
      ]);
      setCourseSections(csData || []);
      setSemesters(semData || []);
      setSubjects(subData || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách lớp học phần", {
        description: error?.message || "Vui lòng kiểm tra kết nối máy chủ.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterSemesterId, filterSubjectId]);

  const handleOpenModal = async (cs?: CourseSection) => {
    if (cs) {
      setEditingCS(cs);
      setSubjectId(typeof cs.subjectId === "object" ? cs.subjectId._id : cs.subjectId);
      setSemesterId(typeof cs.semesterId === "object" ? cs.semesterId._id : cs.semesterId);
      setSectionCode(cs.sectionCode);
      setMaxSize(cs.maxSize);
      setRoom(cs.room || "");
      setSchedule(cs.schedule || "");
      setStatus(cs.status);
      setInitialLecturerId("none");
    } else {
      setEditingCS(null);
      setSubjectId(subjects[0]?._id || "");
      setSemesterId(semesters.find((s) => s.status === "active")?._id || semesters[0]?._id || "");
      setSectionCode("");
      setMaxSize(40);
      setRoom("A301");
      setSchedule("Thứ 2 - Tiết 1-3");
      setStatus("open");
      setInitialLecturerId("none");
    }

    if (isAdmin) {
      try {
        const lecData = await academicService.getLecturers();
        setAllLecturers(lecData || []);
      } catch (e) {
        // Ignored
      }
    }

    setIsModalOpen(true);
  };

  const handleAutoGenerateCode = (subId: string, semId: string) => {
    const sub = subjects.find((s) => s._id === subId);
    const sem = semesters.find((s) => s._id === semId);
    if (sub && sem) {
      const semShortName = sem.name.replace(/\s+/g, "");
      setSectionCode(`${sub.code}-${semShortName}-G01`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCS) {
        await courseSectionService.updateCourseSection(editingCS._id, {
          subjectId,
          semesterId,
          sectionCode: sectionCode.trim(),
          maxSize: Number(maxSize),
          room: room.trim() || undefined,
          schedule: schedule.trim() || undefined,
          status,
        });
        toast.success("Cập nhật lớp học phần thành công!");
      } else {
        const newCS = await courseSectionService.createCourseSection({
          subjectId,
          semesterId,
          sectionCode: sectionCode.trim(),
          maxSize: Number(maxSize),
          room: room.trim() || undefined,
          schedule: schedule.trim() || undefined,
          status,
        });

        if (initialLecturerId && initialLecturerId !== "none" && newCS?._id) {
          await courseSectionService.assignLecturer(newCS._id, initialLecturerId, "main").catch(() => {});
        }

        toast.success("Tạo lớp học phần mới thành công!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Không thể lưu lớp học phần", {
        description: error?.message || "Kiểm tra trạng thái học kỳ hoặc sĩ số tối đa.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cs: CourseSection) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa lớp học phần "${cs.sectionCode}"?`)) return;

    try {
      await courseSectionService.deleteCourseSection(cs._id);
      toast.success("Xóa lớp học phần thành công!");
      fetchData();
    } catch (error: any) {
      toast.error("Không thể xóa lớp học phần", {
        description: error?.message || "Lớp học phần có thể đang chứa sinh viên đăng ký.",
      });
    }
  };

  // Lecturer Assignment Handlers
  const handleOpenLecturerModal = async (cs: CourseSection) => {
    setSelectedCS(cs);
    setIsLecturerModalOpen(true);
    setIsLoadingLecturers(true);
    setLecturerToAssign("");
    setLecturerRole("main");

    try {
      const [data, lecData] = await Promise.all([
        courseSectionService.getLecturers(cs._id),
        academicService.getLecturers().catch(() => []),
      ]);
      setAssignedLecturers(data || []);
      setAllLecturers(lecData || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách giảng viên phụ trách", {
        description: error?.message,
      });
    } finally {
      setIsLoadingLecturers(false);
    }
  };

  const handleAssignLecturer = async () => {
    if (!selectedCS || !lecturerToAssign) return;
    setIsAssigningLecturer(true);

    try {
      await courseSectionService.assignLecturer(selectedCS._id, lecturerToAssign, lecturerRole);
      toast.success("Đã phân công Giảng viên cho lớp học phần!");
      setLecturerToAssign("");

      // Refresh assigned lecturers
      const data = await courseSectionService.getLecturers(selectedCS._id);
      setAssignedLecturers(data || []);
      fetchData();
    } catch (error: any) {
      toast.error("Không thể phân công Giảng viên", {
        description: error?.message || "Giảng viên có thể đã được phân công.",
      });
    } finally {
      setIsAssigningLecturer(false);
    }
  };

  const handleRemoveLecturer = async (lecturerId: string) => {
    if (!selectedCS) return;
    try {
      await courseSectionService.removeLecturer(selectedCS._id, lecturerId);
      toast.success("Đã gỡ Giảng viên khỏi lớp học phần!");
      setAssignedLecturers((prev) =>
        prev.filter((item) => {
          const lId = typeof item.lecturerId === "object" ? item.lecturerId._id : item.lecturerId;
          return lId !== lecturerId;
        })
      );
      fetchData();
    } catch (error: any) {
      toast.error("Không thể gỡ Giảng viên", { description: error?.message });
    }
  };

  const filteredCS = courseSections.filter((cs) => {
    const codeMatch = cs.sectionCode.toLowerCase().includes(searchKeyword.toLowerCase());
    const subObj = typeof cs.subjectId === "object" ? cs.subjectId : null;
    const subMatch = subObj ? subObj.name.toLowerCase().includes(searchKeyword.toLowerCase()) : false;
    return codeMatch || subMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Quản lý Lớp học phần</h2>
          <p className="text-muted-foreground text-sm">
            Mở lớp học phần theo học kỳ, phân công Giảng viên phụ trách, cấu hình sĩ số, phòng học và lịch dạy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-1" />
              Mở Lớp Học phần
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã lớpHP hoặc môn học..."
                className="pl-8"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-48">
                <Select value={filterSemesterId} onValueChange={setFilterSemesterId}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Tất cả học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả Học kỳ</SelectItem>
                    {semesters.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name} ({s.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-48">
                <Select value={filterSubjectId} onValueChange={setFilterSubjectId}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Tất cả môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả Môn học</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.code} - {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã Lớp HP</TableHead>
                <TableHead>Môn học</TableHead>
                <TableHead>Học kỳ</TableHead>
                <TableHead>Giảng viên phụ trách</TableHead>
                <TableHead className="w-[160px]">Sĩ số (Đã ĐK / Tối đa)</TableHead>
                <TableHead>Địa điểm & Lịch học</TableHead>
                <TableHead>Trạng thái</TableHead>
                {isAdmin && <TableHead className="text-right">Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCS.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-muted-foreground">
                    Không có lớp học phần nào phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                filteredCS.map((cs) => {
                  const subObj = typeof cs.subjectId === "object" ? cs.subjectId : null;
                  const semObj = typeof cs.semesterId === "object" ? cs.semesterId : null;
                  const fillPercent = Math.round(((cs.currentSize || 0) / (cs.maxSize || 1)) * 100);

                  const assignedList: any[] = (cs as any).lecturers || [];

                  return (
                    <TableRow key={cs._id}>
                      <TableCell className="font-mono font-bold text-primary">{cs.sectionCode}</TableCell>
                      <TableCell className="font-medium">
                        {subObj ? `${subObj.code} - ${subObj.name}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {semObj ? semObj.name : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {assignedList.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">Chưa phân công</span>
                          ) : (
                            assignedList.map((item: any) => {
                              const lec = item.lecturer;
                              const name = lec ? `${lec.fullName}${lec.userCode ? ` (${lec.userCode})` : ""}` : "Giảng viên";
                              return (
                                <div key={item._id} className="flex items-center gap-1 text-xs font-medium">
                                  <UserCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                                  <span>{name}</span>
                                  {item.role === "assistant" && (
                                    <Badge variant="outline" className="text-[10px] py-0 px-1">Trợ giảng</Badge>
                                  )}
                                </div>
                              );
                            })
                          )}
                          {isAdmin && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-[11px] text-primary justify-start"
                              onClick={() => handleOpenLecturerModal(cs)}
                            >
                              + Phân công GV
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="space-y-1 cursor-pointer hover:bg-muted/50 p-1 rounded-md transition-colors group"
                          onClick={() => handleOpenCSStudentModal(cs)}
                          title="Bấm để xem danh sách sinh viên lớp học phần"
                        >
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-primary group-hover:underline flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {cs.currentSize} / {cs.maxSize} SV
                            </span>
                            <span className="text-muted-foreground">{fillPercent}%</span>
                          </div>
                          <Progress value={fillPercent} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs space-y-0.5">
                        {cs.room && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span>Phòng: {cs.room}</span>
                          </div>
                        )}
                        {cs.schedule && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{cs.schedule}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {cs.status === "open" && (
                          <Badge variant="default" className="bg-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Đang mở
                          </Badge>
                        )}
                        {cs.status === "closed" && (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" /> Đã đóng ĐK
                          </Badge>
                        )}
                        {cs.status === "cancelled" && (
                          <Badge variant="destructive">Hủy lớp</Badge>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(cs)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(cs)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit CourseSection Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCS ? "Cập nhật Lớp Học phần" : "Mở Lớp Học phần Mới"}</DialogTitle>
            <DialogDescription>
              Lớp học phần chỉ tạo được khi Học kỳ đang ở trạng thái active hoặc upcoming.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="semester">Học kỳ *</Label>
              <Select
                value={semesterId}
                onValueChange={(val) => {
                  setSemesterId(val);
                  if (subjectId) handleAutoGenerateCode(subjectId, val);
                }}
                required
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Chọn học kỳ" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem._id} value={sem._id}>
                      {sem.name} ({sem.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Môn học *</Label>
              <Select
                value={subjectId}
                onValueChange={(val) => {
                  setSubjectId(val);
                  if (semesterId) handleAutoGenerateCode(val, semesterId);
                }}
                required
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((sub) => (
                    <SelectItem key={sub._id} value={sub._id}>
                      {sub.code} - {sub.name} ({sub.credits} TC)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sectionCode">Mã Lớp HP *</Label>
                <Input
                  id="sectionCode"
                  placeholder="CS101-HK1-2026-G01"
                  value={sectionCode}
                  onChange={(e) => setSectionCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSize">Sĩ số tối đa *</Label>
                <Input
                  id="maxSize"
                  type="number"
                  min={1}
                  max={200}
                  value={maxSize}
                  onChange={(e) => setMaxSize(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="room">Phòng học</Label>
                <Input
                  id="room"
                  placeholder="Ví dụ: A301, LAB01"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Lịch học</Label>
                <Input
                  id="schedule"
                  placeholder="Thứ 2 - Tiết 1-3"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                />
              </div>
            </div>

            {!editingCS && (
              <div className="space-y-2">
                <Label htmlFor="initialLecturer">Giảng viên phụ trách (Chính)</Label>
                <Select value={initialLecturerId} onValueChange={setInitialLecturerId}>
                  <SelectTrigger id="initialLecturer">
                    <SelectValue placeholder="-- Chưa phân công --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Phân công sau --</SelectItem>
                    {allLecturers.map((t) => {
                      const tId = t._id || t.id || "";
                      if (!tId) return null;
                      return (
                        <SelectItem key={tId} value={tId}>
                          {t.fullName || t.email} {t.userCode ? `(${t.userCode})` : ""} - {t.email}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="csStatus">Trạng thái Lớp HP</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as CourseSectionStatus)}>
                <SelectTrigger id="csStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open (Đang mở ĐK)</SelectItem>
                  <SelectItem value="closed">Closed (Đóng ĐK)</SelectItem>
                  <SelectItem value="cancelled">Cancelled (Hủy lớp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCS ? "Lưu thay đổi" : "Tạo Lớp HP"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lecturer Assignment Dialog */}
      <Dialog open={isLecturerModalOpen} onOpenChange={setIsLecturerModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Phân công Giảng viên: {selectedCS?.sectionCode}
            </DialogTitle>
            <DialogDescription>
              Gán Giảng viên chính hoặc Trợ giảng phụ trách lớp học phần này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Assign Form */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Select value={lecturerToAssign} onValueChange={setLecturerToAssign}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="-- Chọn Giảng viên --" />
                  </SelectTrigger>
                  <SelectContent>
                    {allLecturers.map((t) => {
                      const tId = t._id || t.id || "";
                      if (!tId) return null;
                      const isAssigned = assignedLecturers.some((item) => {
                        const lId = typeof item.lecturerId === "object" ? item.lecturerId._id : item.lecturerId;
                        return lId === tId;
                      });
                      return (
                        <SelectItem key={tId} value={tId} disabled={isAssigned}>
                          {t.fullName || t.email} {t.userCode ? `(${t.userCode})` : ""} {isAssigned ? "(Đã gán)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32">
                <Select value={lecturerRole} onValueChange={setLecturerRole}>
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">GV Chính</SelectItem>
                    <SelectItem value="assistant">Trợ giảng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="sm"
                onClick={handleAssignLecturer}
                disabled={!lecturerToAssign || isAssigningLecturer}
              >
                {isAssigningLecturer ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Phân công
              </Button>
            </div>

            {/* Assigned Lecturers List */}
            <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
              {isLoadingLecturers ? (
                <div className="flex items-center justify-center p-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải danh sách...
                </div>
              ) : assignedLecturers.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs italic">
                  Chưa có Giảng viên nào được phân công phụ trách lớp học phần này.
                </div>
              ) : (
                assignedLecturers.map((item) => {
                  const lec = typeof item.lecturerId === "object" ? item.lecturerId : null;
                  const lId = lec ? lec._id : (item.lecturerId as string);
                  const name = lec ? `${lec.fullName} (${lec.userCode || lec.email})` : lId;

                  return (
                    <div key={item._id} className="flex items-center justify-between p-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">{name}</span>
                        <Badge variant={item.role === "main" ? "default" : "outline"} className="text-[10px]">
                          {item.role === "main" ? "GV Chính" : "Trợ giảng"}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveLecturer(lId)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsLecturerModalOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enrolled Students List Dialog */}
      <Dialog open={isCSStudentModalOpen} onOpenChange={setIsCSStudentModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono">
              <Users className="h-5 w-5 text-primary" />
              Danh sách Sinh viên: Lớp HP {selectedCSForStudents?.sectionCode}
            </DialogTitle>
            <DialogDescription>
              Danh sách sinh viên đã đăng ký học phần thuộc lớp này.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-2">
            {isLoadingCSStudents ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải danh sách sinh viên...
              </div>
            ) : csStudents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm italic border rounded-md">
                Chưa có sinh viên nào đăng ký lớp học phần này.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">STT</TableHead>
                    <TableHead>Mã SV</TableHead>
                    <TableHead>Họ và Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csStudents.map((item, idx) => {
                    const st = typeof item.studentId === "object" ? item.studentId : null;
                    const code = st ? st.userCode || "—" : "—";
                    const name = st ? st.fullName || "Sinh viên" : item.studentId;
                    const email = st ? st.email : "—";
                    const phone = st ? st.phone || "—" : "—";

                    return (
                      <TableRow key={item._id}>
                        <TableCell className="text-center font-mono text-xs">{idx + 1}</TableCell>
                        <TableCell className="font-mono font-bold text-primary">{code}</TableCell>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{email}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{phone}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter className="pt-2 border-t">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-muted-foreground font-medium">
                Đã đăng ký: <strong className="text-foreground">{csStudents.length}</strong> / {selectedCSForStudents?.maxSize} sinh viên
              </span>
              <Button variant="outline" size="sm" onClick={() => setIsCSStudentModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
