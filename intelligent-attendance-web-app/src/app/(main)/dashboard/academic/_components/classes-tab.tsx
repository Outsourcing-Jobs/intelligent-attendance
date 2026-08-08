"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Edit,
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
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

import { academicService, classService, subjectService } from "@/services/academic.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth-store";
import type { ClassSubject, StudentClass, Subject } from "@/types/academic.types";
import type { UserProfile } from "@/types/auth.types";

export function ClassesTab() {
  const user = useAuthStore((state) => state.user);
  const roleCode =
    user?.roleCode ||
    (typeof user?.role === "object" ? user?.role?.code : typeof user?.roleId === "object" ? (user?.roleId as any)?.code : "");
  const isAdmin = roleCode === "admin";
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Class Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<StudentClass | null>(null);
  const [className, setClassName] = useState("");
  const [cohortYear, setCohortYear] = useState<number>(new Date().getFullYear());
  const [homeroomLecturerId, setHomeroomLecturerId] = useState<string>("none");
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);

  // Subject Assignment Drawer/Dialog State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<StudentClass | null>(null);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [subjectToAssign, setSubjectToAssign] = useState<string>("");
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isAssigningSubject, setIsAssigningSubject] = useState(false);

  // Class Students View Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<StudentClass | null>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<UserProfile[]>([]);
  const [studentToAssign, setStudentToAssign] = useState<string>("");
  const [isLoadingClassStudents, setIsLoadingClassStudents] = useState(false);
  const [isAssigningStudent, setIsAssigningStudent] = useState(false);

  const handleOpenStudentModal = async (cls: StudentClass) => {
    setSelectedClassForStudents(cls);
    setIsStudentModalOpen(true);
    setIsLoadingClassStudents(true);
    setStudentToAssign("");
    try {
      const [studentsData, allUserData] = await Promise.all([
        classService.getClassStudents(cls._id),
        userService.getUsers({ limit: 100 }).catch(() => ({ items: [] })),
      ]);
      setClassStudents(studentsData || []);
      setAvailableStudents(allUserData?.items || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách sinh viên của lớp", { description: error?.message });
    } finally {
      setIsLoadingClassStudents(false);
    }
  };

  const handleAddStudentToClass = async () => {
    if (!selectedClassForStudents || !studentToAssign) return;
    setIsAssigningStudent(true);
    try {
      await classService.assignStudentsToClass(selectedClassForStudents._id, [studentToAssign]);
      toast.success("Thêm sinh viên vào lớp thành công!");
      setStudentToAssign("");
      const updated = await classService.getClassStudents(selectedClassForStudents._id);
      setClassStudents(updated || []);
    } catch (error: any) {
      toast.error("Không thể thêm sinh viên vào lớp", { description: error?.message });
    } finally {
      setIsAssigningStudent(false);
    }
  };

  const handleRemoveStudentFromClass = async (studentId: string) => {
    if (!selectedClassForStudents) return;
    try {
      await classService.removeStudentFromClass(selectedClassForStudents._id, studentId);
      toast.success("Đã gỡ sinh viên khỏi lớp thành công!");
      const updated = await classService.getClassStudents(selectedClassForStudents._id);
      setClassStudents(updated || []);
    } catch (error: any) {
      toast.error("Không thể gỡ sinh viên khỏi lớp", { description: error?.message });
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [classData, subjectData] = await Promise.all([
        classService.getClasses(),
        subjectService.getSubjects(),
      ]);
      setClasses(classData || []);
      setSubjects(subjectData || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách lớp học", {
        description: error?.message || "Kiểm tra kết nối máy chủ.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Class CRUD
  const handleOpenClassModal = async (cls?: StudentClass) => {
    if (cls) {
      setEditingClass(cls);
      setClassName(cls.name);
      setCohortYear(cls.cohortYear);

      const lecturerObj = typeof cls.homeroomLecturerId === "object" ? cls.homeroomLecturerId : null;
      const lecturerIdStr = lecturerObj ? lecturerObj._id : (cls.homeroomLecturerId as string);
      setHomeroomLecturerId(lecturerIdStr || "none");
    } else {
      setEditingClass(null);
      setClassName("");
      setCohortYear(new Date().getFullYear());
      setHomeroomLecturerId("none");
    }

    // Lazy load lecturers list for modal dropdown (only if admin opens modal)
    try {
      const lecData = await academicService.getLecturers();
      setTeachers(lecData || []);
    } catch (error) {
      // Ignored for non-admin users
    }

    setIsClassModalOpen(true);
  };

  const handleSubmitClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClass(true);

    try {
      const payload = {
        name: className.trim(),
        cohortYear: Number(cohortYear),
        homeroomLecturerId: homeroomLecturerId === "none" ? undefined : homeroomLecturerId,
      };

      if (editingClass) {
        await classService.updateClass(editingClass._id, payload);
        toast.success("Cập nhật thông tin lớp thành công!");
      } else {
        await classService.createClass(payload);
        toast.success("Tạo lớp sinh viên mới thành công!");
      }
      setIsClassModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Không thể lưu thông tin lớp", {
        description: error?.message || "Vui lòng kiểm tra lại thông tin.",
      });
    } finally {
      setIsSubmittingClass(false);
    }
  };

  const handleDeleteClass = async (cls: StudentClass) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa lớp sinh viên "${cls.name}"?`)) return;

    try {
      await classService.deleteClass(cls._id);
      toast.success("Xóa lớp thành công!");
      fetchData();
    } catch (error: any) {
      toast.error("Không thể xóa lớp", {
        description: error?.message || "Có thể lớp đang chứa sinh viên.",
      });
    }
  };

  // Subject Assignment Handlers
  const handleOpenAssignModal = async (cls: StudentClass) => {
    setSelectedClass(cls);
    setIsAssignModalOpen(true);
    setIsLoadingSubjects(true);
    setSubjectToAssign("");
    try {
      const data = await classService.getClassSubjects(cls._id);
      setClassSubjects(data || []);
    } catch (error: any) {
      toast.error("Không thể tải môn học của lớp", {
        description: error?.message,
      });
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const handleAssignSubject = async () => {
    if (!selectedClass || !subjectToAssign) return;
    setIsAssigningSubject(true);
    try {
      await classService.assignSubject(selectedClass._id, subjectToAssign);
      toast.success("Đã gán môn học vào lớp!");
      setSubjectToAssign("");
      // Refresh list
      const data = await classService.getClassSubjects(selectedClass._id);
      setClassSubjects(data || []);
    } catch (error: any) {
      toast.error("Không thể gán môn học", {
        description: error?.message || "Môn học có thể đã được gán trước đó.",
      });
    } finally {
      setIsAssigningSubject(false);
    }
  };

  const handleRemoveSubject = async (subjectId: string) => {
    if (!selectedClass) return;
    try {
      await classService.removeSubject(selectedClass._id, subjectId);
      toast.success("Đã gỡ môn học khỏi lớp!");
      setClassSubjects((prev: ClassSubject[]) =>
        prev.filter((item: ClassSubject) => {
          const sId = typeof item.subjectId === "object" ? item.subjectId._id : item.subjectId;
          return sId !== subjectId;
        })
      );
    } catch (error: any) {
      toast.error("Không thể gỡ môn học", {
        description: error?.message,
      });
    }
  };

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Quản lý Lớp Sinh viên (Cohort)</h2>
          <p className="text-muted-foreground text-sm">
            Quản lý danh mục lớp khóa học sinh viên, phân công Giảng viên chủ nhiệm và gán khung môn học.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={() => handleOpenClassModal()}>
              <Plus className="h-4 w-4 mr-1" />
              Tạo Lớp Mới
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên lớp sinh viên..."
                className="pl-8"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Tổng số lớp: <span className="font-semibold text-foreground">{filteredClasses.length}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên Lớp</TableHead>
                <TableHead>Năm Khóa (Cohort)</TableHead>
                <TableHead>Giảng viên Chủ nhiệm</TableHead>
                <TableHead className="text-center">Môn học Khung</TableHead>
                {isAdmin && <TableHead className="text-right">Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Không có lớp sinh viên nào phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((cls) => {
                  const lecturerObj = typeof cls.homeroomLecturerId === "object" ? cls.homeroomLecturerId : null;
                  const lecturerName = lecturerObj
                    ? `${lecturerObj.fullName}${lecturerObj.userCode ? ` (${lecturerObj.userCode})` : ""}`
                    : "Chưa phân công";

                  return (
                    <TableRow key={cls._id}>
                      <TableCell className="font-bold">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary shrink-0" />
                          <span>{cls.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Khóa {cls.cohortYear}</Badge>
                      </TableCell>
                      <TableCell>
                        {lecturerObj ? (
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                            <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>{lecturerName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Chưa phân công</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => handleOpenAssignModal(cls)}
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            {isAdmin ? "Phân bổ môn" : "Xem khung môn"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => handleOpenStudentModal(cls)}
                          >
                            <Users className="h-3.5 w-3.5 text-primary" />
                            Danh sách SV
                          </Button>
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenClassModal(cls)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClass(cls)}
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

      {/* Class Create / Edit Dialog */}
      <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Cập nhật Lớp Sinh viên" : "Tạo Lớp Sinh viên Mới"}</DialogTitle>
            <DialogDescription>
              Điền tên lớp, năm khóa học và phân công Giảng viên chủ nhiệm.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitClass} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="className">Tên Lớp Sinh viên *</Label>
              <Input
                id="className"
                placeholder="Ví dụ: CNTT2025-A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cohortYear">Năm Khóa (Cohort Year) *</Label>
              <Input
                id="cohortYear"
                type="number"
                min={2000}
                max={2100}
                value={cohortYear}
                onChange={(e) => setCohortYear(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeroom">Giảng viên Chủ nhiệm</Label>
              <Select value={homeroomLecturerId} onValueChange={setHomeroomLecturerId}>
                <SelectTrigger id="homeroom">
                  <SelectValue placeholder="-- Chọn Giảng viên chủ nhiệm --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Chưa phân công --</SelectItem>
                  {teachers.map((t) => {
                    const teacherId = t._id || t.id || "";
                    if (!teacherId) return null;
                    return (
                      <SelectItem key={teacherId} value={teacherId}>
                        {t.fullName || t.email} {t.userCode ? `(${t.userCode})` : ""} - {t.email}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsClassModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmittingClass}>
                {isSubmittingClass && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingClass ? "Lưu thay đổi" : "Tạo Lớp"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subject Assignment Dialog */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Khung Môn học: {selectedClass?.name}
            </DialogTitle>
            <DialogDescription>
              Gán danh sách các môn học thuộc chương trình đào tạo cho lớp sinh viên này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Add Subject to Class Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select value={subjectToAssign} onValueChange={setSubjectToAssign}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="-- Chọn môn học để thêm --" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => {
                      const isAlreadyAssigned = classSubjects.some((item: ClassSubject) => {
                        const sId = typeof item.subjectId === "object" ? item.subjectId._id : item.subjectId;
                        return sId === sub._id;
                      });
                      return (
                        <SelectItem key={sub._id} value={sub._id} disabled={isAlreadyAssigned}>
                          {sub.code} - {sub.name} ({sub.credits} TC) {isAlreadyAssigned ? "(Đã gán)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="sm"
                onClick={handleAssignSubject}
                disabled={!subjectToAssign || isAssigningSubject}
              >
                {isAssigningSubject ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                Gán môn
              </Button>
            </div>

            {/* Assigned Subjects List */}
            <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
              {isLoadingSubjects ? (
                <div className="flex items-center justify-center p-6 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải môn học...
                </div>
              ) : classSubjects.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs italic">
                  Chưa gán môn học nào cho lớp này.
                </div>
              ) : (
                classSubjects.map((item: ClassSubject) => {
                  const subObj = typeof item.subjectId === "object" ? item.subjectId : null;
                  const sId = subObj ? subObj._id : (item.subjectId as string);
                  const subCode = subObj ? subObj.code : "Môn học";
                  const subName = subObj ? subObj.name : sId;
                  const subCredits = subObj ? subObj.credits : 0;

                  return (
                    <div key={item._id} className="flex items-center justify-between p-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">{subCode}</span>
                        <span>{subName}</span>
                        {subCredits > 0 && <Badge variant="outline" className="text-[10px]">{subCredits} TC</Badge>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveSubject(sId)}
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
            <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Students View & Manage Dialog */}
      <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Danh sách Sinh viên: Lớp {selectedClassForStudents?.name} (Khóa {selectedClassForStudents?.cohortYear})
            </DialogTitle>
            <DialogDescription>
              Quản lý danh sách sinh viên chính thức thuộc lớp sinh viên này.
            </DialogDescription>
          </DialogHeader>

          {/* Add Student Controls */}
          {isAdmin && (
            <div className="bg-muted/40 p-3 rounded-lg border flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <Label className="text-xs text-muted-foreground mb-1 block">Chọn sinh viên để thêm vào lớp:</Label>
                <Select value={studentToAssign} onValueChange={setStudentToAssign}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="-- Chọn Sinh viên --" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableStudents
                      .filter((u) => !classStudents.some((cs) => cs._id === u._id))
                      .map((st) => (
                        <SelectItem key={st._id} value={st._id} className="text-xs">
                          <span className="font-mono font-semibold text-primary mr-2">[{st.userCode || "N/A"}]</span>
                          {st.fullName} ({st.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                className="mt-auto h-9"
                onClick={handleAddStudentToClass}
                disabled={!studentToAssign || isAssigningStudent}
              >
                {isAssigningStudent ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
                Thêm vào lớp
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-2">
            {isLoadingClassStudents ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải danh sách sinh viên...
              </div>
            ) : classStudents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm italic border rounded-md">
                Chưa có sinh viên nào thuộc lớp này.
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
                    <TableHead className="text-center">Trạng thái</TableHead>
                    {isAdmin && <TableHead className="w-16 text-center">Xóa</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents.map((st, idx) => (
                    <TableRow key={st._id}>
                      <TableCell className="text-center font-mono text-xs">{idx + 1}</TableCell>
                      <TableCell className="font-mono font-bold text-primary">{st.userCode || "—"}</TableCell>
                      <TableCell className="font-medium">{st.fullName || "Sinh viên"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{st.email}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{st.phone || "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={st.status === "active" ? "default" : "outline"} className="text-[10px]">
                          {st.status === "active" ? "Đang học" : st.status || "Hoạt động"}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveStudentFromClass(st._id)}
                            title="Gỡ sinh viên khỏi lớp"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter className="pt-2 border-t">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-muted-foreground font-medium">
                Tổng số: <strong className="text-foreground">{classStudents.length}</strong> sinh viên
              </span>
              <Button variant="outline" size="sm" onClick={() => setIsStudentModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
