# ==========================================
# Python AI/ML Service Dockerfile
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Thiết lập biến môi trường cho Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    AI_SERVICE_PORT=8000

# Cài đặt system dependencies nếu cần
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt Python packages trước để tối ưu layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn và pre-trained models
COPY . .

# Expose port (Render sẽ tự inject PORT khi chạy)
EXPOSE 8000

# Chạy Uvicorn server với Dynamic PORT binding
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
