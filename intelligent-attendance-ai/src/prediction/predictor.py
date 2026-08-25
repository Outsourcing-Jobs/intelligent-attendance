import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

current_dir = os.path.dirname(os.path.abspath(__file__))
ai_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
if ai_root not in sys.path:
    sys.path.insert(0, ai_root)

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

from src.feature_engineering import AttendanceFeatureExtractor, FEATURE_COLUMNS


class WarningPredictor:
    """
    Engine tải mô hình ML đã huấn luyện và thực hiện suy luận dự báo
    nguy cơ chuyên cần cho sinh viên theo lớp học phần.
    """

    def __init__(self, models_dir: Optional[str] = None):
        if models_dir is None:
            models_dir = os.path.join(ai_root, "models")
        self.models_dir = models_dir

        self.model_path = os.path.join(self.models_dir, "best_model.pkl")
        self.scaler_path = os.path.join(self.models_dir, "scaler.pkl")
        self.metadata_path = os.path.join(self.models_dir, "model_metadata.json")

        self.model = None
        self.scaler = None
        self.metadata = {}
        self.extractor = AttendanceFeatureExtractor()

        self._load_artifacts()

    def _load_artifacts(self):
        if not os.path.exists(self.model_path) or not os.path.exists(self.scaler_path):
            raise FileNotFoundError(
                f"Không tìm thấy file mô hình tại {self.models_dir}. Hãy chạy train_model.py trước!"
            )
        self.model = joblib.load(self.model_path)
        self.scaler = joblib.load(self.scaler_path)

        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

    def generate_recommendation(
        self,
        warning_level: str,
        absent_rate: float,
        attendance_score_pct: float,
        consecutive_absent: int,
        total_sessions: int,
    ) -> Dict[str, str]:
        """
        Sinh khuyến nghị và hướng dẫn xử lý cụ thể cho cả Giảng viên và Sinh viên.
        """
        if warning_level == "Cao":
            student_rec = (
                f"CẢNH BÁO NGUY HIỂM: Bạn đã vắng {absent_rate*100:.1f}% số buổi học "
                f"(điểm chuyên cần hiện tại: {attendance_score_pct:.1f}%), "
                f"chuỗi vắng liên tiếp: {consecutive_absent} buổi. "
                "Bạn đang đối mặt với NGUY CƠ BỊ CẤM THI học phần này. "
                "Cần liên hệ ngay với Giảng viên phụ trách hoặc Cố vấn học tập để nộp đơn giải trình/minh chứng hợp lệ."
            )
            lecturer_rec = (
                f"Sinh viên có nguy cơ cấm thi rất cao (tỷ lệ vắng {absent_rate*100:.1f}%, "
                f"vắng {consecutive_absent} buổi liên tiếp). "
                "Đề xuất Giảng viên nhắc nhở trực tiếp, kiểm tra tình hình học tập và đưa vào danh sách theo dõi đặc biệt."
            )
        elif warning_level == "Trung bình":
            student_rec = (
                f"LƯU Ý CHUYÊN CẦN: Bạn có dấu hiệu sút giảm điểm danh (tỷ lệ vắng: {absent_rate*100:.1f}%, "
                f"điểm chuyên cần: {attendance_score_pct:.1f}%). "
                "Hãy đi học đầy đủ và đúng giờ các buổi còn lại để bảo đảm đủ điều kiện dự thi kết thúc học phần."
            )
            lecturer_rec = (
                f"Sinh viên ở mức cảnh báo trung bình (điểm chuyên cần {attendance_score_pct:.1f}%). "
                "Giảng viên nên gửi thông báo nhắc nhở tự động qua hệ thống để sinh viên cải thiện kịp thời."
            )
        else:
            student_rec = (
                f"TỐT: Tinh thần chuyên cần của bạn rất tốt (điểm chuyên cần: {attendance_score_pct:.1f}%, "
                f"đã tham gia {total_sessions} buổi). Hãy tiếp tục duy trì phong độ này!"
            )
            lecturer_rec = "Sinh viên duy trì chuyên cần tốt. Không cần can thiệp."

        return {
            "for_student": student_rec,
            "for_lecturer": lecturer_rec,
        }

    def predict(self, student_id: str, course_section_id: str) -> Dict[str, Any]:
        """
        Thực hiện dự báo cảnh báo điểm chuyên cần cho 1 sinh viên trong 1 môn học.
        """
        # 1. Trích xuất đặc trưng từ MongoDB
        features = self.extractor.extract_features_for_student(
            student_id=student_id, course_section_id=course_section_id
        )

        total_sessions = features["total_sessions"]
        if total_sessions == 0:
            return {
                "student_id": student_id,
                "course_section_id": course_section_id,
                "is_warning": False,
                "warning_level": "Chưa có dữ liệu",
                "warning_probability": 0.0,
                "attendance_score": 0.0,
                "attendance_score_pct": 0.0,
                "total_sessions": 0,
                "recommendation": {
                    "for_student": "Lớp học phần chưa có buổi điểm danh nào.",
                    "for_lecturer": "Chưa có dữ liệu điểm danh.",
                },
                "features": features,
            }

        # 2. Tạo DataFrame đặc trưng và chuẩn hóa
        df_input = pd.DataFrame([{col: features[col] for col in FEATURE_COLUMNS}])
        scaled_vector = self.scaler.transform(df_input)

        # 3. Dự báo qua mô hình ML
        pred_label = int(self.model.predict(scaled_vector)[0])
        probabilities = self.model.predict_proba(scaled_vector)[0]
        warning_prob = float(probabilities[1]) if len(probabilities) > 1 else float(pred_label)

        # 4. Phân cấp mức độ cảnh báo (Warning Level) dựa trên xác suất và điều kiện thực tế
        if warning_prob >= 0.70 or features["absent_rate"] >= 0.20 or features["consecutive_absent"] >= 3:
            warning_level = "Cao"
            is_warning = True
        elif warning_prob >= 0.30 or features["absent_rate"] >= 0.10 or features["attendance_score_pct"] < 80.0:
            warning_level = "Trung bình"
            is_warning = bool(pred_label == 1 or warning_prob >= 0.5)
        else:
            warning_level = "Thấp"
            is_warning = False

        # 5. Sinh khuyến nghị
        recommendation = self.generate_recommendation(
            warning_level=warning_level,
            absent_rate=features["absent_rate"],
            attendance_score_pct=features["attendance_score_pct"],
            consecutive_absent=features["consecutive_absent"],
            total_sessions=total_sessions,
        )

        return {
            "student_id": student_id,
            "course_section_id": course_section_id,
            "is_warning": is_warning,
            "warning_level": warning_level,
            "warning_probability": round(warning_prob, 4),
            "attendance_score": features["attendance_score"],
            "attendance_score_pct": features["attendance_score_pct"],
            "attendance_score_scale10": features["attendance_score_scale10"],
            "total_sessions": total_sessions,
            "consecutive_absent": features["consecutive_absent"],
            "model_used": self.metadata.get("best_model_name", "Decision Tree"),
            "recommendation": recommendation,
            "features": features,
        }
