"""
Prediction Service cho FastAPI.
Tải pipeline mô hình Machine Learning và xử lý suy luận rủi ro chuyên cần.
"""

import os
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional, Tuple

import joblib
import numpy as np
import pandas as pd

from app.schemas import (
    RiskLevelInfo,
    RecommendationInfo,
    PredictResponse,
    AttendanceFeaturesInput,
)

current_dir = os.path.dirname(os.path.abspath(__file__))
ai_root = os.path.abspath(os.path.join(current_dir, "..", ".."))

# 12 đặc trưng theo chuẩn huấn luyện
FEATURE_COLUMNS = [
    "total_sessions",
    "present_count",
    "late_count",
    "early_leave_count",
    "excused_count",
    "absent_count",
    "attendance_rate",
    "absence_rate",
    "late_rate",
    "recent_absence_rate",
    "consecutive_absence",
    "attendance_trend",
]


class PredictionService:
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = base_dir or ai_root
        self.models_dir = os.path.join(self.base_dir, "models")
        self.pipeline_path = os.path.join(self.models_dir, "attendance_risk_pipeline.pkl")
        self.best_model_path = os.path.join(self.models_dir, "best_model.pkl")
        self.scaler_path = os.path.join(self.models_dir, "scaler.pkl")
        self.metadata_path = os.path.join(self.models_dir, "model_metadata.json")

        self.pipeline = None
        self.model = None
        self.scaler = None
        self.metadata: Dict[str, Any] = {}
        self.model_name = "Random Forest"

        self._load_artifacts()

    def _load_artifacts(self):
        """Nạp các tệp mô hình và metadata đã lưu."""
        # Nạp metadata trước
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
                self.model_name = self.metadata.get("best_model_name", "Random Forest")

        # Nạp Full Pipeline nếu có
        if os.path.exists(self.pipeline_path):
            try:
                self.pipeline = joblib.load(self.pipeline_path)
                print(f"-> [AI Service] Đã tải full pipeline thành công: {self.pipeline_path}")
                return
            except Exception as e:
                print(f"-> [AI Service] Không tải được pipeline: {e}. Thử tải model + scaler riêng...")

        # Nạp Model và Scaler riêng biệt
        if os.path.exists(self.best_model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.best_model_path)
            self.scaler = joblib.load(self.scaler_path)
            print(f"-> [AI Service] Đã tải model và scaler riêng biệt thành công!")
        else:
            print(f"-> [AI Service] CẢNH BÁO: Chưa tìm thấy file mô hình tại {self.models_dir}!")

    def is_ready(self) -> bool:
        return self.pipeline is not None or (self.model is not None and self.scaler is not None)

    def generate_recommendations(
        self,
        risk_level: str,
        probability: float,
        features: Dict[str, float],
    ) -> RecommendationInfo:
        """Sinh khuyến nghị thực tế cho sinh viên và giảng viên."""
        absent_count = int(features.get("absent_count", 0))
        consecutive_absence = int(features.get("consecutive_absence", 0))
        absence_rate = features.get("absence_rate", 0.0) * 100
        late_count = int(features.get("late_count", 0))
        total_sessions = int(features.get("total_sessions", 0))

        if risk_level == "HIGH":
            student_text = (
                f"CẢNH BÁO NGUY CƠ CAO: Bạn đã vắng {absent_count}/{total_sessions} buổi "
                f"({absence_rate:.1f}% số buổi), chuỗi vắng liên tiếp: {consecutive_absence} buổi. "
                "Bạn đang đối mặt với NGUY CƠ BỊ CẤM THI học phần này (>20% vắng). "
                "Cần chủ động liên hệ ngay với Giảng viên phụ trách hoặc Cố vấn học tập để nộp đơn giải trình/minh chứng hợp lệ."
            )
            lecturer_text = (
                f"Sinh viên có nguy cơ cấm thi rất cao (vắng {absent_count}/{total_sessions} buổi - {absence_rate:.1f}%, "
                f"vắng {consecutive_absence} buổi liên tiếp, xác suất rủi ro AI: {probability * 100:.1f}%). "
                "Đề xuất Giảng viên nhắc nhở trực tiếp, kiểm tra tình hình học tập và đưa vào danh sách theo dõi đặc biệt."
            )
        elif risk_level == "MEDIUM":
            student_text = (
                f"LƯU Ý CHUYÊN CẦN: Bạn có dấu hiệu sút giảm tham gia học tập "
                f"(đã vắng {absent_count} buổi, đi muộn {late_count} lần). "
                "Hãy đi học đầy đủ và đúng giờ các buổi còn lại để bảo đảm điểm chuyên cần và đủ điều kiện dự thi kết thúc học phần."
            )
            lecturer_text = (
                f"Sinh viên ở mức cảnh báo trung bình (tỷ lệ vắng {absence_rate:.1f}%, đi muộn {late_count} buổi). "
                "Đề xuất gửi thông báo nhắc nhở tự động qua hệ thống để sinh viên cải thiện kịp thời."
            )
        else:
            student_text = (
                f"TỐT: Tinh thần chuyên cần của bạn rất tốt (đã tham gia {total_sessions} buổi, tỷ lệ vắng chỉ {absence_rate:.1f}%). "
                "Hãy tiếp tục duy trì phong độ này đến hết học phần!"
            )
            lecturer_text = "Sinh viên duy trì ý thức chuyên cần tốt. Không cần can thiệp hỗ trợ."

        return RecommendationInfo(
            for_student=student_text,
            for_lecturer=lecturer_text,
        )

    def determine_risk_level(self, probability: float, features: Dict[str, float]) -> RiskLevelInfo:
        """
        Xác định mức độ rủi ro (LOW, MEDIUM, HIGH) dựa trên xác suất mô hình
        và các chỉ số an toàn quy chế (vắng > 20%, chuỗi vắng liên tiếp).
        """
        absence_rate = features.get("absence_rate", 0.0)
        consecutive_absence = features.get("consecutive_absence", 0.0)

        # Ngưỡng HIGH: Xác suất >= 0.70 hoặc tỷ lệ vắng >= 20% hoặc vắng 3 buổi liên tiếp
        if probability >= 0.70 or absence_rate >= 0.20 or consecutive_absence >= 3.0:
            return RiskLevelInfo(
                level="HIGH",
                label="Nguy cơ cao",
                color="red",
                probability_range=[0.70, 1.0],
                description="Rất gần hoặc đã vượt ngưỡng cấm thi (>20% vắng) hoặc chuỗi vắng liên tiếp nghiêm trọng.",
            )
        # Ngưỡng MEDIUM: Xác suất >= 0.35 hoặc tỷ lệ vắng >= 10% hoặc vắng 2 buổi liên tiếp
        elif probability >= 0.35 or absence_rate >= 0.10 or consecutive_absence >= 2.0:
            return RiskLevelInfo(
                level="MEDIUM",
                label="Cần chú ý",
                color="yellow",
                probability_range=[0.35, 0.70],
                description="Bắt đầu xuất hiện vắng mặt hoặc đi muộn rải rác, cần nhắc nhở sớm để tránh cấm thi.",
            )
        # Ngưỡng LOW: An toàn
        else:
            return RiskLevelInfo(
                level="LOW",
                label="An toàn",
                color="green",
                probability_range=[0.0, 0.35],
                description="Tỷ lệ chuyên cần tốt, duy trì phong độ học tập ổn định.",
            )

    def predict_from_features(
        self,
        features_dict: Dict[str, float],
        student_id: Optional[str] = None,
        course_section_id: Optional[str] = None,
    ) -> PredictResponse:
        """Thực hiện dự báo từ dictionary 12 đặc trưng."""
        if not self.is_ready():
            raise RuntimeError("Mô hình AI chưa sẵn sàng hoặc chưa được nạp.")

        # Đảm bảo có đủ 12 cột đặc trưng theo đúng thứ tự
        feature_vector = {col: float(features_dict.get(col, 0.0)) for col in FEATURE_COLUMNS}
        df_input = pd.DataFrame([feature_vector])

        # Suy luận qua Pipeline hoặc (Scaler + Model)
        if self.pipeline is not None:
            pred_label = int(self.pipeline.predict(df_input)[0])
            if hasattr(self.pipeline, "predict_proba"):
                probs = self.pipeline.predict_proba(df_input)[0]
                risk_prob = float(probs[1]) if len(probs) > 1 else float(pred_label)
            else:
                risk_prob = float(pred_label)
        else:
            scaled_vec = self.scaler.transform(df_input)
            pred_label = int(self.model.predict(scaled_vec)[0])
            if hasattr(self.model, "predict_proba"):
                probs = self.model.predict_proba(scaled_vec)[0]
                risk_prob = float(probs[1]) if len(probs) > 1 else float(pred_label)
            else:
                risk_prob = float(pred_label)

        risk_prob = round(risk_prob, 4)
        risk_info = self.determine_risk_level(risk_prob, feature_vector)
        recommendations = self.generate_recommendations(risk_info.level, risk_prob, feature_vector)

        return PredictResponse(
            success=True,
            student_id=student_id,
            course_section_id=course_section_id,
            risk=risk_info.level,
            riskProbability=risk_prob,
            model=self.model_name,
            prediction=pred_label,
            riskLevel=risk_info,
            recommendation=recommendations,
            features=feature_vector,
        )
