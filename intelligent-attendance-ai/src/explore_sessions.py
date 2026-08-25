import os
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("DATABASE_NAME")]

sessions = list(
    db["class_sessions"].find()
)

df = pd.DataFrame(sessions)

print("===== SHAPE =====")
print(df.shape)

print("\n===== COLUMNS =====")
print(df.columns.tolist())

print("\n===== STATUS =====")
print(df["status"].value_counts())

print("\n===== SAMPLE =====")
print(
    df[
        [
            "courseSectionId",
            "date",
            "startPeriod",
            "numPeriods",
            "status"
        ]
    ].sort_values("date").head(20)
)