import os
import sys
import io
import json
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient

# Đảm bảo in tiếng Việt UTF-8 trên Windows console
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

load_dotenv()


def extract_raw_data_from_mongodb():
    """
    Trích xuất toàn bộ dữ liệu thô từ MongoDB Atlas:
    - attendances (78,242+ records)
    - class_sessions (872+ records)
    - course_sections (16+ records)
    - enrollments (2,608+ records)
    - users (163+ records)
    - attendance_configs (1 record)
    """
    mongo_uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DATABASE_NAME", "intelligent-attendance")

    print(f"-> Đang kết nối tới MongoDB: {db_name}...")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)
    db = client[db_name]

    raw_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "raw")
    os.makedirs(raw_dir, exist_ok=True)

    # 1. Trích xuất class_sessions
    print("-> Đang trích xuất class_sessions...")
    sessions = list(db["class_sessions"].find({}, {"_id": 1, "courseSectionId": 1, "date": 1, "startPeriod": 1, "numPeriods": 1, "status": 1, "room": 1}))
    df_sessions = pd.DataFrame(sessions)
    if not df_sessions.empty:
        df_sessions["_id"] = df_sessions["_id"].astype(str)
        df_sessions["courseSectionId"] = df_sessions["courseSectionId"].astype(str)
        df_sessions["date"] = pd.to_datetime(df_sessions["date"])
        df_sessions.to_csv(os.path.join(raw_dir, "raw_class_sessions.csv"), index=False, encoding="utf-8")
        print(f"   [OK] Đã lưu {len(df_sessions)} class_sessions vào raw_class_sessions.csv")

    # 2. Trích xuất course_sections
    print("-> Đang trích xuất course_sections...")
    sections = list(db["course_sections"].find({}, {"_id": 1, "sectionCode": 1, "subjectId": 1, "semesterId": 1, "academicYearId": 1, "status": 1}))
    df_sections = pd.DataFrame(sections)
    if not df_sections.empty:
        df_sections["_id"] = df_sections["_id"].astype(str)
        df_sections["subjectId"] = df_sections["subjectId"].astype(str)
        df_sections.to_csv(os.path.join(raw_dir, "raw_course_sections.csv"), index=False, encoding="utf-8")
        print(f"   [OK] Đã lưu {len(df_sections)} course_sections vào raw_course_sections.csv")

    # 3. Trích xuất enrollments
    print("-> Đang trích xuất enrollments...")
    enrollments = list(db["enrollments"].find({"status": "enrolled"}, {"_id": 1, "studentId": 1, "courseSectionId": 1, "status": 1}))
    df_enrollments = pd.DataFrame(enrollments)
    if not df_enrollments.empty:
        df_enrollments["_id"] = df_enrollments["_id"].astype(str)
        df_enrollments["studentId"] = df_enrollments["studentId"].astype(str)
        df_enrollments["courseSectionId"] = df_enrollments["courseSectionId"].astype(str)
        df_enrollments.to_csv(os.path.join(raw_dir, "raw_enrollments.csv"), index=False, encoding="utf-8")
        print(f"   [OK] Đã lưu {len(df_enrollments)} enrollments vào raw_enrollments.csv")

    # 4. Trích xuất users
    print("-> Đang trích xuất users...")
    users = list(db["users"].find({}, {"_id": 1, "fullName": 1, "userCode": 1, "email": 1, "roleCode": 1}))
    df_users = pd.DataFrame(users)
    if not df_users.empty:
        df_users["_id"] = df_users["_id"].astype(str)
        df_users.to_csv(os.path.join(raw_dir, "raw_users.csv"), index=False, encoding="utf-8")
        print(f"   [OK] Đã lưu {len(df_users)} users vào raw_users.csv")

    # 5. Trích xuất attendances (Toàn bộ 78,242+ records)
    print("-> Đang trích xuất attendances (có thể mất 5-10 giây)...")
    attendances = list(db["attendances"].find({}, {
        "_id": 1,
        "classSessionId": 1,
        "courseSectionId": 1,
        "studentId": 1,
        "checkInTime": 1,
        "checkOutTime": 1,
        "status": 1,
        "method": 1,
        "createdAt": 1
    }))
    df_attendances = pd.DataFrame(attendances)
    if not df_attendances.empty:
        df_attendances["_id"] = df_attendances["_id"].astype(str)
        df_attendances["classSessionId"] = df_attendances["classSessionId"].astype(str)
        df_attendances["courseSectionId"] = df_attendances["courseSectionId"].astype(str)
        df_attendances["studentId"] = df_attendances["studentId"].astype(str)
        df_attendances["checkInTime"] = pd.to_datetime(df_attendances["checkInTime"])
        df_attendances["checkOutTime"] = pd.to_datetime(df_attendances["checkOutTime"])
        df_attendances["createdAt"] = pd.to_datetime(df_attendances["createdAt"])
        df_attendances.to_csv(os.path.join(raw_dir, "raw_attendances.csv"), index=False, encoding="utf-8")
        print(f"   [OK] Đã lưu {len(df_attendances)} attendances vào raw_attendances.csv")

    print("\n[THÀNH CÔNG] Toàn bộ dữ liệu thô từ MongoDB đã được trích xuất hoàn tất vào thư mục data/raw/")
    return {
        "sessions": len(df_sessions),
        "sections": len(df_sections),
        "enrollments": len(df_enrollments),
        "users": len(df_users),
        "attendances": len(df_attendances),
    }


if __name__ == "__main__":
    extract_raw_data_from_mongodb()
