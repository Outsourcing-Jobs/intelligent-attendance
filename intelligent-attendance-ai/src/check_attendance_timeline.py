import os
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("DATABASE_NAME")]

# =========================================================
# 1. LẤY CLASS SESSIONS
# =========================================================

sessions = list(
    db["class_sessions"].find(
        {"status": "completed"},
        {
            "_id": 1,
            "courseSectionId": 1,
            "date": 1
        }
    )
)

sessions_df = pd.DataFrame(sessions)

print("===== CLASS SESSIONS =====")
print("Số session:", len(sessions_df))
print("Số course section:", sessions_df["courseSectionId"].nunique())


# =========================================================
# 2. SẮP XẾP SESSION THEO THỜI GIAN
# =========================================================

sessions_df["date"] = pd.to_datetime(
    sessions_df["date"]
)

sessions_df = sessions_df.sort_values(
    ["courseSectionId", "date"]
)

# Đánh số thứ tự buổi học trong từng course
sessions_df["sessionNumber"] = (
    sessions_df
    .groupby("courseSectionId")
    .cumcount()
    + 1
)

print("\n===== SESSION COUNT =====")

print(
    sessions_df
    .groupby("courseSectionId")
    .size()
    .value_counts()
    .sort_index()
)


# =========================================================
# 3. LẤY ATTENDANCES
# =========================================================

attendances = list(
    db["attendances"].find(
        {},
        {
            "studentId": 1,
            "courseSectionId": 1,
            "classSessionId": 1,
            "status": 1
        }
    )
)

attendance_df = pd.DataFrame(attendances)

print("\n===== ATTENDANCE =====")
print("Số attendance:", len(attendance_df))


# =========================================================
# 4. CHỈ LẤY CÁC CỘT CẦN THIẾT TỪ SESSION
# =========================================================

session_lookup = sessions_df[
    [
        "_id",
        "courseSectionId",
        "date",
        "sessionNumber"
    ]
].copy()

# Đổi tên để tránh trùng courseSectionId
session_lookup = session_lookup.rename(
    columns={
        "courseSectionId": "sessionCourseSectionId"
    }
)


# =========================================================
# 5. GHÉP ATTENDANCE → SESSION
# =========================================================

merged = attendance_df.merge(
    session_lookup,
    left_on="classSessionId",
    right_on="_id",
    how="left"
)


# =========================================================
# 6. KIỂM TRA JOIN
# =========================================================

print("\n===== KIỂM TRA JOIN =====")

print(
    "Attendance không tìm thấy session:",
    merged["sessionNumber"].isna().sum()
)

print(
    "Attendance tìm thấy session:",
    merged["sessionNumber"].notna().sum()
)


# =========================================================
# 7. DÙNG COURSE SECTION TỪ ATTENDANCE
# =========================================================

# courseSectionId ban đầu vẫn nằm trong attendance_df
# sessionCourseSectionId là courseSectionId lấy từ class_sessions

merged["courseSectionMatch"] = (
    merged["courseSectionId"]
    ==
    merged["sessionCourseSectionId"]
)

print("\n===== KIỂM TRA COURSE SECTION =====")

print(
    merged["courseSectionMatch"]
    .value_counts()
)


# =========================================================
# 8. CHỌN 1 SINH VIÊN ĐỂ KIỂM TRA
# =========================================================

student_id = attendance_df["studentId"].iloc[0]

print("\n===== STUDENT =====")
print(student_id)


student_data = (
    merged[
        merged["studentId"] == student_id
    ]
    .sort_values(
        [
            "courseSectionId",
            "sessionNumber"
        ]
    )
)


# =========================================================
# 9. HIỂN THỊ TIMELINE
# =========================================================

print("\n===== COURSE SECTION / SESSION =====")

print(
    student_data[
        [
            "courseSectionId",
            "sessionNumber",
            "date",
            "status"
        ]
    ].to_string(index=False)
)


# =========================================================
# 10. THỐNG KÊ SESSION NUMBER
# =========================================================

print("\n===== SESSION NUMBER =====")

print(
    student_data["sessionNumber"]
    .describe()
)


print("\n===== MIN / MAX =====")

print(
    "Min:",
    student_data["sessionNumber"].min()
)

print(
    "Max:",
    student_data["sessionNumber"].max()
)