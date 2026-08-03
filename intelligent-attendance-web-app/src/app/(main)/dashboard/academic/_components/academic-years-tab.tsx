"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
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

import { academicYearService, semesterService } from "@/services/academic.service";
import { useAuthStore } from "@/stores/auth-store";
import type {
  AcademicYear,
  AcademicYearStatus,
  Semester,
  SemesterStatus,
} from "@/types/academic.types";

export function AcademicYearsTab() {
  const user = useAuthStore((state) => state.user);
  const roleCode =
    user?.roleCode ||
    (typeof user?.role === "object" ? user?.role?.code : typeof user?.roleId === "object" ? (user?.roleId as any)?.code : "");
  const isAdmin = roleCode === "admin";
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Selected Academic Year for semester filtering
  const [selectedAYId, setSelectedAYId] = useState<string>("all");

  // Academic Year Modal States
  const [isAYModalOpen, setIsAYModalOpen] = useState(false);
  const [editingAY, setEditingAY] = useState<AcademicYear | null>(null);
  const [ayName, setAyName] = useState("");
  const [ayStartDate, setAyStartDate] = useState("");
  const [ayEndDate, setAyEndDate] = useState("");
  const [ayStatus, setAyStatus] = useState<AcademicYearStatus>("inactive");
  const [isSubmittingAY, setIsSubmittingAY] = useState(false);

  // Semester Modal States
  const [isSemModalOpen, setIsSemModalOpen] = useState(false);
  const [editingSem, setEditingSem] = useState<Semester | null>(null);
  const [semAYId, setSemAYId] = useState("");
  const [semName, setSemName] = useState("");
  const [semStartDate, setSemStartDate] = useState("");
  const [semEndDate, setSemEndDate] = useState("");
  const [semStatus, setSemStatus] = useState<SemesterStatus>("upcoming");
  const [isSubmittingSem, setIsSubmittingSem] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ayData, semData] = await Promise.all([
        academicYearService.getAcademicYears(),
        semesterService.getSemesters(),
      ]);
      setAcademicYears(ayData || []);
      setSemesters(semData || []);
    } catch (error: any) {
      toast.error("Không thể tải dữ liệu năm học / học kỳ", {
        description: error?.message || "Vui lòng kiểm tra lại kết nối.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format Date ISO string to YYYY-MM-DD
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  // Academic Year Submit
  const handleOpenAYModal = (ay?: AcademicYear) => {
    if (ay) {
      setEditingAY(ay);
      setAyName(ay.name);
      setAyStartDate(formatDateForInput(ay.startDate));
      setAyEndDate(formatDateForInput(ay.endDate));
      setAyStatus(ay.status);
    } else {
      setEditingAY(null);
      setAyName("2026-2027");
      setAyStartDate("2026-09-01");
      setAyEndDate("2027-06-30");
      setAyStatus("inactive");
    }
    setIsAYModalOpen(true);
  };

  const handleSubmitAY = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAY(true);
    try {
      if (editingAY) {
        await academicYearService.updateAcademicYear(editingAY._id, {
          name: ayName,
          startDate: ayStartDate,
          endDate: ayEndDate,
          status: ayStatus,
        });
        toast.success("Cập nhật năm học thành công!");
      } else {
        await academicYearService.createAcademicYear({
          name: ayName,
          startDate: ayStartDate,
          endDate: ayEndDate,
          status: ayStatus,
        });
        toast.success("Tạo năm học mới thành công!");
      }
      setIsAYModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Lỗi khi lưu năm học", {
        description: error?.message || "Kiểm tra dữ liệu nhập.",
      });
    } finally {
      setIsSubmittingAY(false);
    }
  };

  const handleDeleteAY = async (ay: AcademicYear) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa năm học "${ay.name}"?`)) return;
    try {
      await academicYearService.deleteAcademicYear(ay._id);
      toast.success("Xóa năm học thành công!");
      fetchData();
    } catch (error: any) {
      toast.error("Không thể xóa năm học", {
        description: error?.message || "Có thể năm học đang chứa các học kỳ.",
      });
    }
  };

  // Semester Submit
  const handleOpenSemModal = (sem?: Semester, defaultAYId?: string) => {
    if (sem) {
      setEditingSem(sem);
      setSemAYId(typeof sem.academicYearId === "object" ? sem.academicYearId._id : sem.academicYearId);
      setSemName(sem.name);
      setSemStartDate(formatDateForInput(sem.startDate));
      setSemEndDate(formatDateForInput(sem.endDate));
      setSemStatus(sem.status);
    } else {
      setEditingSem(null);
      setSemAYId(defaultAYId || (academicYears[0]?._id || ""));
      setSemName("Học kỳ 1");
      setSemStartDate("2026-09-01");
      setSemEndDate("2027-01-15");
      setSemStatus("upcoming");
    }
    setIsSemModalOpen(true);
  };

  const handleSubmitSem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSem(true);
    try {
      if (editingSem) {
        await semesterService.updateSemester(editingSem._id, {
          academicYearId: semAYId,
          name: semName,
          startDate: semStartDate,
          endDate: semEndDate,
          status: semStatus,
        });
        toast.success("Cập nhật học kỳ thành công!");
      } else {
        await semesterService.createSemester({
          academicYearId: semAYId,
          name: semName,
          startDate: semStartDate,
          endDate: semEndDate,
          status: semStatus,
        });
        toast.success("Tạo học kỳ mới thành công!");
      }
      setIsSemModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Lỗi khi lưu học kỳ", {
        description: error?.message || "Kiểm tra khoảng ngày hoặc trùng lặp.",
      });
    } finally {
      setIsSubmittingSem(false);
    }
  };

  const handleDeleteSem = async (sem: Semester) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa học kỳ "${sem.name}"?`)) return;
    try {
      await semesterService.deleteSemester(sem._id);
      toast.success("Xóa học kỳ thành công!");
      fetchData();
    } catch (error: any) {
      toast.error("Không thể xóa học kỳ", {
        description: error?.message || "Có thể học kỳ đang chứa lớp học phần.",
      });
    }
  };

  const filteredSemesters = semesters.filter((s) => {
    if (selectedAYId === "all") return true;
    const ayId = typeof s.academicYearId === "object" ? s.academicYearId?._id : s.academicYearId;
    return ayId === selectedAYId;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Quản lý Năm học & Học kỳ</h2>
          <p className="text-muted-foreground text-sm">
            Thiết lập danh mục năm học, khung thời gian và trạng thái các học kỳ đào tạo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>

          {isAdmin && (
            <>
              <Button size="sm" onClick={() => handleOpenAYModal()}>
                <Plus className="h-4 w-4 mr-1" />
                Thêm Năm học
              </Button>

              <Button size="sm" variant="secondary" onClick={() => handleOpenSemModal()}>
                <Plus className="h-4 w-4 mr-1" />
                Thêm Học kỳ
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Academic Years List */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {academicYears.map((ay) => {
          const aySemesters = semesters.filter((s) => {
            const id = typeof s.academicYearId === "object" ? s.academicYearId?._id : s.academicYearId;
            return id === ay._id;
          });

          return (
            <Card key={ay._id} className={ay.status === "active" ? "border-primary/50 shadow-sm" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold">{ay.name}</CardTitle>
                    {ay.status === "active" ? (
                      <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Đang hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Chưa kích hoạt
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs mt-1">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />
                    {new Date(ay.startDate).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(ay.endDate).toLocaleDateString("vi-VN")}
                  </CardDescription>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenAYModal(ay)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAY(ay)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Số lượng học kỳ: {aySemesters.length}</span>
                  {isAdmin && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => handleOpenSemModal(undefined, ay._id)}
                    >
                      + Thêm học kỳ
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {aySemesters.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-1">Chưa có học kỳ nào</p>
                  ) : (
                    aySemesters.map((sem) => (
                      <div
                        key={sem._id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/40 text-xs hover:bg-muted/70 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="font-medium">{sem.name}</span>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(sem.startDate).toLocaleDateString("vi-VN")} -{" "}
                            {new Date(sem.endDate).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {sem.status === "active" && (
                            <Badge variant="default" className="text-[10px] bg-emerald-600 px-1.5 py-0">
                              Active
                            </Badge>
                          )}
                          {sem.status === "upcoming" && (
                            <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 px-1.5 py-0">
                              Upcoming
                            </Badge>
                          )}
                          {sem.status === "closed" && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Closed
                            </Badge>
                          )}
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleOpenSemModal(sem)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteSem(sem)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Semesters Detailed Table */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Danh sách Chi tiết Học kỳ</CardTitle>
            <CardDescription className="text-xs">
              Xem và lọc các học kỳ theo năm học được chọn.
            </CardDescription>
          </div>

          <div className="w-64">
            <Select value={selectedAYId} onValueChange={setSelectedAYId}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Lọc theo Năm học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Năm học</SelectItem>
                {academicYears.map((ay) => (
                  <SelectItem key={ay._id} value={ay._id}>
                    {ay.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên Học kỳ</TableHead>
                <TableHead>Thuộc Năm học</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead>Trạng thái</TableHead>
                {isAdmin && <TableHead className="text-right">Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSemesters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-6 text-muted-foreground text-sm">
                    Chưa có học kỳ nào phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                filteredSemesters.map((sem) => {
                  const ayName =
                    typeof sem.academicYearId === "object"
                      ? sem.academicYearId?.name
                      : academicYears.find((a) => a._id === sem.academicYearId)?.name || "N/A";

                  return (
                    <TableRow key={sem._id}>
                      <TableCell className="font-medium">{sem.name}</TableCell>
                      <TableCell>{ayName}</TableCell>
                      <TableCell>{new Date(sem.startDate).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell>{new Date(sem.endDate).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell>
                        {sem.status === "active" && (
                          <Badge variant="default" className="bg-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Đang diễn ra
                          </Badge>
                        )}
                        {sem.status === "upcoming" && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            <Clock className="h-3 w-3 mr-1" /> Sắp diễn ra
                          </Badge>
                        )}
                        {sem.status === "closed" && (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" /> Đã đóng
                          </Badge>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenSemModal(sem)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteSem(sem)}
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

      {/* Dialog: Academic Year */}
      <Dialog open={isAYModalOpen} onOpenChange={setIsAYModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAY ? "Cập nhật Năm học" : "Tạo Năm học Mới"}</DialogTitle>
            <DialogDescription>
              Nhập thông tin tên và khoảng thời gian cho năm học.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAY} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ayName">Tên Năm học *</Label>
              <Input
                id="ayName"
                placeholder="Ví dụ: 2025-2026"
                value={ayName}
                onChange={(e) => setAyName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ayStartDate">Ngày bắt đầu *</Label>
                <Input
                  id="ayStartDate"
                  type="date"
                  value={ayStartDate}
                  onChange={(e) => setAyStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ayEndDate">Ngày kết thúc *</Label>
                <Input
                  id="ayEndDate"
                  type="date"
                  value={ayEndDate}
                  onChange={(e) => setAyEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ayStatus">Trạng thái</Label>
              <Select value={ayStatus} onValueChange={(val) => setAyStatus(val as AcademicYearStatus)}>
                <SelectTrigger id="ayStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Kích hoạt)</SelectItem>
                  <SelectItem value="inactive">Inactive (Tắt)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAYModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmittingAY}>
                {isSubmittingAY && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingAY ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Semester */}
      <Dialog open={isSemModalOpen} onOpenChange={setIsSemModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSem ? "Cập nhật Học kỳ" : "Tạo Học kỳ Mới"}</DialogTitle>
            <DialogDescription>
              Thời gian học kỳ phải nằm trong khoảng ngày của Năm học được chọn.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSem} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="semAY">Năm học *</Label>
              <Select value={semAYId} onValueChange={setSemAYId} required>
                <SelectTrigger id="semAY">
                  <SelectValue placeholder="Chọn Năm học" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((ay) => (
                    <SelectItem key={ay._id} value={ay._id}>
                      {ay.name} ({new Date(ay.startDate).getFullYear()} - {new Date(ay.endDate).getFullYear()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semName">Tên Học kỳ *</Label>
              <Input
                id="semName"
                placeholder="Ví dụ: Học kỳ 1, Học kỳ 2, Học kỳ hè"
                value={semName}
                onChange={(e) => setSemName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="semStartDate">Ngày bắt đầu *</Label>
                <Input
                  id="semStartDate"
                  type="date"
                  value={semStartDate}
                  onChange={(e) => setSemStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semEndDate">Ngày kết thúc *</Label>
                <Input
                  id="semEndDate"
                  type="date"
                  value={semEndDate}
                  onChange={(e) => setSemEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semStatus">Trạng thái Học kỳ</Label>
              <Select value={semStatus} onValueChange={(val) => setSemStatus(val as SemesterStatus)}>
                <SelectTrigger id="semStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming (Sắp diễn ra)</SelectItem>
                  <SelectItem value="active">Active (Đang mở)</SelectItem>
                  <SelectItem value="closed">Closed (Đã kết thúc)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSemModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmittingSem}>
                {isSubmittingSem && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingSem ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
