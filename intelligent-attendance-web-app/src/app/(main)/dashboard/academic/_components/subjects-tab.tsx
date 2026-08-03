"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Edit,
  GitCommit,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
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
import { Textarea } from "@/components/ui/textarea";

import { subjectService } from "@/services/academic.service";
import { useAuthStore } from "@/stores/auth-store";
import type { Subject } from "@/types/academic.types";

export function SubjectsTab() {
  const user = useAuthStore((state) => state.user);
  const roleCode =
    user?.roleCode ||
    (typeof user?.role === "object" ? user?.role?.code : typeof user?.roleId === "object" ? (user?.roleId as any)?.code : "");
  const isAdmin = roleCode === "admin";
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [credits, setCredits] = useState<number>(3);
  const [prereqId, setPrereqId] = useState<string>("none");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách môn học", {
        description: error?.message || "Kiểm tra kết nối server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setCode(subject.code);
      setName(subject.name);
      setCredits(subject.credits);
      const pId = typeof subject.prerequisiteSubjectId === "object"
        ? subject.prerequisiteSubjectId?._id
        : subject.prerequisiteSubjectId;
      setPrereqId(pId || "none");
      setDescription(subject.description || "");
    } else {
      setEditingSubject(null);
      setCode("");
      setName("");
      setCredits(3);
      setPrereqId("none");
      setDescription("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        code: code.trim(),
        name: name.trim(),
        credits: Number(credits),
        prerequisiteSubjectId: prereqId === "none" ? null : prereqId,
        description: description.trim() || undefined,
      };

      if (editingSubject) {
        await subjectService.updateSubject(editingSubject._id, payload);
        toast.success("Cập nhật môn học thành công!");
      } else {
        await subjectService.createSubject(payload);
        toast.success("Tạo môn học mới thành công!");
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (error: any) {
      toast.error("Không thể lưu môn học", {
        description: error?.message || "Mã môn học có thể đã bị trùng hoặc vi phạm vòng lặp tiên quyết.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa môn học "${subject.name}" (${subject.code})?`)) return;

    try {
      await subjectService.deleteSubject(subject._id);
      toast.success("Xóa môn học thành công!");
      fetchSubjects();
    } catch (error: any) {
      toast.error("Không thể xóa môn học", {
        description: error?.message || "Có thể môn học đang được sử dụng trong chương trình hoặc lớp học phần.",
      });
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      s.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Danh mục Môn học</h2>
          <p className="text-muted-foreground text-sm">
            Quản lý mã môn học, số tín chỉ, mô tả và điều kiện môn học tiên quyết.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubjects} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm Môn học
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
                placeholder="Tìm mã hoặc tên môn học..."
                className="pl-8"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Tổng số môn học: <span className="font-semibold text-foreground">{filteredSubjects.length}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Mã Môn</TableHead>
                <TableHead>Tên Môn học</TableHead>
                <TableHead className="w-[100px] text-center">Số Tín chỉ</TableHead>
                <TableHead>Môn Tiên quyết</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy môn học nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((s) => {
                  const prereqObj = typeof s.prerequisiteSubjectId === "object" ? s.prerequisiteSubjectId : null;
                  const prereqName = prereqObj
                    ? `${prereqObj.code} - ${prereqObj.name}`
                    : s.prerequisiteSubjectId
                    ? subjects.find((sub) => sub._id === s.prerequisiteSubjectId)?.name || "Có trỏ mã"
                    : null;

                  return (
                    <TableRow key={s._id}>
                      <TableCell className="font-mono font-bold text-primary">{s.code}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>{s.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{s.credits} TC</Badge>
                      </TableCell>
                      <TableCell>
                        {prereqName ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                            <GitCommit className="h-3 w-3" />
                            {prereqName}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Không có</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {s.description || "—"}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(s)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(s)}
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

      {/* Create / Edit Subject Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Cập nhật Môn học" : "Tạo Môn học Mới"}</DialogTitle>
            <DialogDescription>
              Nhập mã môn học, tên môn, số tín chỉ và thông tin môn học tiên quyết.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="code">Mã Môn *</Label>
                <Input
                  id="code"
                  placeholder="Ví dụ: CS101"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Số Tín chỉ *</Label>
                <Input
                  id="credits"
                  type="number"
                  min={1}
                  max={10}
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên Môn học *</Label>
              <Input
                id="name"
                placeholder="Ví dụ: Nhập môn Lập trình"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prereq">Môn Tiên quyết (Nếu có)</Label>
              <Select value={prereqId} onValueChange={setPrereqId}>
                <SelectTrigger id="prereq">
                  <SelectValue placeholder="Chọn môn tiên quyết" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Không có môn tiên quyết --</SelectItem>
                  {subjects
                    .filter((s) => !editingSubject || s._id !== editingSubject._id)
                    .map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.code} - {s.name} ({s.credits} TC)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả Môn học</Label>
              <Textarea
                id="description"
                placeholder="Mô tả nội dung, mục tiêu của môn học..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingSubject ? "Lưu thay đổi" : "Tạo Môn học"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
