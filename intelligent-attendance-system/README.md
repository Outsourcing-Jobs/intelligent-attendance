# Base Auth System — NestJS + MongoDB + Firebase Auth + Cloudinary

Hệ thống Base Backend chuẩn doanh nghiệp được xây dựng trên nền tảng **NestJS**, kết nối cơ sở dữ liệu **MongoDB**, xác thực tài khoản qua **Firebase Auth (Admin SDK)** và lưu trữ media trên **Cloudinary**.

---

## 🌟 Tính Năng Nổi Bật

- 🔐 **Firebase Auth Integration**: Xác thực ID Token phía Backend bằng Firebase Admin SDK, tự động check Revocation Token và chặn tài khoản bị khóa (`banned`).
- 👥 **Dynamic Roles & Permissions**: Phân quyền người dùng động theo Role (`admin`, `teacher`, `student`) và Permisson dạng `module:action` lưu trong MongoDB. Hỗ trợ super permission `*` cho Admin.
- 📂 **Cloudinary Media Storage**: Tích hợp upload ảnh đơn (`uploadImage`) và upload ảnh hàng loạt (`uploadMultipleImages`) dạng stream. Thư mục gốc mặc định: `jobs-assets/` (tự động phân chia các subfolder như `jobs-assets/avatars`, `jobs-assets/general`,...).
- ⚙️ **Dynamic Configs**: Cấu hình hệ thống key-value động hỗ trợ tự động ép kiểu `string`, `number`, `boolean`, `json` mà không cần restart ứng dụng.
- 📌 **Hierarchical Menu Tree**: Tự động lọc và dựng cây danh mục Menu (Cha - Con) theo phân quyền của từng người dùng để vẽ Sidebar trên Frontend.
- 🚀 **Auto Seed Data**: Tự động khởi tạo dữ liệu mẫu (Default Roles, Configs, Menus) khi ứng dụng chạy lần đầu.
- 📘 **OpenAPI / Swagger Documentation**: Tích hợp tài liệu thử nghiệm API trực quan tại `/api/docs`.

---

## 🛠️ Kiến Trúc Xác Thực (Authentication Flow)

```
Client (Web / Mobile App)
   │
   │ 1. Đăng nhập bằng Firebase Client SDK (Email/Password, Google, Facebook...)
   ▼
Firebase Auth Server ──► Trả về idToken
   │
   │ 2. Gọi API NestJS kèm Header: Authorization: Bearer <idToken>
   ▼
NestJS Backend
   │
   ├─► FirebaseAuthGuard: Verify idToken (Firebase Admin SDK với check Revocation)
   ├─► Đồng bộ/Tìm user trong MongoDB (users collection)
   │     └─► Nếu chưa có: Tự tạo user mới với Role mặc định ('student')
   ├─► Gắn req.user = { id, email, role, permissions, status... }
   └─► RolesGuard / PermissionsGuard: Kiểm tra quyền truy cập route
   ▼
Controller Xử Lý Nghiệp Vụ
```

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
src/
├── main.ts                           # File bootstrap chính (Global Pipes, CORS, Swagger setup)
├── app.module.ts                     # Module gốc kết nối toàn bộ hệ thống
├── config/                           # Cấu hình các dịch vụ hạ tầng (Global)
│   ├── database/
│   │   └── mongoose.config.ts        # Cấu hình Mongoose MongoDB
│   ├── firebase/
│   │   ├── firebase-admin.provider.ts# Provider khởi tạo Firebase Admin SDK
│   │   └── firebase.module.ts        # Global Firebase Module
│   └── cloudinary/
│       ├── cloudinary.provider.ts    # Cloudinary v2 Provider
│       ├── cloudinary.service.ts     # Service upload/delete ảnh (Root: jobs-assets/)
│       └── cloudinary.module.ts      # Global Cloudinary Module
├── common/                           # Dùng chung cho toàn ứng dụng
│   ├── decorators/                   # Custom Decorators (@CurrentUser, @Roles, @RequirePermissions)
│   └── guards/                       # Guards xác thực (FirebaseAuthGuard, RolesGuard, PermissionsGuard)
├── modules/                          # Các module chức năng nghiệp vụ
│   ├── auth/                         # API xác thực /auth/sync, /auth/me, /auth/logout
│   ├── user/                         # Quản lý người dùng (Admin & Self profile + Avatar)
│   ├── role/                         # Quản lý vai trò & quyền hạn (Roles & Permissions)
│   ├── config/                       # Quản lý cấu hình hệ thống & cây Menu Sidebar
│   └── media/                        # API upload ảnh độc lập lên Cloudinary (Single & Multiple)
└── seed/                             # Tự động seed dữ liệu ban đầu
    ├── seed.service.ts
    └── seed.module.ts
```

---

## 🚀 Hướng Dẫn Thiết Lập & Khởi Chạy

### 1. Cài đặt Phụ thuộc (Dependencies)
```bash
npm install
```

### 2. Cấu hình Môi trường (`.env`)
Tạo file `.env` từ mẫu [.env.example](file:///.env.example):

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/base_auth_db

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Khởi chạy Ứng dụng
```bash
# Chế độ Development (Watch mode)
npm run start:dev

# Chế độ Production
npm run build
npm run start:prod
```

 Sau khi khởi chạy thành công, truy cập giao diện Swagger UI tại: **`http://localhost:3000/api/docs`**

---

## 📑 Danh Sách API (API Reference)

### 🔑 Auth Module (`/api/v1/auth`)
| Method | Endpoint | Guard | Mô tả |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Đăng ký tài khoản mới bằng Email/Password qua Backend (Firebase tự mã hóa mật khẩu, tự sync Mongo role `student` và sinh Email Verification Link) |
| `POST` | `/auth/login` | Public | Đăng nhập bằng Email/Password qua Backend, trả về `idToken`, `refreshToken`, profile User & cây Menu |
| `POST` | `/auth/forgot-password` | Public | Yêu cầu khôi phục mật khẩu, Backend sinh Link Reset Password an toàn từ Firebase Admin SDK |
| `POST` | `/auth/reset-password` | Public | Đặt lại mật khẩu mới dùng mã `oobCode` lấy từ URL email gửi về |
| `POST` | `/auth/sync` | `FirebaseAuthGuard` | Đồng bộ Firebase User sang MongoDB sau khi login ở FE Client SDK |
| `GET` | `/auth/me` | `FirebaseAuthGuard` | Lấy lại thông tin phiên làm việc hiện tại khi reload trang (F5) |
| `POST` | `/auth/logout` | `FirebaseAuthGuard` | Đăng xuất & thu hồi Refresh Token của user trên Firebase |

### 👤 User Self Module (`/api/v1/users/me`)
| Method | Endpoint | Guard | Mô tả |
|---|---|---|---|
| `GET` | `/users/me` | `FirebaseAuthGuard` | Xem thông tin trang cá nhân của chính mình |
| `PATCH` | `/users/me` | `FirebaseAuthGuard` | Cập nhật họ tên (`fullName`), số điện thoại (`phone`) |
| `POST` | `/users/me/avatar` | `FirebaseAuthGuard` | Upload ảnh đại diện lên Cloudinary (`jobs-assets/avatars`), tự động xóa avatar cũ |

### 👑 Admin Users Module (`/api/v1/admin/users`)
| Method | Endpoint | Guard | Mô tả |
|---|---|---|---|
| `GET` | `/admin/users` | `RolesGuard('admin')` | Danh sách người dùng (Phân trang `?page=1&limit=10` & Tìm kiếm `?keyword=...`) |
| `GET` | `/admin/users/:id` | `RolesGuard('admin')` | Xem chi tiết người dùng theo MongoDB ObjectId |
| `POST` | `/admin/users` | `RolesGuard('admin')` | Admin tạo tài khoản mới (tự động đăng ký trên Firebase Auth + Mongo) |
| `PATCH` | `/admin/users/:id/role` | `RolesGuard('admin')` | Đổi Role của user & force revoke token |
| `PATCH` | `/admin/users/:id/ban` | `RolesGuard('admin')` | Khóa tài khoản (`status: banned`), disable trên Firebase & revoke token |
| `PATCH` | `/admin/users/:id/unban` | `RolesGuard('admin')` | Mở khóa tài khoản (`status: active`) |
| `DELETE` | `/admin/users/:id` | `RolesGuard('admin')` | Xóa hoàn toàn tài khoản khỏi Firebase Auth & MongoDB |

### 🛡️ Roles Module (`/api/v1/roles`)
| Method | Endpoint | Guard | Mô tả |
|---|---|---|---|
| `GET` | `/roles` | `RolesGuard('admin')` | Lấy danh sách tất cả các Role trong hệ thống |
| `GET` | `/roles/:id` | `RolesGuard('admin')` | Xem chi tiết 1 Role |
| `POST` | `/roles` | `RolesGuard('admin')` | Tạo Role mới kèm danh sách `permissions` |
| `PATCH` | `/roles/:id` | `RolesGuard('admin')` | Cập nhật tên / permissions của Role |
| `DELETE` | `/roles/:id` | `RolesGuard('admin')` | Xóa Role (chặn xóa nếu Role đang có user dùng) |

### ⚙️ Configs Module (`/api/v1/configs`)
| Method | Endpoint | Guard | Mô tả |
|---|---|---|---|
| `GET` | `/configs` | `FirebaseAuthGuard` | Lấy danh sách cấu hình (lọc theo nhóm `?group=system`) |
| `GET` | `/configs/:key` | `FirebaseAuthGuard` | Lấy 1 cấu hình theo key (tự động ép kiểu `string`, `number`, `boolean`, `json`) |
| `POST` | `/configs` | `RolesGuard('admin')` | Tạo mới hoặc cập nhật cấu hình hệ thống (Upsert) |

### 📌 Menus Module (`/api/v1/menus`)
| Method | Endpoint | Guard | Mô tả |
|---|---|---|---|
| `GET` | `/menus` | `FirebaseAuthGuard` | Lấy cây Menu Sidebar (đã tự động lọc theo quyền user) |
| `GET` | `/menus/all` | `RolesGuard('admin')` | Admin xem toàn bộ danh sách menu |
| `POST` | `/menus` | `RolesGuard('admin')` | Thêm menu / trang mới vào hệ thống |
| `PATCH` | `/menus/:id` | `RolesGuard('admin')` | Sửa thông tin / thứ tự / icon / url của Menu |
| `DELETE` | `/menus/:id` | `RolesGuard('admin')` | Xóa Menu |

### 🖼️ Media Module (`/api/v1/media`)
| Method | Endpoint | Guard | Mô tả |
|---|---|---|---|
| `POST` | `/media/upload/single` | `FirebaseAuthGuard` | Upload 1 tệp ảnh chung lên Cloudinary (`jobs-assets/general`), trả về `{ url, publicId }` |
| `POST` | `/media/upload/multiple` | `FirebaseAuthGuard` | Upload nhiều ảnh (tối đa 10 ảnh) lên Cloudinary (`jobs-assets/general`), trả về mảng `[{ url, publicId }]` |

---

## 📝 Seed Data Mặc Định (Chạy lần đầu)

Khi ứng dụng khởi chạy lần đầu, `SeedService` tự động khởi tạo dữ liệu ban đầu:

- **Roles**:
  - `admin`: Quản trị viên (Permissions: `['*']`)
  - `teacher`: Giáo viên (Permissions: `['attendance:view', 'leave:approve', 'schedule:view']`)
  - `student`: Học sinh/Sinh viên (Permissions: `['attendance:checkin', 'leave:create', 'schedule:view']`)
- **Configs**: `SYSTEM_NAME`, `WIFI_IP_RANGE`
- **Menus**: Quản lý người dùng (`/users`), Quản lý vai trò (`/roles`), Cấu hình hệ thống (`/configs`)

---

## 📜 License
Dự án được phát hành theo giấy phép MIT.
