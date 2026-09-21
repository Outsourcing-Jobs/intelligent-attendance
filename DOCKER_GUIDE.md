# 🐳 Hướng Dẫn Build & Chạy Hệ Thống Bằng Docker Local

Tài liệu này hướng dẫn chi tiết từng bước để build và khởi chạy toàn bộ cụm dịch vụ của **Intelligent Attendance System** (Hệ Thống Điểm Danh Thông Minh & Cảnh Báo Sớm Bằng AI) trên máy tính cá nhân bằng Docker & Docker Compose.

---

## 📋 Mục Lục
1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Cấu trúc cụm dịch vụ Docker](#2-cấu-trúc-cụm-dịch-vụ-docker)
3. [Bước 1: Chuẩn bị file cấu hình môi trường (.env)](#bước-1-chuẩn-bị-file-cấu-hình-môi-trường-env)
4. [Bước 2: Lệnh Build & Khởi động cụm dịch vụ](#bước-2-lệnh-build--khởi-động-cụm-dịch-vụ)
5. [Bước 3: Nạp dữ liệu mẫu (Database Seeder)](#bước-3-nạp-dữ-liệu-mẫu-database-seeder)
6. [Bước 4: Kiểm tra và sử dụng hệ thống](#bước-4-kiểm-tra-và-sử-dụng-hệ-thống)
7. [Các lệnh quản lý Docker thường dùng](#các-lệnh-quản-lý-docker-thường-dùng)
8. [Khắc phục sự cố thường gặp (Troubleshooting)](#khắc-phục-sự-cố-thường-gặp-troubleshooting)

---

## 1. Yêu cầu hệ thống
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
- **Docker Desktop** (cho Windows / macOS) hoặc **Docker Engine + Docker Compose** (cho Linux/WSL2).
- Khởi động Docker Desktop và đảm bảo trạng thái hiển thị **"Engine running"** (biểu tượng màu xanh).
- Bộ nhớ RAM khuyến nghị: Tối thiểu 4GB RAM trống (để build Next.js 16 và Python ML model).

---

## 2. Cấu trúc cụm dịch vụ Docker

Khi chạy `docker compose`, hệ thống sẽ tự động build và khởi tạo 3 dịch vụ trong cùng mạng nội bộ (`attendance-net`):

```
+-------------------------------------------------------------------------+
|                             attendance-net                              |
|                                                                         |
|   +--------------------------+       +------------------------------+   |
|   |  Frontend Web App        | ----> |  Backend API (NestJS)        |   |
|   |  (Next.js 16 Standalone) |       |  Port 3000                   |   |
|   |  Port 4000               |       +------------------------------+   |
|   +--------------------------+                      |                   |
|                                                     v                   |
|                                          +---------------------+        |
|                                          |  AI Service         |        |
|                                          |  (FastAPI Python)   |        |
|                                          |  Port 8000          |        |
|                                          +---------------------+        |
+-------------------------------------------------------------------------+
                                      |
                                      v
                        [ MongoDB Atlas Cloud Database ]
```

| Dịch vụ | Công nghệ | Cổng Host | Cổng Container | Chức năng |
|---|---|---|---|---|
| **`intelligent-attendance-web`** | Next.js 16, Tailwind, Lucide | `4000` | `4000` | Giao diện Dashboard Sinh viên, Giảng viên & Admin |
| **`intelligent-attendance-api`** | NestJS, Mongoose, Firebase Admin | `3000` | `3000` | Core Backend REST API, Điểm danh QR động, Quản lý đào tạo |
| **`intelligent-attendance-ai`** | FastAPI, Python 3.11, Scikit-Learn | `8000` | `8000` | Microservice AI trích xuất đặc trưng & dự báo rủi ro chuyên cần |

---

## Bước 1: Chuẩn bị file cấu hình môi trường (.env)

Hệ thống sử dụng các file `.env.prod` được thiết lập sẵn trong từng thư mục dịch vụ:

### 1. File `intelligent-attendance-ai/.env.prod`
```env
PORT=8000
AI_SERVICE_PORT=8000
MONGODB_URI=mongodb+srv://.../intelligent-attendance?retryWrites=true&w=majority&appName=MyJobs
DATABASE_NAME=base_auth_db
```

### 2. File `intelligent-attendance-system/.env.prod`
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://.../intelligent-attendance?appName=MyJobs
FIREBASE_PROJECT_ID=mygallery-2026-v1
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@mygallery-2026-v1.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_WEB_API_KEY=AIzaSy...
CLOUDINARY_CLOUD_NAME=dbzuqtojr
CLOUDINARY_API_KEY=278466846868427
CLOUDINARY_API_SECRET=lqKjEaJJByiDQ6lvR6LbwcAXtI0
AI_SERVICE_URL=http://intelligent-attendance-ai:8000
QR_HMAC_SECRET=attendance-system-dynamic-qr-secret-key-prod-2025
```

### 3. File `intelligent-attendance-web-app/.env.prod`
```env
PORT=4000
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mygallery-2026-v1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mygallery-2026-v1
```

---

## Bước 2: Lệnh Build & Khởi động cụm dịch vụ

### Cách 1: Sử dụng Script 1-Click (Khuyên Dùng Trên Windows)
Nhấp đúp chuột vào file:
👉 **`start-docker.bat`** (ở thư mục gốc của dự án).

Script sẽ tự động kiểm tra Docker Desktop, build các image và khởi chạy toàn bộ 3 dịch vụ ở chế độ chạy nền.

---

### Cách 2: Sử dụng dòng lệnh Terminal / PowerShell

Mở Terminal tại thư mục gốc `d:\Jobs\Intelligent Attendance System`:

```powershell
# 1. Build image và khởi động cụm dịch vụ (xem log trực tiếp)
docker compose up --build

# Hoặc 2. Khởi chạy ở chế độ nền (Detached mode)
docker compose up --build -d
```

> 💡 **Lưu ý trong lần build đầu tiên**: Docker sẽ tải base images (`node:20-alpine`, `python:3.11-slim`), cài đặt packages và compile Next.js standalone assets. Thời gian build khoảng 3 - 5 phút tùy tốc độ mạng và CPU.

---

## Bước 3: Nạp dữ liệu mẫu (Database Seeder)

Sau khi cụm container đã khởi chạy, nếu bạn muốn nạp dữ liệu người dùng, lớp học, môn học, phân công giảng dạy và điểm danh mẫu vào cơ sở dữ liệu:

```powershell
# Chạy demo seed trực tiếp trong container Backend
docker exec -it intelligent-attendance-api npm run seed:demo

# Hoặc nạp dữ liệu điểm danh giả lập 24h gần nhất
docker exec -it intelligent-attendance-api npm run seed:24h

# Hoặc nạp dữ liệu điểm danh 14 ngày cho mô hình học máy AI
docker exec -it intelligent-attendance-api npm run seed:14days
```

---

## Bước 4: Kiểm tra và sử dụng hệ thống

Khi tất cả container hiển thị trạng thái `healthy` hoặc `running`:

| Mục tiêu | Địa chỉ URL | Ghi chú |
|---|---|---|
| **Frontend Web Dashboard** | [http://localhost:4000](http://localhost:4000) | Giao diện chính hệ thống |
| **Backend API Health** | [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) | Trạng thái API Backend |
| **Backend Swagger Docs** | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) | Tài liệu kiểm thử API trực tuyến |
| **AI Service Health** | [http://localhost:8000](http://localhost:8000) | Trạng thái AI Service |
| **AI Service Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger FastAPI AI Service |

### Tài khoản đăng nhập mẫu:
- **Admin**: `admin@school.edu.vn` / `Password123@`
- **Giảng viên**: `teacher01@school.edu.vn` / `Password123@`
- **Sinh viên**: `student01@school.edu.vn` / `Password123@`

---

## Các lệnh quản lý Docker thường dùng

### 1. Xem trạng thái các container
```powershell
docker compose ps
```

### 2. Xem log theo thời gian thực (Real-time logs)
```powershell
# Xem log toàn bộ hệ thống
docker compose logs -f

# Xem log riêng từng dịch vụ
docker compose logs -f intelligent-attendance-api
docker compose logs -f intelligent-attendance-web
docker compose logs -f intelligent-attendance-ai
```

### 3. Dừng hệ thống
```powershell
# Chạy file stop-docker.bat hoặc lệnh:
docker compose down
```

### 4. Khởi động lại khi có thay đổi code
```powershell
docker compose up --build -d
```

### 5. Dọn dẹp cache Docker khi gặp lỗi build
```powershell
docker compose down --volumes --remove-orphans
docker builder prune -f
```

---

## Khắc phục sự cố thường gặp (Troubleshooting)

### 1. Lỗi "Ports are already allocated" (Cổng 3000, 4000 hoặc 8000 đang bận)
- **Nguyên nhân**: Bạn đang có tiến trình local chạy sẵn (`npm run dev`, `npm run start:dev` hoặc `uvicorn`).
- **Khắc phục**:
  1. Tắt các cửa sổ Terminal đang chạy `dev server`.
  2. Hoặc tìm và giải phóng cổng trên Windows:
     ```powershell
     netstat -ano | findstr :3000
     taskkill /PID <PID_NUMBER> /F
     ```

### 2. Lỗi "Docker Desktop is not running"
- Mở Docker Desktop từ Start Menu và đợi đến khi biểu tượng góc dưới hiển thị màu xanh lá cây ("Engine running").

### 3. Lỗi "MongoServerSelectionError" hoặc kết nối MongoDB Atlas timeout
- **Nguyên nhân**: Địa chỉ IP mạng hiện tại của bạn chưa được cấp phép (Whitelist) trên MongoDB Atlas.
- **Khắc phục**:
  - Truy cập [MongoDB Atlas Console](https://cloud.mongodb.com/) -> **Network Access** -> Thêm `0.0.0.0/0` (Allow Access from Anywhere) hoặc IP hiện tại.

### 4. Lỗi Next.js build: "Standalone folder not found"
- Kiểm tra file `intelligent-attendance-web-app/next.config.mjs` đã có cấu hình `output: "standalone"` hay chưa. Hiện tại cấu hình này đã được kích hoạt sẵn.
