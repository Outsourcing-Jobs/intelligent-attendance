"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BadgeCheck, Bell, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function AccountSwitcher({
  users: defaultUsers,
}: {
  readonly users: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar: string;
    readonly role: string;
  }>;
}) {
  const router = useRouter();
  const { user: storeUser, logout } = useAuthStore();
  const [activeMockUser] = useState(defaultUsers[0]);

  const currentUser = storeUser
    ? {
        id: storeUser._id || storeUser.id || "current",
        name: storeUser.fullName || storeUser.name || "Người dùng",
        email: storeUser.email,
        avatar: storeUser.avatarUrl || storeUser.picture || storeUser.avatar || "",
        role: storeUser.roleName || storeUser.roleCode || "User",
      }
    : activeMockUser;

  const handleLogout = async () => {
    await logout();
    router.push("/auth/v1/login");
  };

  if (!currentUser) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer rounded-lg">
          <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
          <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <div className="flex w-full items-center gap-2.5 p-2">
          <Avatar className="size-9 rounded-lg">
            <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
            <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{currentUser.name}</span>
            <span className="truncate text-muted-foreground text-xs">{currentUser.email}</span>
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck className="size-4" />
            Tài khoản ({currentUser.role})
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="size-4" />
            Thông báo
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400">
          <LogOut className="size-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
