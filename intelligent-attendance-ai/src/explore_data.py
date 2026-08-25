import os
from dotenv import load_dotenv
from pymongo import MongoClient
import pandas as pd

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("DATABASE_NAME")]

attendance_collection = db["attendances"]

attendance_data = list(attendance_collection.find())

df = pd.DataFrame(attendance_data)

# print(df.head())
print("=" * 60)
print(df.head())

print("=" * 60)
print(df.info())

print("=" * 60)
print(df.shape)

print("=" * 60)
print(df.columns)

print("=" * 60)
print(df.isnull().sum())

print("=" * 60)
print(df["status"].value_counts())