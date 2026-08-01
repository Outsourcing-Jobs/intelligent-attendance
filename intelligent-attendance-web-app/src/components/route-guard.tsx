"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

// Map of routes that strictly require Admin role
const ADMIN_ONLY_ROUTES = ["/dashboard/users", "/dashboard/roles"];

// Map of routes accessible to Faculty & Admin
const FACULTY_ROUTES = ["/dashboard/analytics"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  const userRole = user?.roleCode || "student";

  // Check Admin only routes
  const isAdminRoute = ADMIN_ONLY_ROUTES.some((route) => pathname?.startsWith(route));
  if (isAdminRoute && userRole !== "admin") {
    return (
      <div className="flex h-[75vh] w-full items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-amber-500/30">
          <CardHeader className="space-y-2">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="size-8" />
            </div>
            <CardTitle className="font-extrabold text-xl">403 - Truy cập bị từ chối</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Trang <strong className="text-foreground">{pathname}</strong> chỉ dành riêng cho tài khoản Quản trị viên (Admin). Tài khoản hiện tại của bạn là <strong className="capitalize text-foreground">{user?.roleName || userRole}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng liên hệ Ban Quản trị Đào tạo để được hỗ trợ phân quyền.
          </CardContent>
          <CardFooter className="flex justify-center pt-2">
            <Link href="/dashboard/default">
              <Button className="bg-blue-600 font-semibold text-white hover:bg-blue-700">
                <ArrowLeft className="mr-2 size-4" />
                Về Bảng điều khiển
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
