import os
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("DATABASE_NAME")]

# ==============================
# CLASS SESSIONS
# ==============================

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

# Đếm số session thực tế của từng course
session_counts = (
    sessions_df
    .groupby("courseSectionId")
    .size()
    .reset_index(name="actualSessions")
)

# ==============================
# ATTENDANCES
# ==============================

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

# ==============================
# SỐ ATTENDANCE / STUDENT / COURSE
# ==============================

student_course_counts = (
    attendance_df
    .groupby(["studentId", "courseSectionId"])
    .size()
    .reset_index(name="attendanceRecords")
)

# ==============================
# GHÉP VỚI SỐ SESSION THỰC TẾ
# ==============================

check_df = student_course_counts.merge(
    session_counts,
    on="courseSectionId",
    how="left"
)

print("===== SỐ MẪU =====")
print(check_df.shape)

print("\n===== PHÂN BỐ SỐ ATTENDANCE RECORD =====")
print(
    check_df["attendanceRecords"]
    .value_counts()
    .sort_index()
)

print("\n===== PHÂN BỐ SỐ SESSION THỰC TẾ =====")
print(
    check_df["actualSessions"]
    .value_counts()
    .sort_index()
)

print("\n===== SO SÁNH =====")

check_df["isComplete"] = (
    check_df["attendanceRecords"]
    == check_df["actualSessions"]
)

print(
    check_df["isComplete"]
    .value_counts()
)

print("\n===== CÁC MẪU KHÔNG ĐỦ ATTENDANCE =====")

print(
    check_df[
        check_df["isComplete"] == False
    ].head(20)
)