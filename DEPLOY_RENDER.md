# 🚀 Hướng Dẫn Deploy Hệ Thống Intelligent Attendance

Kiến trúc triển khai tối ưu:
1. **Render**:
   - **`intelligent-attendance-api`** (NestJS Backend API + Socket.io)
   - **`intelligent-attendance-ai`** (Python FastAPI Machine Learning Service)
2. **Vercel**:
   - **`intelligent-attendance-web`** (Next.js 16 Frontend Web Application)

---

## 📁 Danh Sách File Cấu Hình

| Dịch Vụ | Nền Tảng | Dockerfile / Config | File ENV Production |
| :--- | :--- | :--- | :--- |
| **NestJS Backend** | Render | [`intelligent-attendance-system/Dockerfile`](file:///d:/Jobs/Intelligent%20Attendance%20System/intelligent-attendance-system/Dockerfile) | [`intelligent-attendance-system/.env.prod`](file:///d:/Jobs/Intelligent%20Attendance%20System/intelligent-attendance-system/.env.prod) |
| **Python AI Service** | Render | [`intelligent-attendance-ai/Dockerfile`](file:///d:/Jobs/Intelligent%20Attendance%20System/intelligent-attendance-ai/Dockerfile) | [`intelligent-attendance-ai/.env.prod`](file:///d:/Jobs/Intelligent%20Attendance%20System/intelligent-attendance-ai/.env.prod) |
| **Next.js Web App** | Vercel (hoặc Render) | [`intelligent-attendance-web-app/Dockerfile`](file:///d:/Jobs/Intelligent%20Attendance%20System/intelligent-attendance-web-app/Dockerfile) | [`intelligent-attendance-web-app/.env.prod`](file:///d:/Jobs/Intelligent%20Attendance%20System/intelligent-attendance-web-app/.env.prod) |
| **Render Blueprint** | Render | [`render.yaml`](file:///d:/Jobs/Intelligent%20Attendance%20System/render.yaml) | Blueprint chỉ deploy 2 service Backend & AI |
| **Docker Compose** | Máy Local | [`docker-compose.yml`](file:///d:/Jobs/Intelligent%20Attendance%20System/docker-compose.yml) | Chạy thử toàn bộ 3 dịch vụ trên máy cá nhân |

---

## 🛠 Cách 1: Triển Khai Nhanh Bằng Render Blueprint (Khuyên Dùng)

File [`render.yaml`](file:///d:/Jobs/Intelligent%20Attendance%20System/render.yaml) đã được cấu hình sẵn cho toàn bộ hệ thống:

1. Đẩy code của repository lên **GitHub / GitLab**.
2. Đăng nhập vào [Render Dashboard](https://dashboard.render.com).
3. Nhấp chọn **New +** -> Chọn **Blueprint**.
4. Chọn repository của bạn -> Render sẽ tự động đọc file `render.yaml` và tạo 2 service (**Backend API** và **AI Service**).
5. Điền các giá trị Secret Environment Variables (từ các file `.env.prod` tương ứng) khi Render nhắc.
6. Nhấp **Apply** để Render tự động build và deploy 2 service.
7. Triển khai Frontend lên Vercel theo hướng dẫn bên dưới.

---

## 🔧 Cách 2: Triển Khai Thủ Công Từng Web Service Trên Render

Nếu bạn muốn tạo từng Web Service riêng lẻ trên Dashboard của Render:

### 1. Deploy Python AI Service (`intelligent-attendance-ai`)
- **Type**: Web Service
- **Runtime**: Docker
- **Root Directory**: `intelligent-attendance-ai`
- **Docker Command / File**: `./Dockerfile`
- **Health Check Path**: `/api/warning/health`
- **Environment Variables**: Copy từ [`intelligent-attendance-ai/.env.prod`](file:///d:/Jobs/Intelligent%20Attendance%20System/intelligent-attendance-ai/.env.prod)
  - `MONGODB_URI`: *Connection string MongoDB Atlas của bạn*
  - `DATABASE_NAME`: `base_auth_db`
- *Sau khi deploy xong, lưu lại domain Render của AI Service (VD: `https://intelligent-attendance-ai.onrender.com`)*.

---

### 2. Deploy NestJS Backend (`intelligent-attendance-system`)
- **Type**: Web Service
- **Runtime**: Docker
- **Root Directory**: `intelligent-attendance-system`
- **Docker Command / File**: `./Dockerfile`
- **Health Check Path**: `/api/v1/health`
- **Environment Variables**: Copy từ [`intelligent-attendance-system/.env.prod`](file:///d:/Jobs/Intelligent%20Attendance%20System/intelligent-attendance-system/.env.prod)
  - `NODE_ENV`: `production`
  - `MONGODB_URI`: *Connection string MongoDB Atlas*
  - `FIREBASE_PROJECT_ID`: `mygallery-2026-v1`
  - `FIREBASE_CLIENT_EMAIL`: `firebase-adminsdk-fbsvc@mygallery-2026-v1.iam.gserviceaccount.com`
  - `FIREBASE_PRIVATE_KEY`: *"-----BEGIN PRIVATE KEY-----\n..."*
  - `FIREBASE_WEB_API_KEY`: `AIzaSyDDP5DQcDLpIlJbnODUxVCssWhUhVeI6Uw`
  - `CLOUDINARY_CLOUD_NAME`: `dbzuqtojr`
  - `CLOUDINARY_API_KEY`: `278466846868427`
  - `CLOUDINARY_API_SECRET`: `lqKjEaJJByiDQ6lvR6LbwcAXtI0`
  - `AI_SERVICE_URL`: *Dán URL của Python AI Service vừa deploy ở bước 1*
  - `QR_HMAC_SECRET`: `attendance-system-dynamic-qr-secret-key-prod-2025`
- *Sau khi deploy xong, lưu lại domain Render của Backend (VD: `https://intelligent-attendance-api.onrender.com`)*.

---

### 3. Deploy Next.js Web App (`intelligent-attendance-web-app`)
- **Type**: Web Service
- **Runtime**: Docker
- **Root Directory**: `intelligent-attendance-web-app`
- **Docker Command / File**: `./Dockerfile`
- **Environment Variables**: Copy từ [`intelligent-attendance-web-app/.env.prod`](file:///d:/Jobs/Intelligent%20Attendance%20System/intelligent-attendance-web-app/.env.prod)
  - `NEXT_PUBLIC_API_URL`: `https://intelligent-attendance-api.onrender.com/api/v1` *(Thay bằng domain Backend của bạn)*
  - `NEXT_PUBLIC_FIREBASE_API_KEY`: `AIzaSyDDP5DQcDLpIlJbnODUxVCssWhUhVeI6Uw`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: `mygallery-2026-v1.firebaseapp.com`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: `mygallery-2026-v1`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: `mygallery-2026-v1.appspot.com`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: `655607565393`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`: `1:655607565393:web:b1ce19ff067dd99831fc70`
  - `NEXT_PUBLIC_FIREBASE_VAPID_KEY`: `BEN8QjxpsC96vP7-iCDggVRVfzyQhHvKnzO4EeM1BZgubuEyLnl6_ztEgwEw6AP6RPWgm2mCwMzLWlGdKMEWBSA`

---

## ⚠️ Lưu Ý Quan Trọng Khi Chạy Trên Render

1. **PORT Variable**: Render tự động gán biến môi trường `PORT` (thường là 10000). Toàn bộ các `Dockerfile` đã được cấu hình dynamic binding nhận trực tiếp `PORT` từ Render.
2. **Firebase Private Key**: Trên giao diện Web Dashboard của Render, bạn có thể dán toàn bộ key có chứa dấu xuống dòng thật hoặc chuỗi dạng `\n`, hệ thống NestJS đã có sẵn code xử lý chuẩn hóa chuỗi `replace(/\\n/g, '\n')`.
3. **Chạy thử nghiệm trên máy Local bằng Docker Compose**:
   ```bash
   docker compose up --build
   ```
   - Frontend Web App: `http://localhost:4000`
   - Backend API & Swagger: `http://localhost:3000/api/docs`
   - AI ML Microservice Docs: `http://localhost:8000/docs`
