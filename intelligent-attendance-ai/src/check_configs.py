import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pprint import pprint

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("DATABASE_NAME")]

print("===== ATTENDANCE CONFIGS =====")

for item in db["attendance_configs"].find():
    pprint(item)

print("\n===== CONFIGS =====")

for item in db["configs"].find():
    pprint(item)