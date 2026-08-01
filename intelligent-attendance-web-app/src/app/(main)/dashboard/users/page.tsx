"use client";

import { useEffect, useState } from "react";

import {
  Ban,
  CheckCircle2,
  Crown,
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogTrigger,
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

import { getInitials } from "@/lib/utils";
import { userService } from "@/services/user.service";
import type { UserProfile } from "@/types/auth.types";

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State for Create User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("student");

  // Fetch Users List (GET /api/v1/admin/users)
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers({ page, limit: 10, keyword });
      setUsers(data.items || []);
      setTotalUsers(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      toast.error("Không thể tải danh sách người dùng", {
        description: error?.message || "Kiểm tra lại quyền Admin hoặc kết nối mạng.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, keyword]);

  // Create User Handler (POST /api/v1/admin/users)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await userService.createUser({
        email: newEmail,
        password: newPassword || "Password123!",
        fullName: newFullName,
        phone: newPhone,
        roleCode: newRoleCode,
      });

      toast.success("Tạo người dùng mới thành công!", {
        description: `Tài khoản ${newEmail} đã được lưu vào Firebase & MongoDB.`,
      });

      setIsModalOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewFullName("");
      setNewPhone("");
      setNewRoleCode("student");

      fetchUsers();
    } catch (error: any) {
      toast.error("Tạo thất bại", {
        description: error?.message || "Không thể tạo tài khoản mới.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Change Role Handler (PATCH /api/v1/admin/users/:id/role)
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userService.updateUserRole(userId, newRole);
      toast.success("Cập nhật quyền thành công!");
      fetchUsers();
    } catch (error: any) {
      toast.error("Không thể đổi vai trò", {
        description: error?.message || "Cập nhật thất bại.",
      });
    }
  };

  // Ban / Unban Handler (PATCH /api/v1/admin/users/:id/ban or unban)
  const handleToggleBan = async (userItem: UserProfile) => {
    const userId = userItem._id || userItem.id;
    if (!userId) return;

    const isBanned = userItem.status === "banned";
    try {
      if (isBanned) {
        await userService.unbanUser(userId);
        toast.success(`Đã mở khóa tài khoản ${userItem.email}!`);
      } else {
        await userService.banUser(userId);
        toast.warning(`Đã khóa tài khoản ${userItem.email}!`);
      }
      fetchUsers();
    } catch (error: any) {
      toast.error("Thao tác thất bại", {
        description: error?.message,
      });
    }
  };

  // Delete User Handler (DELETE /api/v1/admin/users/:id)
  const handleDeleteUser = async (userId?: string, email?: string) => {
    if (!userId) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản ${email}?`)) return;

    try {
      await userService.deleteUser(userId);
      toast.success(`Đã xóa tài khoản ${email} thành công!`);
      fetchUsers();
    } catch (error: any) {
      toast.error("Không thể xóa tài khoản", {
        description: error?.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-extrabold text-2xl tracking-tight text-foreground flex items-center gap-2">
            <UsersIcon className="size-7 text-blue-600" />
            Quản lý Người dùng & Phân quyền
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Danh sách tất cả tài khoản trong hệ thống ({totalUsers} tài khoản)
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 font-semibold text-white hover:bg-blue-700">
              <UserPlus className="mr-2 size-4" />
              Tạo tài khoản mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="size-5 text-blue-600" />
                Khởi tạo Người dùng Mới
              </DialogTitle>
              <DialogDescription className="text-xs">
                Tài khoản mới sẽ tự động được tạo trên Firebase Auth & MongoDB.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="create-email">Địa chỉ Email (*)</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="user@school.edu.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-password">Mật khẩu (*)</Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Password123!"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-fullname">Họ và tên</Label>
                <Input
                  id="create-fullname"
                  placeholder="Nguyễn Văn A"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-phone">Số điện thoại</Label>
                <Input
                  id="create-phone"
                  placeholder="0988xxxxxx"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Vai trò / Phân quyền (*)</Label>
                <Select value={newRoleCode} onValueChange={setNewRoleCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">🎓 Sinh viên (student)</SelectItem>
                    <SelectItem value="teacher">👨‍🏫 Giảng viên (teacher)</SelectItem>
                    <SelectItem value="admin">👑 Quản trị viên (admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating} className="bg-blue-600 text-white hover:bg-blue-700">
                  {isCreating ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Tạo tài khoản
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo email, tên, sđt..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={fetchUsers} disabled={isLoading}>
            <RefreshCw className={`mr-2 size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Users Data Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Người dùng</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Số điện thoại</th>
                <th className="px-4 py-3.5">Vai trò (Role)</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto size-6 animate-spin mb-2" />
                    Đang tải dữ liệu người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const itemId = item._id || item.id || "";
                  const itemName = item.fullName || item.name || "N/A";
                  const itemAvatar = item.avatarUrl || item.picture || item.avatar || "";
                  const isBanned = item.status === "banned";

                  return (
                    <tr key={itemId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 rounded-lg">
                            <AvatarImage src={itemAvatar || undefined} alt={itemName} />
                            <AvatarFallback>{getInitials(itemName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground text-sm">{itemName}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              UID: {item.firebaseUid?.slice(0, 12)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium">{item.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.phone || "—"}</td>

                      <td className="px-4 py-3">
                        <Select
                          value={item.roleCode || "student"}
                          onValueChange={(val) => handleRoleChange(itemId, val)}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">🎓 Student</SelectItem>
                            <SelectItem value="teacher">👨‍🏫 Teacher</SelectItem>
                            <SelectItem value="admin">👑 Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="px-4 py-3">
                        {isBanned ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="size-3" />
                            Banned (Đã khóa)
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
                            <CheckCircle2 className="size-3" />
                            Active
                          </Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant={isBanned ? "outline" : "secondary"}
                            size="sm"
                            className="h-8 text-[11px]"
                            onClick={() => handleToggleBan(item)}
                          >
                            {isBanned ? "Mở khóa" : "Khóa"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                            onClick={() => handleDeleteUser(itemId, item.email)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          Trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Tổng {totalUsers} bản ghi)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trang trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </Button>
        </div>
      </div>
    </div>
  );
}
