import os
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient


# ============================================================
# 1. ĐỌC CẤU HÌNH
# ============================================================

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")


# ============================================================
# 2. KẾT NỐI MONGODB
# ============================================================

client = MongoClient(MONGODB_URI)

db = client[DATABASE_NAME]

print("Kết nối MongoDB thành công!")


# ============================================================
# 3. LẤY DỮ LIỆU ĐIỂM DANH
# ============================================================

attendance_df = pd.DataFrame(
    list(db["attendances"].find())
)


# ============================================================
# 4. CHỈ GIỮ CÁC CỘT CẦN THIẾT
# ============================================================

attendance_df = attendance_df[
    [
        "studentId",
        "courseSectionId",
        "status"
    ]
]


# ============================================================
# 5. ĐẾM SỐ LẦN THEO TỪNG TRẠNG THÁI
# ============================================================

grouped = attendance_df.groupby(
    ["studentId", "courseSectionId"]
)


status_count = (
    grouped["status"]
    .value_counts()
    .unstack(fill_value=0)
)


# ============================================================
# 6. ĐẢM BẢO CÁC CỘT LUÔN TỒN TẠI
# ============================================================

for status in [
    "present",
    "late",
    "early_leave",
    "excused",
    "absent"
]:
    if status not in status_count.columns:
        status_count[status] = 0


# ============================================================
# 7. TÍNH TỔNG SỐ BUỔI
# ============================================================

status_count["totalSessions"] = (
    status_count[
        [
            "present",
            "late",
            "early_leave",
            "excused",
            "absent"
        ]
    ].sum(axis=1)
)


# ============================================================
# 8. QUY ĐỔI TRẠNG THÁI THÀNH ĐIỂM
# ============================================================

status_count["attendanceScore"] = (
    status_count["present"] * 1.0
    + status_count["late"] * 0.5
    + status_count["early_leave"] * 0.5
    + status_count["excused"] * 1.0
)


# ============================================================
# 9. TÍNH ĐIỂM CHUYÊN CẦN %
# ============================================================

status_count["attendanceScorePercent"] = (
    status_count["attendanceScore"]
    / status_count["totalSessions"]
    * 100
)


# ============================================================
# 10. HIỂN THỊ KẾT QUẢ
# ============================================================

result = status_count[
    [
        "present",
        "late",
        "early_leave",
        "excused",
        "absent",
        "totalSessions",
        "attendanceScore",
        "attendanceScorePercent"
    ]
]

print("\n===== ĐIỂM CHUYÊN CẦN =====")

print(result.head(20))