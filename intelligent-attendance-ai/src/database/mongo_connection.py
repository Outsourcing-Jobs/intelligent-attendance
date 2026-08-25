import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Đọc biến môi trường từ file .env
load_dotenv()

# Lấy URI và tên Database
MONGO_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Kết nối MongoDB
client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]


print("Kết nối MongoDB thành công!")

print("Danh sách Collection:")

for collection in db.list_collection_names():
    print("-", collection)