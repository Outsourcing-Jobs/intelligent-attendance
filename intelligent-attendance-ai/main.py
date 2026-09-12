"""
Entry point cho FastAPI AI Service.
Import và export app từ app.main để duy trì khả năng tương thích cao nhất.
"""

import os
import sys

# Đảm bảo UTF-8 và sys.path
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.main import app

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("AI_SERVICE_PORT", "8001"))
    print(f"-> Đang khởi chạy Intelligent Attendance AI Service trên cổng {port}...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
