import {
  Banknote,
  Calendar,
  ChartBar,
  CheckSquare,
  CircleUser,
  Fingerprint,
  Forklift,
  Gauge,
  GraduationCap,
  Kanban,
  Laptop,
  LayoutDashboard,
  ListTodo,
  Lock,
  type LucideIcon,
  Mail,
  MessageSquare,
  ReceiptText,
  Server,
  ShoppingBag,
  SquareArrowUpRight,
  UserCheck,
  Users,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Tổng quan",
    items: [
      {
        id: "default",
        title: "Bảng điều khiển",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        id: "attendance",
        title: "Điểm danh",
        url: "/dashboard/attendance",
        icon: UserCheck,
      },
      {
        id: "calendar",
        title: "Lịch học & Giảng dạy",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        id: "analytics",
        title: "Thống kê",
        url: "/dashboard/analytics",
        icon: Gauge,
      },
    ],
  },
  {
    id: 2,
    label: "Quản lý",
    items: [
      {
        id: "profile",
        title: "Trang cá nhân",
        url: "/dashboard/profile",
        icon: CircleUser,
      },
      {
        id: "users",
        title: "Người dùng",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        id: "academic",
        title: "Quản lý Đào tạo",
        url: "/dashboard/academic",
        icon: GraduationCap,
      },
      {
        id: "roles",
        title: "Phân quyền",
        url: "/dashboard/roles",
        icon: Lock,
      },
      {
        id: "devices",
        title: "Quản lý Thiết bị",
        url: "/dashboard/devices",
        icon: Laptop,
      },
    ],
  },
  {
    id: 3,
    label: "Ứng dụng",
    items: [
      {
        id: "email",
        title: "Hộp thư",
        url: "/dashboard/mail",
        icon: Mail,
      },
      {
        id: "chat",
        title: "Trò chuyện",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
    ],
  },
];
