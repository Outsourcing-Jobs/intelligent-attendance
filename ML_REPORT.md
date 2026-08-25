# BÁO CÁO KẾT QUẢ HỌC MÁY (MACHINE LEARNING REPORT)
## ĐỀ TÀI: HỆ THỐNG ĐIỂM DANH THÔNG MINH TÍCH HỢP CẢNH BÁO ĐIỂM CHUYÊN CẦN

---

## 1. TỔNG QUAN VÀ MỤC TIÊU BÀI TOÁN

Trong các cơ sở giáo dục đại học và cao đẳng, công tác quản lý điểm danh và theo dõi tính chuyên cần của sinh viên đóng vai trò cốt lõi trong việc đảm bảo chất lượng đào tạo. Theo quy chế đào tạo theo hệ thống tín chỉ hiện hành của Bộ Giáo dục và Đào tạo:
- Sinh viên có số tiết vắng vượt quá **20% tổng số tiết** của môn học sẽ **bị cấm thi** kết thúc học phần và bắt buộc phải đăng ký học lại.
- Sinh viên có điểm chuyên cần dưới chuẩn ($< 7.0/10$ hoặc $< 70\%$) có nguy cơ cao bị điểm kém hoặc rớt môn.
- Sinh viên có chuỗi vắng liên tiếp từ **3 buổi trở lên** thường là dấu hiệu của việc bỏ học, gặp khó khăn tâm lý hoặc vấn đề đột xuất cần can thiệp sư phạm kịp thời.

**Mục tiêu của module Học máy:**
Xây dựng mô hình phân loại nhị phân (Binary Classification) có khả năng tự động phân tích hành vi và lịch sử điểm danh của sinh viên trong từng lớp học phần theo thời gian thực, từ đó:
1. Dự báo sớm nguy cơ chuyên cần thấp / cấm thi (`is_warning = true/false`).
2. Phân loại 3 mức độ cảnh báo: **Thấp (An toàn)**, **Trung bình (Lưu ý)**, **Cao (Nguy hiểm / Can thiệp khẩn cấp)** dựa trên xác suất `predict_proba`.
3. Tự động sinh khuyến nghị hành động phù hợp gửi đến Giảng viên phụ trách và Sinh viên.

---

## 2. DỮ LIỆU VÀ KỸ THUẬT TRÍCH XUẤT ĐẶC TRƯNG (FEATURE ENGINEERING)

### 2.1. Nguồn dữ liệu từ Cơ sở dữ liệu MongoDB Atlas
Hệ thống sử dụng cơ sở dữ liệu MongoDB Atlas (`intelligent-attendance`) với các bảng thực thể chính:
- `attendances`: 78,242 bản ghi điểm danh chi tiết.
- `class_sessions`: 872 buổi học đã diễn ra.
- `course_sections`: 16 lớp học phần mở trong học kỳ.
- `enrollments`: 2,608 lượt sinh viên đăng ký môn học.
- `users`: Danh sách sinh viên và giảng viên.

Mỗi bản ghi `attendances` lưu vết các trạng thái thực tế:
- `present`: Có mặt đúng giờ.
- `late`: Đi muộn.
- `early_leave`: Về sớm.
- `excused`: Nghỉ học có đơn xin phép được duyệt qua hệ thống `leave_requests`.
- `absent`: Vắng mặt không phép.

### 2.2. Danh sách các Đặc trưng (Features Vector)
Từ dữ liệu chuỗi thời gian của từng sinh viên theo lớp học phần, hệ thống trích xuất vector 10 đặc trưng định lượng:

| STT | Tên đặc trưng (`Feature Name`) | Kiểu dữ liệu | Ý nghĩa và Công thức tính toán |
|:---:|:---|:---:|:---|
| **1** | `total_sessions` | Integer | Tổng số buổi học đã diễn ra của lớp học phần tính đến thời điểm khảo sát. |
| **2** | `present_rate` | Float | Tỷ lệ buổi học có mặt đúng giờ: $\frac{\text{present\_count}}{\text{total\_sessions}}$ |
| **3** | `late_rate` | Float | Tỷ lệ buổi học đi muộn: $\frac{\text{late\_count}}{\text{total\_sessions}}$ |
| **4** | `early_leave_rate` | Float | Tỷ lệ buổi học về sớm: $\frac{\text{early\_leave\_count}}{\text{total\_sessions}}$ |
| **5** | `absent_rate` | Float | Tỷ lệ vắng mặt không phép: $\frac{\text{absent\_count}}{\text{total\_sessions}}$ |
| **6** | `excused_rate` | Float | Tỷ lệ vắng mặt có phép: $\frac{\text{excused\_count}}{\text{total\_sessions}}$ |
| **7** | `attendance_score_pct` | Float | Điểm chuyên cần quy đổi theo thang 100%:<br>$\text{Score} = \text{present} \times 1.0 + \text{excused} \times 1.0 + \text{late} \times 0.5 + \text{early\_leave} \times 0.5$<br>$\text{Score\_Pct} = \frac{\text{Score}}{\text{total\_sessions}} \times 100$ |
| **8** | `unexcused_absent_rate` | Float | Tỷ lệ vắng không phép (chỉ số trực tiếp để xét cấm thi theo quy chế 20%). |
| **9** | `consecutive_absent` | Integer | Số buổi vắng liên tiếp gần nhất (tính từ buổi cuối cùng ngược về trước). Phản ánh nguy cơ bỏ học đột ngột. |
| **10** | `recent_attendance_rate` | Float | Tỷ lệ chuyên cần trong 3 buổi học gần nhất. Phản ánh độ dốc suy giảm phong độ học tập gần đây. |

### 2.3. Định nghĩa Nhãn Mục tiêu (Target Label $y$ - `is_warning`)
Nhãn cảnh báo được xác định theo chuẩn học vụ:
- **`is_warning = 1` (Có nguy cơ / Cần cảnh báo)**: Khi sinh viên thỏa mãn **ít nhất một** trong các điều kiện:
  $$\text{absent\_rate} \ge 0.20 \quad \lor \quad \text{attendance\_score\_pct} < 70.0 \quad \lor \quad \text{consecutive\_absent} \ge 3$$
- **`is_warning = 0` (An toàn)**: Sinh viên duy trì tính chuyên cần đạt yêu cầu môn học.

---

## 3. QUY TRÌNH TIỀN XỬ LÝ VÀ HUẤN LUYỆN (ML PIPELINE)

### 3.1. Phân chia tập dữ liệu và Chuẩn hóa đặc trưng
- **Tổng số mẫu huấn luyện & kiểm thử:** 7,608 mẫu (kết hợp 2,608 mẫu từ dữ liệu thực tế MongoDB Atlas và 5,000 mẫu mô phỏng đa dạng phân lớp hành vi theo các mốc tuần học $5 \to 30$ buổi).
  - Lớp an toàn (`is_warning = 0`): 6,283 mẫu (82.58%).
  - Lớp cảnh báo (`is_warning = 1`): 1,325 mẫu (17.42%).
- **Phân chia Train / Test:** Tỷ lệ **80% Train (6,086 mẫu)** và **20% Test (1,522 mẫu)** có áp dụng kỹ thuật phân tầng `stratify=y` và cố định `random_state=42` để đảm bảo tính tái lập.
- **Chuẩn hóa (Feature Scaling):** Sử dụng `StandardScaler` để đưa các đặc trưng về phân phối chuẩn có $\mu = 0$ và $\sigma = 1$:
  $$z = \frac{x - \mu}{\sigma}$$

### 3.2. Ba thuật toán học máy được triển khai
1. **Logistic Regression (Hồi quy Logistic):**
   - Đóng vai trò làm mô hình chuẩn cơ sở (Baseline Linear Model).
   - Thiết lập: `max_iter=1000`, `class_weight='balanced'`, `C=1.0`.
2. **Decision Tree Classifier (Cây quyết định):**
   - Mô hình phi tuyến có cấu trúc dạng cây phân cấp, cho phép giải thích rõ ràng các ngưỡng quyết định (rule-based explainability).
   - Thiết lập: `max_depth=6`, `min_samples_split=10`, `min_samples_leaf=5`, `class_weight='balanced'`.
3. **Random Forest Classifier (Rừng ngẫu nhiên):**
   - Mô hình học kết hợp (Ensemble Learning) gồm 100 cây quyết định độc lập nhằm tối ưu hóa độ chính xác và giảm thiểu phương sai (Variance).
   - Thiết lập: `n_estimators=100`, `max_depth=8`, `min_samples_split=5`, `min_samples_leaf=2`, `class_weight='balanced'`.

---

## 4. KẾT QUẢ THỰC NGHIỆM VÀ SO SÁNH CÁC MÔ HÌNH

### 4.1. Bảng so sánh các chỉ số đánh giá trên tập Test (1,522 mẫu)

| Thuật toán | Accuracy (%) | Precision (%) | Recall (%) | F1-Score (%) | ROC-AUC |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Logistic Regression** | 99.08% | 94.98% | **100.00%** | 97.43% | 0.9997 |
| **Decision Tree** | **100.00%** | **100.00%** | **100.00%** | **100.00%** | **1.0000** |
| **Random Forest** | 99.87% | 99.25% | **100.00%** | 99.62% | **1.0000** |

### 4.2. Chi tiết Ma trận nhầm lẫn (Confusion Matrix) trên tập Test

#### A. Logistic Regression:
$$\begin{bmatrix} \text{TN} = 1243 & \text{FP} = 14 \\ \text{FN} = 0 & \text{TP} = 265 \end{bmatrix}$$
- Nhận xét: Nhận diện chính xác $100\%$ sinh viên có nguy cơ ($\text{FN}=0$), tuy nhiên có 14 trường hợp báo động nhầm ($\text{FP}=14$) do tính chất tuyến tính của siêu phẳng phân chia.

#### B. Decision Tree:
$$\begin{bmatrix} \text{TN} = 1257 & \text{FP} = 0 \\ \text{FN} = 0 & \text{TP} = 265 \end{bmatrix}$$
- Nhận xét: Đạt độ chính xác tuyệt đối $100\%$, không có trường hợp dương tính giả ($\text{FP}=0$) và không có trường hợp âm tính giả ($\text{FN}=0$).

#### C. Random Forest:
$$\begin{bmatrix} \text{TN} = 1255 & \text{FP} = 2 \\ \text{FN} = 0 & \text{TP} = 265 \end{bmatrix}$$
- Nhận xét: Hiệu năng xấp xỉ hoàn hảo, chỉ có 2 trường hợp báo động nhầm do tính ngẫu nhiên của việc lấy mẫu thuộc tính (Feature Subsampling).

---

## 5. PHÂN TÍCH ĐỘ QUAN TRỌNG CỦA ĐẶC TRƯNG (FEATURE IMPORTANCE)

Mức độ đóng góp của từng đặc trưng vào quyết định cảnh báo của mô hình:

| Đặc trưng | Độ quan trọng trong Random Forest | Trọng số trong Decision Tree | Hệ số hồi quy Logistic |
|:---|:---:|:---:|:---:|
| `attendance_score_pct` | **35.81%** | **95.44%** | -3.9968 |
| `unexcused_absent_rate` | **27.52%** | 0.00% | +4.2060 |
| `absent_rate` | **18.13%** | 4.56% | +4.2060 |
| `present_rate` | **9.67%** | 0.00% | -3.3648 |
| `recent_attendance_rate` | **5.62%** | 0.00% | -0.2672 |
| `consecutive_absent` | **1.76%** | 0.00% | -0.4657 |
| `total_sessions` | **0.91%** | 0.00% | -0.7186 |
| `late_rate` | **0.30%** | 0.00% | -0.2588 |
| `early_leave_rate` | **0.19%** | 0.00% | -0.1318 |
| `excused_rate` | **0.09%** | 0.00% | -0.8064 |

**Nhận định khoa học:**
1. Điểm chuyên cần phần trăm (`attendance_score_pct`) và Tỷ lệ vắng không phép (`unexcused_absent_rate`, `absent_rate`) là 3 yếu tố mang tính quyết định cao nhất đối với nguy cơ học vụ của sinh viên.
2. Các đặc trưng chuỗi thời gian như `recent_attendance_rate` và `consecutive_absent` hỗ trợ mô hình phát hiện sớm các sinh viên có biểu hiện bỏ tiết bất thường trước khi điểm số tổng thể bị kéo xuống quá thấp.

---

## 6. KẾT LUẬN VÀ LÝ DO LỰA CHỌN MÔ HÌNH

Hệ thống đã tự động lựa chọn **Decision Tree Classifier** (kết hợp lưu trữ thêm **Random Forest**) làm mô hình tối ưu để đóng gói vào tệp `best_model.pkl` và `scaler.pkl` vì các lý do sau:

1. **Hiệu năng phân loại xuất sắc:** Đạt chỉ số **F1-Score = 100%**, **Recall = 100%** và **Precision = 100%** trên tập dữ liệu kiểm thử độc lập.
2. **Khả năng diễn giải minh bạch (Explainability):** Trong lĩnh vực giáo dục, việc giải thích nguyên nhân cảnh báo cho sinh viên và hội đồng học vụ là bắt buộc. Cây quyết định cung cấp các quy tắc phân nhánh trực quan, trùng khớp với các điều khoản trong Quy chế đào tạo của nhà trường.
3. **Tốc độ suy luận siêu nhanh (Ultra-low Latency):** Thời gian thực hiện một lượt dự báo (`predict`) dưới **1 mili-giây**, hoàn toàn đáp ứng yêu cầu xử lý thời gian thực khi tích hợp vào hệ thống Web Backend và ứng dụng di động.

---

## 7. KIẾN TRÚC TÍCH HỢP HỆ THỐNG VÀ API

### 7.1. Sơ đồ luồng dữ liệu (Dataflow Architecture)
```
[ Next.js Web App / Client ]
            │
            ▼ (HTTP REST)
[ NestJS Backend API (Port 3000) ]
  ├── Endpoint: POST /api/v1/warning/predict
  ├── WarningController & WarningService
  │
  ├───► (Tùy chọn HTTP) ──► [ Python FastAPI AI Service (Port 8000) ]
  │                           ├── Endpoint: POST /api/warning/predict
  │                           ├── WarningPredictor Engine
  │                           └── Model Artifacts: best_model.pkl & scaler.pkl
  │
  └───► (Truy vấn CSDL) ──► [ MongoDB Atlas Cluster ]
                              ├── attendances (78,242 records)
                              ├── class_sessions & course_sections
                              └── enrollments & users
```

### 7.2. Chi tiết API Endpoint Dự Báo

#### Endpoint: `POST /api/warning/predict` (hoặc `POST /api/v1/warning/predict`)
- **Request Body (JSON):**
```json
{
  "student_id": "6a71f25456c0266186cf59ad",
  "course_section_id": "6a71f25956c0266186cf5ab6"
}
```

- **Response Body (JSON):**
```json
{
  "success": true,
  "data": {
    "student_id": "6a71f25456c0266186cf59ad",
    "course_section_id": "6a71f25956c0266186cf5ab6",
    "is_warning": false,
    "warning_level": "Thấp",
    "warning_probability": 0.0,
    "attendance_score": 25.0,
    "attendance_score_pct": 83.33,
    "attendance_score_scale10": 8.33,
    "total_sessions": 30,
    "consecutive_absent": 0,
    "model_used": "Decision Tree",
    "recommendation": {
      "for_student": "TỐT: Tinh thần chuyên cần của bạn rất tốt (điểm chuyên cần: 83.3%, đã tham gia 30 buổi). Hãy tiếp tục duy trì phong độ này!",
      "for_lecturer": "Sinh viên duy trì chuyên cần tốt. Không cần can thiệp."
    },
    "features": {
      "total_sessions": 30,
      "present_count": 21,
      "late_count": 5,
      "early_leave_count": 1,
      "absent_count": 2,
      "excused_count": 1,
      "present_rate": 0.7,
      "late_rate": 0.1667,
      "early_leave_rate": 0.0333,
      "absent_rate": 0.0667,
      "excused_rate": 0.0333,
      "attendance_score": 25.0,
      "attendance_score_pct": 83.33,
      "attendance_score_scale10": 8.33,
      "unexcused_absent_rate": 0.0667,
      "total_absence_rate": 0.1,
      "consecutive_absent": 0,
      "recent_attendance_rate": 100.0,
      "is_warning": 0
    }
  }
}
```

---

## 8. HƯỚNG DẪN CHẠY VÀ VẬN HÀNH

1. **Chạy lại quy trình huấn luyện và đánh giá mô hình:**
   ```bash
   cd intelligent-attendance-ai
   .\.venv\Scripts\python train_model.py
   ```

2. **Khởi chạy Python AI FastAPI Service:**
   ```bash
   cd intelligent-attendance-ai
   .\.venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - Tài liệu Swagger API tương tác: `http://localhost:8000/docs`

3. **Khởi chạy NestJS Backend:**
   ```bash
   cd intelligent-attendance-system
   npm run start:dev
   ```
   - Tài liệu Swagger API của hệ thống: `http://localhost:3000/api/docs`

---
*Báo cáo được khởi tạo tự động phục vụ nghiệm thu Đồ án Tốt nghiệp ngành Công nghệ Thông tin.*
