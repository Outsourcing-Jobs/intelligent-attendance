# Hệ thống Cổng Thông tin Đào tạo & Bảng Quản trị Trường học

Hệ thống ứng dụng web quản lý đào tạo đại học, cổng thông tin Sinh viên & Giảng viên được phát triển trên nền tảng **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4** và **shadcn/ui**.

---

## 🌟 Các Cổng Chức năng & Giao diện

### 1. 🎓 Cổng Thông tin Sinh viên (Student Portal - Mẫu V1)
- **Đường dẫn Đăng nhập:** `http://localhost:3000/auth/v1/login`
- **Đường dẫn Kích hoạt:** `http://localhost:3000/auth/v1/register`
- **Tính năng:** Tra cứu thời khóa biểu, lịch thi, bảng điểm tích lũy, điểm rèn luyện và đăng ký tín chỉ trực tuyến.

### 2. 👨‍🏫 Cổng Giảng viên & Cán bộ Đào tạo (Faculty Portal - Mẫu V2)
- **Đường dẫn Đăng nhập:** `http://localhost:3000/auth/v2/login`
- **Đường dẫn Đăng ký:** `http://localhost:3000/auth/v2/register`
- **Tính năng:** Quản lý danh sách lớp học phần, điểm danh, nhập điểm thi thành phần, khóa sổ điểm và xác thực chữ ký số.

### 3. 📊 Bảng Điều Hành Quản trị (Admin Dashboard)
- **Đường dẫn:** `http://localhost:3000/dashboard/default`
- **Tính năng:** Thống kê báo cáo đào tạo, quản lý người dùng, phân quyền vai trò, cài đặt giao diện.

---

## 🏗️ Kiến trúc API & Công nghệ (Tech Stack)

### Công nghệ Sử dụng
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling & UI:** Tailwind CSS v4, shadcn/ui, Lucide Icons
- **State Management:** Zustand v5 (Store tập trung siêu nhẹ)
- **Form & Validation:** React Hook Form, Zod Validation
- **Table & Data:** TanStack Table v8
- **Tooling:** Biome, Husky

### Kiến trúc API Phân lớp chuẩn Doanh nghiệp (Enterprise Layered Architecture)
Dự án được tổ chức theo chuẩn kiến trúc phân lớp sạch:
- **`src/types/`**: Định nghĩa DTO & Kiểu dữ liệu TypeScript (`auth.types.ts`).
- **`src/lib/api-client.ts`**: Base HTTP Client bọc `fetch`, tự động đính kèm Token và xử lý lỗi 401.
- **`src/services/`**: Tầng đóng gói API theo nghiệp vụ (`auth.service.ts`, `student.service.ts`...).
- **`src/stores/`**: Quản lý State tập trung toàn dự án bằng Zustand (`auth-store.ts`).

---

## 🚀 Hướng dẫn Khởi chạy Dự án

### 1. Khởi chạy ở môi trường Local

1. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

2. **Chạy máy chủ phát triển (Dev Server):**
   ```bash
   npm run dev
   ```

3. Truy cập trình duyệt tại đường dẫn: [http://localhost:3000](http://localhost:3000)

---

### 2. Cấu hình Kết nối Backend API

Để kết nối với máy chủ API Backend của bạn (NestJS, Spring Boot, Laravel, Go...), tạo file `.env.local` tại thư mục gốc:

```env
NEXT_PUBLIC_API_URL=https://api.truonghoc.edu.vn/v1
```

---

## 🛠️ Kiểm tra & Format Code

Sử dụng Biome để format và kiểm tra lỗi toàn bộ dự án:
```bash
npm run check
```

---

**Bản quyền © 2026 TRƯỜNG ĐẠI HỌC. All rights reserved.**
