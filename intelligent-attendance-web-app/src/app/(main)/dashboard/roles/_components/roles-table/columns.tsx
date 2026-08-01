"use client";
"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Role } from "./data";

export const rolesColumns: ColumnDef<Role>[] = [
  {
    id: "group",
    accessorKey: "group",
    filterFn: "equalsString",
    enableHiding: true,
  },
  {
    id: "search",
    accessorFn: (row) => [row.role, row.owner, ...row.permissionSets].join(" "),
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Vai trò",
    size: 180,
    minSize: 180,
    cell: ({ row }) => <span className="font-medium text-sm">{row.original.role}</span>,
  },
  {
    id: "accessLevel",
    accessorKey: "accessLevel",
    header: "Cấp độ truy cập",
    size: 120,
    cell: ({ row }) => (
      <Badge className="rounded-sm" variant="outline">
        {row.original.accessLevel}
      </Badge>
    ),
  },
  {
    id: "users",
    accessorKey: "users",
    header: "Người dùng",
    size: 70,
    cell: ({ row }) => <span className="text-sm">{row.original.users}</span>,
  },
  {
    id: "permissionSets",
    accessorFn: (row) => row.permissionSets.join(" "),
    header: "Tập hợp quyền",
    size: 310,
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center justify-start gap-2">
        {row.original.permissionSets.slice(0, 3).map((set) => (
          <Badge className="rounded-sm" variant="outline" key={set}>
            {set}
          </Badge>
        ))}
        {row.original.permissionSets.length > 3 ? (
          <span className="text-sm tabular-nums">+{row.original.permissionSets.length - 3}</span>
        ) : null}
      </div>
    ),
  },
  {
    id: "lastReview",
    accessorKey: "lastReview",
    header: "Đánh giá gần nhất",
    size: 120,
    cell: ({ row }) => <span className="text-sm">{row.original.lastReview}</span>,
  },
  {
    id: "owner",
    accessorKey: "owner",
    header: "Chủ sở hữu",
    size: 110,
    filterFn: "equalsString",
    cell: ({ row }) => <span className="text-sm">{row.original.owner}</span>,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Trạng thái",
    size: 130,
    filterFn: "equalsString",
    cell: ({ row }) => (
      <Badge className="rounded-sm" variant="outline">
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    size: 70,
    cell: ({ row }) => {
      const isSystemRole = row.original.group === "System roles";
      const needsReview = row.original.status === "Needs review";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuGroup>
              {needsReview ? <DropdownMenuItem>Duyệt thay đổi</DropdownMenuItem> : null}
              <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
              <DropdownMenuItem disabled={isSystemRole}>Sửa vai trò</DropdownMenuItem>
              <DropdownMenuItem disabled={isSystemRole}>Nhân bản vai trò</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Duyệt quyền hạn</DropdownMenuItem>
              <DropdownMenuItem>Quản lý thành viên</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled={isSystemRole} variant="destructive">
                Lưu trữ vai trò
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableColumnFilter: false,
  },
];
