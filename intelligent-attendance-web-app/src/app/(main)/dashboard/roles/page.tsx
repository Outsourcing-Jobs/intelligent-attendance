"use client";

import { useEffect, useState } from "react";

import {
  Ban,
  Check,
  CheckCircle2,
  Crown,
  Edit,
  GraduationCap,
  KeyRound,
  LayoutGrid,
  List,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  School,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Table as TableIcon,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { roleService } from "@/services/role.service";
import type { UserRole } from "@/types/auth.types";

const DEFAULT_PERMISSIONS = [
  { id: "users.read", label: "Xem danh sách Người dùng", group: "Người dùng" },
  { id: "users.manage", label: "Tạo, sửa & quản lý Người dùng", group: "Người dùng" },
  { id: "academic.read", label: "Xem Chương trình Đào tạo & Lớp học", group: "Đào tạo" },
  { id: "academic.manage", label: "Quản lý Lớp học, Môn học & Học kỳ", group: "Đào tạo" },
  { id: "attendance:view", label: "Tra cứu Lịch sử Điểm danh", group: "Điểm danh" },
  { id: "attendance:checkin", label: "Thực hiện Quét mặt / Điểm danh", group: "Điểm danh" },
  { id: "schedule:view", label: "Xem Thời khóa biểu / Lịch học", group: "Thời khóa biểu" },
  { id: "leave:create", label: "Tạo Đơn xin nghỉ học", group: "Nghỉ học" },
  { id: "leave:approve", label: "Duyệt Đơn xin nghỉ học", group: "Nghỉ học" },
  { id: "reports.export", label: "Xuất Báo cáo & Thống kê", group: "Báo cáo" },
  { id: "system.settings", label: "Quản trị & Cấu hình Hệ thống", group: "Hệ thống" },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [systemPermissions, setSystemPermissions] = useState<{ id: string; label: string; group?: string }[]>(DEFAULT_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  // Edit Modal State
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);

  // Fetch Roles & System Permissions (GET /api/v1/roles, GET /api/v1/roles/permissions)
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissions().catch(() => DEFAULT_PERMISSIONS),
      ]);
      setRoles(rolesData || []);
      if (permsData && permsData.length > 0) {
        setSystemPermissions(permsData);
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách vai trò", {
        description: error?.message || "Kiểm tra lại quyền Admin hoặc kết nối server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filtered roles by search keyword
  const filteredRoles = roles.filter((role) => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    return (
      role.name?.toLowerCase().includes(kw) ||
      role.code?.toLowerCase().includes(kw) ||
      role.description?.toLowerCase().includes(kw)
    );
  });

  // Handle Create Role (POST /api/v1/roles)
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) {
      toast.error("Vui lòng điền mã và tên vai trò.");
      return;
    }

    setIsCreating(true);
    try {
      await roleService.createRole({
        code: newCode.toLowerCase().trim(),
        name: newName.trim(),
        description: newDesc.trim(),
        permissions: newPermissions,
        isActive: true,
      });

      toast.success("Tạo vai trò mới thành công!");
      setIsCreateOpen(false);
      setNewCode("");
      setNewName("");
      setNewDesc("");
      setNewPermissions([]);
      fetchRoles();
    } catch (error: any) {
      toast.error("Tạo vai trò thất bại", {
        description: error?.message || "Mã vai trò có thể đã tồn tại.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (role: UserRole) => {
    setEditingRole(role);
    setEditName(role.name || "");
    setEditDesc(role.description || "");
    setEditPermissions(role.permissions || []);
    setEditIsActive(role.isActive !== false);
    setIsEditOpen(true);
  };

  // Handle Update Role (PATCH /api/v1/roles/:id)
  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole?._id) return;

    setIsUpdating(true);
    try {
      await roleService.updateRole(editingRole._id, {
        name: editName,
        description: editDesc,
        permissions: editPermissions,
        isActive: editIsActive,
      });

      toast.success("Cập nhật vai trò thành công!");
      setIsEditOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast.error("Cập nhật thất bại", {
        description: error?.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Role (DELETE /api/v1/roles/:id)
  const handleDeleteRole = async (role: UserRole) => {
    if (!role._id) return;
    if (!confirm(`Bạn có chắc muốn xóa vai trò "${role.name}" (${role.code})?`)) return;

    try {
      await roleService.deleteRole(role._id);
      toast.success(`Đã xóa vai trò ${role.name}!`);
      fetchRoles();
    } catch (error: any) {
      toast.error("Không thể xóa vai trò", {
        description: error?.message || "Vai trò đang được gán cho người dùng.",
      });
    }
  };

  // Toggle permission in array
  const togglePermission = (permId: string, currentList: string[], setList: (list: string[]) => void) => {
    if (currentList.includes(permId)) {
      setList(currentList.filter((p) => p !== permId));
    } else {
      setList([...currentList, permId]);
    }
  };

  const renderRoleIcon = (code?: string) => {
    if (code === "admin") return <Crown className="size-5 text-amber-500" />;
    if (code === "teacher") return <School className="size-5 text-teal-600 dark:text-teal-400" />;
    return <GraduationCap className="size-5 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-extrabold text-2xl tracking-tight text-foreground flex items-center gap-2">
            <Lock className="size-7 text-indigo-600" />
            Quản lý Vai trò & Phân quyền (Roles & Permissions)
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Thiết lập danh mục các vai trò và Ma trận phân quyền chi tiết cho hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchRoles} disabled={isLoading}>
            <RefreshCw className={`mr-1.5 size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 font-semibold text-white hover:bg-indigo-700">
                <Plus className="mr-1.5 size-4" />
                Thêm Vai trò mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-indigo-600" />
                  Khởi tạo Vai trò Mới
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Điền mã định danh và chọn các quyền hạn gán cho vai trò này.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateRole} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="create-code">Mã Vai trò (Code) (*)</Label>
                    <Input
                      id="create-code"
                      placeholder="vd: manager"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="create-name">Tên hiển thị (*)</Label>
                    <Input
                      id="create-name"
                      placeholder="vd: Quản lý Khoa"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-desc">Mô tả vai trò</Label>
                  <Textarea
                    id="create-desc"
                    placeholder="Mô tả chức năng nhiệm vụ của vai trò..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <Label className="text-xs font-semibold">Danh sách Quyền hạn (Permissions)</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border p-3 bg-muted/30">
                    {systemPermissions.map((perm) => {
                      const isChecked = newPermissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded-md"
                          onClick={() => togglePermission(perm.id, newPermissions, setNewPermissions)}
                        >
                          <Checkbox id={`perm-${perm.id}`} checked={isChecked} />
                          <Label htmlFor={`perm-${perm.id}`} className="text-xs cursor-pointer flex-1">
                            {perm.label}{" "}
                            <span className="font-mono text-[10px] text-muted-foreground">({perm.id})</span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isCreating} className="bg-indigo-600 text-white hover:bg-indigo-700">
                    {isCreating ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                    Lưu Vai trò
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Control Bar: Search & View Mode Switcher */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên vai trò, mã code..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs gap-1.5"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="size-3.5" />
              Lưới Thẻ (Grid Cards)
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs gap-1.5"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="size-3.5" />
              Danh sách Bảng (Table List)
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content View */}
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="mx-auto size-8 animate-spin mb-2 text-indigo-600" />
          Đang tải danh sách Vai trò & Phân quyền...
        </div>
      ) : filteredRoles.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Không tìm thấy vai trò nào phù hợp.
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID CARDS VIEW MODE */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => {
            const permCount = role.permissions?.length || 0;
            const isSystemRole = role.code === "admin" || role.code === "teacher" || role.code === "student";

            return (
              <Card key={role._id} className="relative flex flex-col justify-between overflow-hidden border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-10 place-items-center rounded-xl bg-muted border">
                        {renderRoleIcon(role.code)}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold flex items-center gap-1.5">
                          {role.name}
                        </CardTitle>
                        <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                          code: {role.code}
                        </span>
                      </div>
                    </div>

                    {role.isActive !== false ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs pt-2 line-clamp-2">
                    {role.description || "Chưa có mô tả cho vai trò này."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 text-xs pt-0 flex-1">
                  <div className="border-t pt-3">
                    <span className="font-semibold text-muted-foreground text-[11px] block mb-2">
                      Quyền được cấp ({permCount} quyền):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {permCount === 0 ? (
                        <span className="text-muted-foreground italic text-[11px]">Chưa gán quyền nào</span>
                      ) : (
                        role.permissions?.map((p) => (
                          <Badge key={p} variant="outline" className="text-[10px] font-mono font-normal">
                            {p}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Footer Card Actions */}
                <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5">
                  <span className="text-[10px] text-muted-foreground">
                    {isSystemRole ? "Hệ thống mặc định" : "Tự định nghĩa"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleOpenEdit(role)}
                    >
                      <Edit className="mr-1 size-3.5" />
                      Sửa quyền
                    </Button>

                    {!isSystemRole && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                        onClick={() => handleDeleteRole(role)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW MODE */
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Vai trò (Role)</th>
                  <th className="px-4 py-3.5">Mã Code</th>
                  <th className="px-4 py-3.5">Mô tả</th>
                  <th className="px-4 py-3.5">Quyền hạn (Permissions)</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRoles.map((role) => {
                  const permCount = role.permissions?.length || 0;
                  const isSystemRole = role.code === "admin" || role.code === "teacher" || role.code === "student";

                  return (
                    <tr key={role._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="grid size-8 place-items-center rounded-lg bg-muted border">
                            {renderRoleIcon(role.code)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm">{role.name}</div>
                            <span className="text-[10px] text-muted-foreground">
                              {isSystemRole ? "Hệ thống" : "Tùy chỉnh"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-mono text-xs font-semibold">
                          {role.code}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                        {role.description || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {permCount === 0 ? (
                            <span className="text-muted-foreground text-[11px] italic">Chưa gán</span>
                          ) : (
                            role.permissions?.slice(0, 3).map((p) => (
                              <Badge key={p} variant="secondary" className="text-[10px] font-mono">
                                {p}
                              </Badge>
                            ))
                          )}
                          {permCount > 3 && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              +{permCount - 3} nữa
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {role.isActive !== false ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleOpenEdit(role)}
                          >
                            <Edit className="mr-1 size-3.5" />
                            Sửa quyền
                          </Button>
                          {!isSystemRole && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                              onClick={() => handleDeleteRole(role)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Edit Role Dialog */}
      {editingRole && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="size-5 text-indigo-600" />
                Cập nhật Vai trò: {editingRole.name} ({editingRole.code})
              </DialogTitle>
              <DialogDescription className="text-xs">
                Chỉnh sửa tên, mô tả và ma trận phân quyền cho vai trò này.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateRole} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Tên hiển thị vai trò</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-desc">Mô tả vai trò</Label>
                <Textarea
                  id="edit-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold">Trạng thái Kích hoạt (Active)</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Tắt nếu không muốn gán vai trò này cho người dùng mới.
                  </p>
                </div>
                <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
              </div>

              <div className="space-y-2 pt-1">
                <Label className="text-xs font-semibold">Cấu hình Quyền hạn (Permissions)</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border p-3 bg-muted/30">
                  {systemPermissions.map((perm) => {
                    const isChecked = editPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded-md"
                        onClick={() => togglePermission(perm.id, editPermissions, setEditPermissions)}
                      >
                        <Checkbox id={`edit-perm-${perm.id}`} checked={isChecked} />
                        <Label htmlFor={`edit-perm-${perm.id}`} className="text-xs cursor-pointer flex-1">
                          {perm.label}{" "}
                          <span className="font-mono text-[10px] text-muted-foreground">({perm.id})</span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  {isUpdating ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
