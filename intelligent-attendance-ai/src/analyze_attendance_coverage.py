import os
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("DATABASE_NAME")]

# ==========================================
# CLASS SESSIONS
# ==========================================

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

sessions_df["date"] = pd.to_datetime(
    sessions_df["date"]
)

sessions_df = sessions_df.sort_values(
    ["courseSectionId", "date"]
)

sessions_df["sessionNumber"] = (
    sessions_df
    .groupby("courseSectionId")
    .cumcount() + 1
)

# ==========================================
# ATTENDANCES
# ==========================================

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

# ==========================================
# JOIN
# ==========================================

merged = attendance_df.merge(
    sessions_df[
        [
            "_id",
            "courseSectionId",
            "date",
            "sessionNumber"
        ]
    ],
    left_on="classSessionId",
    right_on="_id",
    how="left",
    suffixes=("", "_session")
)

# ==========================================
# COVERAGE THEO STUDENT + COURSE
# ==========================================

coverage = (
    merged
    .groupby(
        [
            "studentId",
            "courseSectionId"
        ]
    )
    .agg(
        attendanceRecords=("classSessionId", "count"),
        minSession=("sessionNumber", "min"),
        maxSession=("sessionNumber", "max"),
        uniqueSessions=("classSessionId", "nunique")
    )
    .reset_index()
)

# ==========================================
# PHÂN BỐ MIN SESSION
# ==========================================

print("\n===== PHÂN BỐ MIN SESSION =====")

print(
    coverage["minSession"]
    .value_counts()
    .sort_index()
)

# ==========================================
# PHÂN BỐ MAX SESSION
# ==========================================

print("\n===== PHÂN BỐ MAX SESSION =====")

print(
    coverage["maxSession"]
    .value_counts()
    .sort_index()
)

# ==========================================
# PHÂN BỐ KHOẢNG SESSION
# ==========================================

print("\n===== MIN / MAX =====")

print(
    coverage[
        [
            "minSession",
            "maxSession",
            "attendanceRecords"
        ]
    ].describe()
)

# ==========================================
# MỘT SỐ MẪU
# ==========================================

print("\n===== 20 MẪU =====")

print(
    coverage.head(20).to_string(index=False)
)

# ==========================================
# KIỂM TRA CÓ PHẢI LIÊN TỤC KHÔNG
# ==========================================

def is_continuous(group):

    numbers = sorted(
        group["sessionNumber"]
        .dropna()
        .astype(int)
        .unique()
    )

    if len(numbers) == 0:
        return False

    expected = list(
        range(
            numbers[0],
            numbers[-1] + 1
        )
    )

    return numbers == expected


continuity = (
    merged
    .groupby(
        [
            "studentId",
            "courseSectionId"
        ]
    )
    .apply(
        is_continuous,
        include_groups=False
    )
)

print("\n===== SESSION LIÊN TỤC =====")

print(
    continuity.value_counts()
)