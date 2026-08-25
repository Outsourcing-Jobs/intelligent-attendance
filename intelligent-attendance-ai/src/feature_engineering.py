import os
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()

# Danh sách 10 đặc trưng chính được sử dụng để huấn luyện và dự báo ML
FEATURE_COLUMNS = [
    "total_sessions",
    "present_rate",
    "late_rate",
    "early_leave_rate",
    "absent_rate",
    "excused_rate",
    "attendance_score_pct",
    "unexcused_absent_rate",
    "consecutive_absent",
    "recent_attendance_rate",
]


class AttendanceFeatureExtractor:
    """
    Module trích xuất và tính toán các đặc trưng (Feature Engineering)
    từ Cơ sở dữ liệu MongoDB phục vụ huấn luyện và dự báo Cảnh báo Chuyên cần.
    """

    def __init__(self, mongo_uri: Optional[str] = None, db_name: Optional[str] = None):
        self.mongo_uri = mongo_uri or os.getenv("MONGODB_URI")
        self.db_name = db_name or os.getenv("DATABASE_NAME", "intelligent-attendance")
        self._client: Optional[MongoClient] = None
        self._db = None

    @property
    def db(self):
        if self._db is None:
            if not self.mongo_uri:
                raise ValueError("MONGODB_URI không được để trống!")
            self._client = MongoClient(self.mongo_uri)
            self._db = self._client[self.db_name]
        return self._db

    def close(self):
        if self._client:
            self._client.close()
            self._client = None
            self._db = None

    @staticmethod
    def calculate_metrics_from_statuses(statuses: List[str]) -> Dict[str, Any]:
        """
        Tính toán vector đặc trưng từ danh sách trạng thái điểm danh đã sắp xếp theo thời gian.
        statuses: danh sách chuỗi trạng thái như ['present', 'late', 'absent', ...]
        """
        total_sessions = len(statuses)
        if total_sessions == 0:
            return {
                "total_sessions": 0,
                "present_count": 0,
                "late_count": 0,
                "early_leave_count": 0,
                "absent_count": 0,
                "excused_count": 0,
                "present_rate": 0.0,
                "late_rate": 0.0,
                "early_leave_rate": 0.0,
                "absent_rate": 0.0,
                "excused_rate": 0.0,
                "attendance_score": 0.0,
                "attendance_score_pct": 0.0,
                "attendance_score_scale10": 0.0,
                "unexcused_absent_rate": 0.0,
                "total_absence_rate": 0.0,
                "consecutive_absent": 0,
                "recent_attendance_rate": 0.0,
                "is_warning": 0,
            }

        # Đếm các trạng thái
        present_count = statuses.count("present")
        late_count = statuses.count("late")
        early_leave_count = statuses.count("early_leave")
        absent_count = statuses.count("absent")
        excused_count = statuses.count("excused")

        # Tỷ lệ
        present_rate = present_count / total_sessions
        late_rate = late_count / total_sessions
        early_leave_rate = early_leave_count / total_sessions
        absent_rate = absent_count / total_sessions
        excused_rate = excused_count / total_sessions
        unexcused_absent_rate = absent_rate
        total_absence_rate = (absent_count + excused_count) / total_sessions

        # Điểm chuyên cần quy đổi theo quy chế học vụ:
        # Present = 1.0, Excused = 1.0, Late = 0.5, Early Leave = 0.5, Absent = 0.0
        attendance_score = (
            present_count * 1.0
            + excused_count * 1.0
            + late_count * 0.5
            + early_leave_count * 0.5
        )
        attendance_score_pct = (attendance_score / total_sessions) * 100.0
        attendance_score_scale10 = (attendance_score / total_sessions) * 10.0

        # Tính số buổi vắng liên tiếp gần nhất (tính từ buổi cuối cùng ngược về trước)
        consecutive_absent = 0
        for status in reversed(statuses):
            if status == "absent":
                consecutive_absent += 1
            else:
                break

        # Tỷ lệ chuyên cần trong 3 buổi gần nhất
        recent_window = statuses[-3:] if len(statuses) >= 3 else statuses
        recent_score = sum(
            1.0 if s in ("present", "excused") else 0.5 if s in ("late", "early_leave") else 0.0
            for s in recent_window
        )
        recent_attendance_rate = (recent_score / len(recent_window)) * 100.0 if recent_window else 0.0

        # Gán Nhãn Cảnh báo (is_warning):
        # 1 = Cảnh báo (Nguy cơ cấm thi hoặc điểm chuyên cần dưới chuẩn học vụ)
        # 0 = An toàn
        is_warning = 1 if (
            absent_rate >= 0.20
            or attendance_score_pct < 70.0
            or consecutive_absent >= 3
        ) else 0

        return {
            "total_sessions": total_sessions,
            "present_count": present_count,
            "late_count": late_count,
            "early_leave_count": early_leave_count,
            "absent_count": absent_count,
            "excused_count": excused_count,
            "present_rate": round(present_rate, 4),
            "late_rate": round(late_rate, 4),
            "early_leave_rate": round(early_leave_rate, 4),
            "absent_rate": round(absent_rate, 4),
            "excused_rate": round(excused_rate, 4),
            "attendance_score": round(attendance_score, 2),
            "attendance_score_pct": round(attendance_score_pct, 2),
            "attendance_score_scale10": round(attendance_score_scale10, 2),
            "unexcused_absent_rate": round(unexcused_absent_rate, 4),
            "total_absence_rate": round(total_absence_rate, 4),
            "consecutive_absent": consecutive_absent,
            "recent_attendance_rate": round(recent_attendance_rate, 2),
            "is_warning": is_warning,
        }

    def extract_features_for_student(
        self, student_id: str, course_section_id: str
    ) -> Dict[str, Any]:
        """
        Trích xuất đặc trưng thời gian thực cho 1 sinh viên trong 1 lớp học phần cụ thể.
        Dùng cho API Endpoint `/api/warning/predict`.
        """
        # Chuẩn hóa ObjectId nếu cần
        try:
            s_id = ObjectId(student_id) if ObjectId.is_valid(student_id) else student_id
        except Exception:
            s_id = student_id

        try:
            c_id = (
                ObjectId(course_section_id)
                if ObjectId.is_valid(course_section_id)
                else course_section_id
            )
        except Exception:
            c_id = course_section_id

        # Tìm các buổi học và điểm danh tương ứng theo thứ tự thời gian
        query = {
            "$or": [
                {"studentId": s_id, "courseSectionId": c_id},
                {"studentId": str(student_id), "courseSectionId": str(course_section_id)},
            ]
        }
        records = list(
            self.db["attendances"]
            .find(query, {"status": 1, "createdAt": 1, "classSessionId": 1})
            .sort("createdAt", 1)
        )

        statuses = [r.get("status", "absent") for r in records if "status" in r]
        metrics = self.calculate_metrics_from_statuses(statuses)
        metrics["student_id"] = str(student_id)
        metrics["course_section_id"] = str(course_section_id)
        return metrics

    def extract_all_features_from_db(self) -> pd.DataFrame:
        """
        Trích xuất toàn bộ dữ liệu điểm danh từ CSDL MongoDB,
        tính toán vector đặc trưng cho tất cả các cặp (Sinh viên, Lớp học phần).
        """
        print("Đang truy vấn dữ liệu từ MongoDB Atlas...")
        attendances = list(
            self.db["attendances"].find(
                {},
                {
                    "studentId": 1,
                    "courseSectionId": 1,
                    "classSessionId": 1,
                    "status": 1,
                    "createdAt": 1,
                },
            ).sort("createdAt", 1)
        )
        print(f"Tổng số bản ghi điểm danh: {len(attendances)}")

        if not attendances:
            return pd.DataFrame()

        df_raw = pd.DataFrame(attendances)
        df_raw["studentId"] = df_raw["studentId"].astype(str)
        df_raw["courseSectionId"] = df_raw["courseSectionId"].astype(str)

        grouped = df_raw.groupby(["studentId", "courseSectionId"])
        records = []
        for (student_id, course_section_id), group in grouped:
            statuses = group["status"].tolist()
            metrics = self.calculate_metrics_from_statuses(statuses)
            metrics["student_id"] = student_id
            metrics["course_section_id"] = course_section_id
            records.append(metrics)

        feature_df = pd.DataFrame(records)
        return feature_df

    @staticmethod
    def generate_synthetic_dataset(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
        """
        Sinh bộ dữ liệu mở rộng phản ánh 4 nhóm hồ sơ hành vi sinh viên điển hình
        trong môi trường đại học theo các mốc thời gian học kỳ (từ 5 đến 30 buổi):
        1. Nhóm Xuất sắc / Chăm chỉ (50%): Tỷ lệ có mặt 85-100%, vắng 0-5%, F1 an toàn
        2. Nhóm Trung bình / Bình thường (25%): Tỷ lệ có mặt 70-85%, đi muộn 10-20%, vắng 5-15%
        3. Nhóm Nguy cơ / Vắng nhiều (15%): Tỷ lệ có mặt 40-65%, vắng 20-40%, nguy cơ cấm thi
        4. Nhóm Bỏ học / Nghiêm trọng (10%): Tỷ lệ vắng 50-90%, chuỗi vắng dài >= 3 buổi
        """
        np.random.seed(random_state)
        records = []

        # Các hồ sơ phân bố
        profiles = [
            {"name": "Excellent", "weight": 0.45, "p_present": 0.90, "p_late": 0.05, "p_early": 0.02, "p_excused": 0.02, "p_absent": 0.01},
            {"name": "Good_Average", "weight": 0.25, "p_present": 0.75, "p_late": 0.15, "p_early": 0.04, "p_excused": 0.03, "p_absent": 0.03},
            {"name": "At_Risk", "weight": 0.18, "p_present": 0.50, "p_late": 0.15, "p_early": 0.08, "p_excused": 0.05, "p_absent": 0.22},
            {"name": "Critical_Dropout", "weight": 0.12, "p_present": 0.20, "p_late": 0.10, "p_early": 0.05, "p_excused": 0.05, "p_absent": 0.60},
        ]

        status_options = ["present", "late", "early_leave", "excused", "absent"]

        for i in range(n_samples):
            # Chọn profile theo trọng số
            p_idx = np.random.choice(len(profiles), p=[p["weight"] for p in profiles])
            prof = profiles[p_idx]
            probs = [
                prof["p_present"],
                prof["p_late"],
                prof["p_early"],
                prof["p_excused"],
                prof["p_absent"],
            ]
            probs = np.array(probs) / np.sum(probs)

            # Số buổi học tại thời điểm đánh giá (từ 5 đến 30 buổi)
            n_sessions = np.random.randint(5, 31)

            # Mô phỏng chuỗi điểm danh (có tính liên kết chuỗi thời gian)
            statuses = []
            if prof["name"] == "Critical_Dropout" and np.random.rand() < 0.6:
                # Mô phỏng sinh viên bỏ học nửa sau
                split_point = np.random.randint(2, max(3, n_sessions // 2))
                for _ in range(split_point):
                    statuses.append(np.random.choice(status_options, p=probs))
                for _ in range(n_sessions - split_point):
                    statuses.append(np.random.choice(["absent", "late"], p=[0.85, 0.15]))
            else:
                for _ in range(n_sessions):
                    statuses.append(np.random.choice(status_options, p=probs))

            metrics = AttendanceFeatureExtractor.calculate_metrics_from_statuses(statuses)
            metrics["student_id"] = f"SYNTH_STU_{i:05d}"
            metrics["course_section_id"] = f"SYNTH_CRS_{np.random.randint(1, 20):03d}"
            records.append(metrics)

        return pd.DataFrame(records)


if __name__ == "__main__":
    extractor = AttendanceFeatureExtractor()
    try:
        df_real = extractor.extract_all_features_from_db()
        print(f"Trích xuất thành công {len(df_real)} mẫu thực tế từ MongoDB.")
        print(df_real.head())
        print("\nPhân bố nhãn thực tế:")
        print(df_real["is_warning"].value_counts())
    except Exception as e:
        print(f"Lỗi khi trích xuất MongoDB: {e}")
    finally:
        extractor.close()
