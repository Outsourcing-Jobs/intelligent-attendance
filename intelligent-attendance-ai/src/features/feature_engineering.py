import os
import sys
import io
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

# Đảm bảo in tiếng Việt UTF-8 trên Windows console
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

# Định nghĩa danh sách 12 Features chuẩn mực theo thiết kế bài toán
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


class AttendanceFeaturePipeline:
    def __init__(self, observation_ratio: float = 0.60, exam_ban_threshold: float = 20.0):
        """
        Khởi tạo Pipeline trích xuất đặc trưng và gán nhãn chuỗi thời gian (Timeline Split)
        :param observation_ratio: Tỷ lệ buổi học đầu dùng làm cửa sổ quan sát (50% - 70%, mặc định 60%)
        :param exam_ban_threshold: Ngưỡng vắng cấm thi theo quy chế đào tạo (mặc định 20%)
        """
        self.observation_ratio = observation_ratio
        self.exam_ban_threshold = exam_ban_threshold

    def extract_features_from_session_sequence(
        self,
        statuses: List[str],
        observation_k: int,
    ) -> Dict[str, float]:
        """
        Trích xuất Feature Vector X từ K buổi học đầu tiên (Observation Window)
        TUYỆT ĐỐI KHÔNG DÙNG THÔNG TIN CỦA CÁC BUỔI SAU K ĐỂ TRÁNH DATA LEAKAGE!
        """
        obs_statuses = statuses[:observation_k]
        k = len(obs_statuses)
        if k == 0:
            return {col: 0.0 for col in FEATURE_COLUMNS}

        present_count = obs_statuses.count("present")
        late_count = obs_statuses.count("late")
        early_leave_count = obs_statuses.count("early_leave")
        excused_count = obs_statuses.count("excused")
        absent_count = obs_statuses.count("absent")

        # Tỷ lệ phần trăm
        attendance_rate = round(((present_count + late_count + excused_count + early_leave_count) / k) * 100.0, 2)
        absence_rate = round((absent_count / k) * 100.0, 2)
        late_rate = round((late_count / k) * 100.0, 2)

        # Tỷ lệ vắng trong 3 buổi gần nhất của cửa sổ quan sát
        recent_window = obs_statuses[-3:] if k >= 3 else obs_statuses
        recent_absence_rate = round((recent_window.count("absent") / len(recent_window)) * 100.0, 2)

        # Chuỗi vắng liên tiếp tính từ buổi K ngược về trước
        consecutive_absence = 0
        for s in reversed(obs_statuses):
            if s == "absent":
                consecutive_absence += 1
            else:
                break

        # Xu hướng chuyên cần (Trend): Tỷ lệ có mặt nửa sau so với nửa đầu của cửa sổ quan sát
        mid = k // 2
        if mid > 0:
            first_half = obs_statuses[:mid]
            second_half = obs_statuses[mid:]
            first_rate = (first_half.count("present") + first_half.count("late") + first_half.count("excused")) / len(first_half)
            second_rate = (second_half.count("present") + second_half.count("late") + second_half.count("excused")) / len(second_half)
            attendance_trend = round((second_rate - first_rate) * 100.0, 2)
        else:
            attendance_trend = 0.0

        return {
            "total_sessions": float(k),
            "present_count": float(present_count),
            "late_count": float(late_count),
            "early_leave_count": float(early_leave_count),
            "excused_count": float(excused_count),
            "absent_count": float(absent_count),
            "attendance_rate": attendance_rate,
            "absence_rate": absence_rate,
            "late_rate": late_rate,
            "recent_absence_rate": recent_absence_rate,
            "consecutive_absence": float(consecutive_absence),
            "attendance_trend": attendance_trend,
        }

    def determine_target_label(self, all_statuses: List[str]) -> Tuple[int, float, float]:
        """
        Xác định nhãn mục tiêu y (Ground Truth) dựa trên TOÀN BỘ buổi học của học phần đến cuối kỳ:
        - risk = 1: Nếu tổng kết cuối kỳ tỷ lệ vắng >= 20% HOẶC điểm chuyên cần < 7.0
        - risk = 0: An toàn
        """
        total_sessions = len(all_statuses)
        if total_sessions == 0:
            return 0, 0.0, 10.0

        absent_count = all_statuses.count("absent")
        final_absence_rate = (absent_count / total_sessions) * 100.0

        # Tính điểm chuyên cần tổng kết cuối kỳ
        present_count = all_statuses.count("present")
        late_count = all_statuses.count("late")
        early_leave_count = all_statuses.count("early_leave")
        excused_count = all_statuses.count("excused")

        final_score = (
            10.0
            - absent_count * 2.0
            - late_count * 0.5
            - early_leave_count * 0.5
            - excused_count * 0.0
        )
        final_score = max(0.0, min(10.0, round(final_score, 2)))

        # Nhãn mục tiêu: Vượt ngưỡng vắng cấm thi hoặc điểm chuyên cần dưới chuẩn
        risk = 1 if (final_absence_rate >= self.exam_ban_threshold or final_score < 7.0) else 0

        return risk, round(final_absence_rate, 2), final_score

    def build_real_dataset(self, raw_data_dir: str) -> pd.DataFrame:
        """
        Trích xuất dataset từ dữ liệu thô MongoDB đã lưu trong data/raw/
        """
        attendances_path = os.path.join(raw_data_dir, "raw_attendances.csv")
        sessions_path = os.path.join(raw_data_dir, "raw_class_sessions.csv")

        print("-> Đang đọc dữ liệu thô MongoDB...")
        df_att = pd.read_csv(attendances_path, usecols=["classSessionId", "courseSectionId", "studentId", "status"])
        df_sess = pd.read_csv(sessions_path, usecols=["_id", "courseSectionId", "date"])
        df_sess["date"] = pd.to_datetime(df_sess["date"])

        # Sắp xếp các buổi học theo thời gian
        df_sess = df_sess.sort_values(["courseSectionId", "date"]).reset_index(drop=True)

        # Merge buổi học với thông tin điểm danh
        merged = df_att.merge(
            df_sess.rename(columns={"_id": "classSessionId", "date": "sessionDate"}),
            on=["classSessionId", "courseSectionId"],
            how="inner"
        )
        merged = merged.sort_values(["studentId", "courseSectionId", "sessionDate"])

        # Gom nhóm theo từng sinh viên trong từng lớp học phần
        grouped = merged.groupby(["studentId", "courseSectionId"])
        print(f"-> Tổng số cặp (Sinh viên, Lớp học phần) ghi nhận: {len(grouped)}")

        records = []
        for (s_id, sec_id), group in grouped:
            statuses = group["status"].tolist()
            t = len(statuses)
            # Chỉ xét các môn có từ 5 buổi trở lên để đảm bảo tính chuỗi thời gian
            if t < 5:
                continue

            k = max(3, int(round(t * self.observation_ratio)))
            features = self.extract_features_from_session_sequence(statuses, k)
            risk, final_abs_rate, final_score = self.determine_target_label(statuses)

            features["student_id"] = s_id
            features["course_section_id"] = sec_id
            features["full_course_sessions"] = t
            features["observation_sessions"] = k
            features["final_absence_rate"] = final_abs_rate
            features["final_score"] = final_score
            features["risk"] = risk
            features["is_synthetic"] = 0

            records.append(features)

        df_real = pd.DataFrame(records)
        print(f"-> Đã trích xuất thành công {len(df_real)} mẫu thực nghiệm từ MongoDB Atlas.")
        return df_real

    def generate_synthetic_profiles(self, n_samples: int = 3500, random_state: int = 42) -> pd.DataFrame:
        """
        Sinh thêm dữ liệu mô phỏng theo quy luật chuỗi thời gian (Markov behavioral profiles)
        để bổ sung các trường hợp biên và cân bằng dữ liệu huấn luyện.
        ĐÁNH DẤU RÕ: is_synthetic = 1
        """
        np.random.seed(random_state)
        records = []

        # Các nhóm hành vi thực tế trong môi trường đại học:
        # 1. Chăm chỉ / Xuất sắc (Good attendance): 40%
        # 2. Nguy cơ từ từ (Gradual decline): 25%
        # 3. Bỏ học đột ngột / Vắng liên tiếp (Drop-out): 15%
        # 4. Đi muộn nhiều / Thiếu kỷ luật (Chronic tardiness): 10%
        # 5. Nghỉ ốm có phép (Excused illness): 10%

        profiles = ["good", "gradual_decline", "dropout", "late_heavy", "excused_illness"]
        probs = [0.40, 0.25, 0.15, 0.10, 0.10]

        for i in range(n_samples):
            t = np.random.randint(12, 21)  # Khóa học từ 12 đến 20 buổi
            k = max(4, int(round(t * self.observation_ratio)))
            profile = np.random.choice(profiles, p=probs)

            statuses = []
            for session_idx in range(t):
                rel_pos = session_idx / t  # Vị trí tương đối trong môn học (0.0 -> 1.0)

                if profile == "good":
                    # Xác suất có mặt cao > 90%
                    p = [0.88, 0.08, 0.01, 0.02, 0.01]  # present, late, early, excused, absent
                elif profile == "gradual_decline":
                    # Càng về cuối càng vắng nhiều
                    abs_p = min(0.65, 0.05 + rel_pos * 0.55)
                    pres_p = max(0.20, 0.85 - rel_pos * 0.60)
                    rem = 1.0 - (abs_p + pres_p)
                    p = [pres_p, rem * 0.4, rem * 0.2, rem * 0.2, abs_p]
                elif profile == "dropout":
                    # Bỏ học từ sau giữa kỳ
                    if rel_pos > 0.45:
                        p = [0.05, 0.02, 0.0, 0.05, 0.88]
                    else:
                        p = [0.80, 0.10, 0.02, 0.03, 0.05]
                elif profile == "late_heavy":
                    # Đi muộn rất nhiều
                    p = [0.45, 0.35, 0.10, 0.02, 0.08]
                else:  # excused_illness
                    p = [0.70, 0.05, 0.02, 0.20, 0.03]

                # Chuẩn hóa xác suất
                p = np.array(p)
                p /= p.sum()

                chosen = np.random.choice(["present", "late", "early_leave", "excused", "absent"], p=p)
                statuses.append(chosen)

            features = self.extract_features_from_session_sequence(statuses, k)
            risk, final_abs_rate, final_score = self.determine_target_label(statuses)

            features["student_id"] = f"SYNTH_STU_{i+1:05d}"
            features["course_section_id"] = f"SYNTH_CRS_{i%50 + 1:03d}"
            features["full_course_sessions"] = t
            features["observation_sessions"] = k
            features["final_absence_rate"] = final_abs_rate
            features["final_score"] = final_score
            features["risk"] = risk
            features["is_synthetic"] = 1

            records.append(features)

        df_synth = pd.DataFrame(records)
        return df_synth
