"use client";

import { useEffect, useState } from "react";

import {
  Camera,
  CheckCircle2,
  Clock,
  Crown,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Save,
  School,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/utils";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth-store";
import type { UserProfile } from "@/types/auth.types";

export default function ProfilePage() {
  const { user: storeUser, setUser: setStoreUser } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(storeUser);
  const [fullName, setFullName] = useState(storeUser?.fullName || storeUser?.name || "");
  const [phone, setPhone] = useState(storeUser?.phone || "");

  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Fetch fresh profile from NestJS Backend GET /api/v1/users/me
  useEffect(() => {
    const fetchProfile = async () => {
      setIsFetching(true);
      try {
        const data = await userService.getSelfProfile();
        setProfile(data);
        setFullName(data.fullName || data.name || "");
        setPhone(data.phone || "");
        // Update Zustand store
        if (storeUser) {
          setStoreUser({ ...storeUser, ...data });
        }
      } catch (error: any) {
        console.error("Lỗi khi tải thông tin cá nhân:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []);

  // Update profile handler (PATCH /api/v1/users/me)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updated = await userService.updateSelfProfile({
        fullName,
        phone,
      });

      setProfile(updated);
      if (storeUser) {
        setStoreUser({ ...storeUser, ...updated });
      }

      toast.success("Cập nhật thông tin thành công!", {
        description: "Hồ sơ cá nhân của bạn đã được lưu vào hệ thống.",
      });
    } catch (error: any) {
      toast.error("Cập nhật thất bại", {
        description: error?.message || "Không thể cập nhật hồ sơ cá nhân.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Upload Avatar handler (POST /api/v1/users/me/avatar)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Tệp ảnh quá lớn", {
        description: "Kích thước ảnh avatar tối đa là 5MB.",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const updated = await userService.uploadAvatar(file);
      setProfile(updated);
      if (storeUser) {
        setStoreUser({ ...storeUser, ...updated });
      }

      toast.success("Đổi ảnh đại diện thành công!", {
        description: "Ảnh avatar mới đã được tải lên.",
      });
    } catch (error: any) {
      toast.error("Tải ảnh thất bại", {
        description: error?.message || "Không thể tải tệp ảnh lên server.",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const displayName = profile?.fullName || profile?.name || "Người dùng";
  const displayEmail = profile?.email || "Chưa cập nhật";
  const displayRole = profile?.roleName || profile?.roleCode || "Thành viên";
  const displayAvatar = profile?.avatarUrl || profile?.picture || profile?.avatar || "";

  const renderRoleBadge = () => {
    const role = profile?.roleCode;
    if (role === "admin") {
      return (
        <Badge className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/30 gap-1 px-3 py-1 font-semibold">
          <Crown className="size-3.5" />
          Quản trị viên (Admin)
        </Badge>
      );
    }
    if (role === "teacher") {
      return (
        <Badge className="bg-teal-500/15 text-teal-600 dark:text-teal-400 hover:bg-teal-500/25 border-teal-500/30 gap-1 px-3 py-1 font-semibold">
          <School className="size-3.5" />
          Giảng viên / Cán bộ
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-blue-500/30 gap-1 px-3 py-1 font-semibold">
        <GraduationCap className="size-3.5" />
        Sinh viên
      </Badge>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border bg-card p-6 text-card-foreground shadow-sm md:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 size-64 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        <div className="absolute bottom-0 left-1/3 -mb-10 size-48 rounded-full bg-blue-500/5 blur-2xl dark:bg-blue-500/10" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          {/* Avatar with Cloudinary Upload */}
          <div className="relative group">
            <Avatar className="size-24 border-2 border-border shadow-md">
              <AvatarImage src={displayAvatar || undefined} alt={displayName} />
              <AvatarFallback className="text-xl font-bold bg-muted text-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            <label
              htmlFor="avatar-upload-input"
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              {isUploadingAvatar ? (
                <Loader2 className="size-6 animate-spin text-white" />
              ) : (
                <Camera className="size-6 text-white" />
              )}
            </label>
            <input
              id="avatar-upload-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              disabled={isUploadingAvatar}
              className="hidden"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <h1 className="font-bold text-2xl tracking-tight text-foreground md:text-3xl">{displayName}</h1>
              {renderRoleBadge()}
            </div>
            <p className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm md:justify-start">
              <Mail className="size-4" />
              {displayEmail}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Nhấp vào ảnh đại diện để tải ảnh mới lên
            </p>
          </div>
        </div>
      </div>

      {/* Main Profile Info Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Stats Column */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="size-4 text-blue-600" />
              Trạng thái Tài khoản
            </CardTitle>
            <CardDescription className="text-xs">
              Thông tin phân quyền và xác thực hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground">Trạng thái:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                Đang hoạt động (Active)
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground">Vai trò:</span>
              <span className="font-semibold capitalize">{displayRole}</span>
            </div>

            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground">Xác thực Email:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Đã xác thực</span>
            </div>
          </CardContent>
        </Card>

        {/* Right Form Column */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="size-4 text-blue-600" />
              Cập nhật Thông tin Cá nhân
            </CardTitle>
            <CardDescription className="text-xs">
              Chỉnh sửa thông tin họ tên và số điện thoại liên hệ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-fullname" className="text-xs font-semibold">
                  Họ và tên
                </Label>
                <div className="relative">
                  <Input
                    id="profile-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên đầy đủ"
                    className="pl-9"
                    required
                  />
                  <User className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-email" className="text-xs font-semibold">
                  Địa chỉ Email (Cố định theo hệ thống)
                </Label>
                <div className="relative">
                  <Input
                    id="profile-email"
                    value={displayEmail}
                    disabled
                    className="pl-9 bg-muted/50 cursor-not-allowed"
                  />
                  <Mail className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-phone" className="text-xs font-semibold">
                  Số điện thoại
                </Label>
                <div className="relative">
                  <Input
                    id="profile-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0988xxxxxx"
                    className="pl-9"
                  />
                  <Phone className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isSaving} className="font-semibold bg-blue-600 hover:bg-blue-700">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
