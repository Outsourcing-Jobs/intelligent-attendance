import os
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("DATABASE_NAME")]

sessions = list(
    db["class_sessions"].find(
        {"status": "completed"},
        {
            "_id": 1,
            "courseSectionId": 1,
            "date": 1,
            "status": 1
        }
    )
)

df = pd.DataFrame(sessions)

print("===== SỐ COURSE SECTION =====")
print(df["courseSectionId"].nunique())

print("\n===== SỐ SESSION / COURSE SECTION =====")

session_counts = (
    df.groupby("courseSectionId")
      .size()
      .value_counts()
      .sort_index()
)

print(session_counts)

print("\n===== THỐNG KÊ =====")
print(
    df.groupby("courseSectionId")
      .size()
      .describe()
)