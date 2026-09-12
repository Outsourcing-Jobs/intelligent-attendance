# KẾ HOẠCH TRIỂN KHAI TOÀN DIỆN (IMPLEMENTATION PLAN)
## ĐỒ ÁN TỐT NGHIỆP: HỆ THỐNG ĐIỂM DANH THÔNG MINH TÍCH HỢP CẢNH BÁO ĐIỂM CHUYÊN CẦN TRÊN NỀN TẢNG WEB

---

## 1. TỔNG QUAN HỆ THỐNG VÀ HIỆN TRẠNG (AUDIT SUMMARY)

### 1.1. Kiến trúc hiện tại
Hệ thống hiện tại gồm 3 thành phần chính:
1. **Backend (NestJS)**: Thư mục `intelligent-attendance-system`
   - Framework: NestJS v11, TypeScript, Mongoose v8, Firebase Admin SDK, Socket.IO.
   - Cơ sở dữ liệu: MongoDB Atlas (`intelligent-attendance`), hiện đã có **78,242** bản ghi `attendances`, **872** `class_sessions`, **2,608** `enrollments`, **16** `course_sections`, **163** `users`.
   - Các module hiện có: `academic` (class, course-section, student, subject, warning), `attendance` (attendance, leave-request, qr-security, statistics), `auth`, `config`, `device`, `media`, `notification`, `role`, `user`.
2. **Frontend (Next.js)**: Thư mục `intelligent-attendance-web-app`
   - Framework: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui.
   - Đã có giao diện Điểm danh (tự điểm danh, quét QR, báo cáo điểm danh, cấu hình GPS/WiFi).
3. **AI Service (FastAPI & Scikit-learn)**: Thư mục `intelligent-attendance-ai`
   - Python 3.14 (.venv), FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn, Joblib, Matplotlib.
   - Đã có mã nguồn trích xuất dữ liệu, tuy nhiên cần chuẩn hóa lại bài toán Machine Learning theo chuỗi thời gian (Timeline Split) để tránh rò rỉ dữ liệu (Data Leakage) và chuẩn hóa API contract theo đúng yêu cầu đề bài.

---

## 2. SO SÁNH CHỨC NĂNG (GAPS ANALYSIS)

| Thành phần / Tính năng | Hiện có | Còn thiếu / Cần cải tiến |
| :--- | :--- | :--- |
| **Điều chỉnh điểm danh (Adjustment)** | Điểm danh tự động qua QR, GPS, IP; Báo cáo hiển thị danh sách. | - Chưa có API `PATCH /attendances/:id/status`.<br>- Chưa lưu lịch sử audit (`updatedBy`, `previousStatus`, `newStatus`, `reason`).<br>- Frontend chưa có Action column, nút "Điều chỉnh", Dialog cập nhật. |
| **Tính điểm chuyên cần (Score Service)** | Đếm số buổi có mặt, muộn, vắng cơ bản trong `statistics.service.ts`. | - Chưa có `AttendanceScoreService` riêng biệt hỗ trợ đọc trọng số trừ điểm động từ cấu hình (`initialScore`, `absentPenalty`, `latePenalty`, `earlyLeavePenalty`, `excusedPenalty`, `examBanThreshold`).<br>- Chưa có API `GET /attendances/student/:studentId/course/:courseSectionId/score` & API score cả lớp.<br>- Frontend chưa hiển thị điểm chuyên cần & cờ cảnh báo cấm thi. |
| **Xuất Excel (Export Report)** | Báo cáo hiển thị trên bảng Web. | - Chưa cài thư viện `xlsx` (SheetJS) ở Frontend.<br>- Chưa có nút "Xuất Excel" và hàm export format chuẩn tiếng Việt, auto width, tên file `attendance_<courseCode>_<date>.xlsx`. |
| **Dataset Machine Learning & Labeling** | Đang gán nhãn tĩnh tại cùng thời điểm khảo sát (bị data leakage). | - Cần xây dựng bài toán **Early Warning** chuỗi thời gian (Timeline Split: 50-60% thời gian đầu làm Features $X$, 40-50% cuối kỳ làm Target Label $y$).<br>- Trích xuất từ 78,242 bản ghi thật trong MongoDB.<br>- Tạo tập dữ liệu `attendance_ml_dataset.csv` kèm thống kê phân bố nhãn. |
| **Huấn luyện & Đánh giá Model** | Code mẫu cơ bản trong `train_model.py`. | - Cần huấn luyện chuẩn hóa 3 mô hình: **Logistic Regression**, **Decision Tree**, **Random Forest**.<br>- Đánh giá bằng Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix.<br>- Ưu tiên Recall/F1 cho bài toán cảnh báo sớm.<br>- Xuất file so sánh `results/model_comparison.csv` và đồ thị vào `results/figures/`. |
| **FastAPI Microservice** | Đang có `main.py` với format cũ. | - Cần chuẩn hóa cấu trúc: `app/main.py`, `app/schemas.py`, `app/services/prediction_service.py`.<br>- Cung cấp `GET /health` (`status: ok`, `model_loaded: true`) và `POST /predict` (nhận features, trả về `risk: HIGH/MEDIUM/LOW`, `riskProbability`, `model`, `recommendation`). |
| **NestJS ↔ FastAPI Integration** | Module `warning.service.ts` gọi trực tiếp `student_id` và fallback nội bộ. | - Cần xây dựng/chuẩn hóa module `AttendanceRisk`: lấy lịch sử điểm danh từ MongoDB -> aggregate features chuẩn -> gửi sang FastAPI `POST /predict` -> format response.<br>- Bổ sung endpoint `GET /attendance-risk/student/:studentId/course/:courseSectionId`.<br>- Xử lý an toàn: Timeout (3s), AI Service offline fallback, không gây sập Backend. |
| **Frontend AI Warning** | Chưa hiển thị trên bảng báo cáo điểm danh. | - Hiển thị badge màu sắc + text rõ ràng (An toàn, Cần chú ý, Nguy cơ cao).<br>- Phân quyền: Giảng viên/Admin xem toàn bộ & lọc theo nguy cơ; Sinh viên chỉ xem kết quả của chính mình. |
| **Testing & Documentation** | Chưa có test tự động cho flow cảnh báo và điều chỉnh điểm danh. | - Viết test Unit/Integration cho Backend & AI Service.<br>- Biên soạn `docs/ML_IMPLEMENTATION.md` chi tiết 16 mục với số liệu thực nghiệm 100% thực tế. |

---

## 3. FILE CẦN SỬA VÀ TẠO MỚI

### 3.1. Backend (`intelligent-attendance-system`)
- **File cần tạo mới**:
  - `src/modules/attendance/schemas/attendance-audit.schema.ts`: Schema lưu vết lịch sử điều chỉnh điểm danh (`attendanceId`, `updatedBy`, `previousStatus`, `newStatus`, `reason`, `createdAt`).
  - `src/modules/attendance/dto/update-attendance-status.dto.ts`: DTO validate request điều chỉnh điểm danh.
  - `src/modules/attendance/attendance-score.service.ts`: Service tính toán điểm chuyên cần động theo cấu hình.
  - `src/modules/attendance/attendance-risk.controller.ts`: Controller cung cấp API cảnh báo AI `GET /attendance-risk/student/:studentId/course/:courseSectionId`.
  - `src/modules/attendance/attendance-risk.service.ts`: Service giao tiếp với FastAPI AI service (tính feature vector, gọi HTTP với timeout, xử lý fallback).
- **File cần sửa**:
  - `src/modules/attendance/schemas/attendance.schema.ts`: Đảm bảo các trường `updatedBy`, `note` và status enum tương thích.
  - `src/modules/attendance/schemas/attendance-config.schema.ts`: Bổ sung cấu hình tính điểm: `initialScore`, `absentPenalty`, `latePenalty`, `earlyLeavePenalty`, `excusedPenalty`, `examBanThreshold`.
  - `src/modules/attendance/attendance.controller.ts`: Thêm `PATCH /attendances/:id/status`, `GET /attendances/student/:studentId/course/:courseSectionId/score`, `GET /attendances/course/:courseSectionId/scores`.
  - `src/modules/attendance/attendance.service.ts`: Thêm logic điều chỉnh điểm danh + ghi audit log; tích hợp điểm chuyên cần vào báo cáo.
  - `src/modules/attendance/attendance.module.ts`: Khai báo các schema mới (`AttendanceAudit`), service mới (`AttendanceScoreService`, `AttendanceRiskService`), controller mới.

### 3.2. Frontend (`intelligent-attendance-web-app`)
- **File cần tạo mới**:
  - `src/app/(main)/dashboard/attendance/_components/lecturer/AttendanceAdjustmentDialog.tsx`: Dialog điều chỉnh điểm danh (Select status, Textarea lý do, Submit button).
  - `src/lib/excel-export.ts`: Helper xuất file Excel sử dụng SheetJS với định dạng chuyên nghiệp, auto width, tiếng Việt có dấu.
- **File cần sửa**:
  - `package.json`: Cài đặt thư viện `xlsx`.
  - `src/services/attendance.service.ts`: Bổ sung các hàm gọi API: `updateAttendanceStatus`, `getAttendanceScore`, `getClassAttendanceScores`, `getAttendanceRisk`.
  - `src/app/(main)/dashboard/attendance/page.tsx`:
    - Thêm nút "Xuất Excel" trên thanh công cụ lọc.
    - Bổ sung cột "Hành động" với nút "Điều chỉnh" mở modal cho Giảng viên/Admin.
    - Hiển thị badge điểm chuyên cần & cảnh báo rủi ro AI cho từng sinh viên.

### 3.3. AI Service (`intelligent-attendance-ai`)
- **File cần tạo mới / tái cấu trúc**:
  - `src/data/extract_data.py`: Trích xuất dữ liệu từ MongoDB Atlas (collections: attendances, class_sessions, enrollments, course_sections).
  - `src/features/feature_engineering.py`: Xây dựng pipeline trích xuất đặc trưng theo timeline split và tạo nhãn chuẩn xác.
  - `src/training/train_models.py`: Script huấn luyện 3 mô hình (Logistic Regression, Decision Tree, Random Forest), đánh giá metrics, vẽ biểu đồ và xuất artifact.
  - `app/main.py`: FastAPI server chuẩn hóa (CORS, Lifespan, `/health`, `/predict`).
  - `app/schemas.py`: Pydantic models cho input features và output prediction.
  - `app/services/prediction_service.py`: Load pipeline model `.pkl` và thực hiện inference.
- **File kết quả (Artifacts)**:
  - `data/processed/attendance_ml_dataset.csv`: Dataset đã xử lý hoàn chỉnh.
  - `models/attendance_risk_pipeline.pkl`: Model pipeline tốt nhất được export.
  - `models/model_metadata.json`: Metadata về feature names, metrics, threshold, timestamp.
  - `results/model_comparison.csv`: Bảng so sánh chỉ số giữa 3 model.
  - `results/figures/`: Thư mục lưu biểu đồ Confusion Matrix, ROC Curve, Feature Importance, Model Comparison.

### 3.4. Documentation (`docs/`)
- `docs/ML_IMPLEMENTATION.md`: Báo cáo chi tiết 16 chương chuẩn luận văn tốt nghiệp.

---

## 4. SCHEMA & DATABASE LEVERAGE

1. **Tận dụng tối đa Schema hiện có**:
   - `attendances`: Đã có sẵn các trường `checkInTime`, `checkOutTime`, `status`, `method`, `capturedImage`, `deviceInfo`, `updatedBy`, `note`, `timestamps`.
   - `attendance_configs`: Đã có `gracePeriodMinutes`, `lateThresholdMinutes`, `allowSelfCheckIn`, `allowedPublicIps`, `latitude`, `longitude`, `allowedRadiusMeters`, `requireWifiCheck`, `requireLocationCheck`. Chỉ bổ sung thêm các trường tính điểm với default value.
   - `class_sessions`, `course_sections`, `enrollments`, `users`: Giữ nguyên cấu trúc, tận dụng trực tiếp.
2. **Schema mới**:
   - `AttendanceAudit`: Độc lập để theo dõi biến động lịch sử, không gây xáo trộn bản ghi điểm danh gốc.

---

## 5. DEPENDENCIES CẦN CÀI ĐẶT

1. **Backend**:
   - Hiện đã có đủ: `@nestjs/common`, `@nestjs/mongoose`, `class-validator`, `class-transformer`.
2. **Frontend**:
   - `xlsx`: Cần chạy `npm install xlsx` trong `intelligent-attendance-web-app`.
3. **AI Service**:
   - Môi trường `.venv` hiện tại đã có: `fastapi`, `uvicorn`, `pydantic`, `pandas`, `numpy`, `scikit-learn`, `joblib`, `matplotlib`, `pymongo`. Đầy đủ 100%.

---

## 6. THỨ TỰ THỰC HIỆN CHI TIẾT (13 PHASES)

- **Phase 1**: Hoàn tất Audit source code và xác lập kế hoạch.
- **Phase 2**: Hoàn thiện tính năng Điều chỉnh điểm danh (Backend DTO/Audit/Service/API + Frontend Action/Dialog). Build & kiểm tra.
- **Phase 3**: Xây dựng Attendance Score Service và API tính điểm chuyên cần, cảnh báo cấm thi. Build & kiểm tra.
- **Phase 4**: Triển khai chức năng Xuất Excel (SheetJS) trên Frontend. Build & kiểm tra.
- **Phase 5**: Viết script trích xuất dữ liệu thực tế từ MongoDB Atlas.
- **Phase 6**: Feature Engineering và thiết kế nhãn theo bài toán Early Warning chuỗi thời gian (Timeline Split 60/40), lưu `attendance_ml_dataset.csv`.
- **Phase 7**: Huấn luyện 3 mô hình Logistic Regression, Decision Tree, Random Forest với 80/20 train/test split.
- **Phase 8**: Đánh giá toàn diện (Accuracy, Precision, Recall, F1, ROC-AUC), vẽ biểu đồ và export pipeline `.pkl` kèm `model_metadata.json`.
- **Phase 9**: Chuẩn hóa FastAPI AI Service (`/health`, `/predict`).
- **Phase 10**: Tích hợp NestJS ↔ FastAPI thông qua HTTP Service với timeout, fallback an toàn.
- **Phase 11**: Hoàn thiện giao diện cảnh báo AI Warning trên Frontend (Badge, Accessibility, Filter, Role-based view).
- **Phase 12**: Viết test và kiểm thử các edge cases.
- **Phase 13**: Biên soạn tài liệu tốt nghiệp `docs/ML_IMPLEMENTATION.md` với số liệu thực nghiệm thực tế 100%.

---

## 7. KẾ HOẠCH XÁC MINH VÀ KIỂM THỬ (VERIFICATION PLAN)

### 7.1. Automated Verification
- Kiểm tra TypeScript compilation Backend: `npm run build` trong `intelligent-attendance-system`.
- Kiểm tra Next.js compilation Frontend: `npm run build` hoặc typecheck trong `intelligent-attendance-web-app`.
- Chạy test Backend: `npm test` hoặc `npx jest src/modules/attendance/...`.
- Chạy test AI Service: Pytest hoặc script test endpoint `/health` và `/predict`.

### 7.2. Manual & Edge Case Verification
- Test điều chỉnh điểm danh với các vai trò: Sinh viên (bị 403 Forbidden), Giảng viên/Admin (thành công, có lưu audit log).
- Test xuất file Excel: tải file, mở kiểm tra font tiếng Việt, không bị lỗi ngày giờ, cột tự động co giãn đẹp mắt.
- Test Fallback khi tắt AI Service: Backend vẫn hoạt động trơn tru, trả về kết quả dự báo quy chế mà không làm sập server.
- Test sinh viên có các trường hợp cực trị: 0 buổi, 100% vắng, 100% có mặt.
