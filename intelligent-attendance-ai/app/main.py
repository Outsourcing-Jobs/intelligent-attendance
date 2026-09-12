"""
FastAPI AI Microservice cho Hệ Thống Điểm Danh Thông Minh.
Cung cấp API suy luận rủi ro chuyên cần và cảnh báo sớm sinh viên.
"""

import os
import sys
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Đảm bảo UTF-8 và sys.path
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

current_dir = os.path.dirname(os.path.abspath(__file__))
ai_root = os.path.abspath(os.path.join(current_dir, ".."))
if ai_root not in sys.path:
    sys.path.insert(0, ai_root)

from app.schemas import (
    PredictRequest,
    PredictResponse,
    HealthResponse,
)
from app.services.prediction_service import PredictionService

# Service singleton
prediction_service: Optional[PredictionService] = None
extractor = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global prediction_service, extractor
    print("=" * 60)
    print(" Khởi động Intelligent Attendance AI Service...")
    print("=" * 60)
    try:
        prediction_service = PredictionService(base_dir=ai_root)
        print(f"✓ Đã nạp thành công mô hình: [{prediction_service.model_name}]")
    except Exception as e:
        print(f"✗ Lỗi khi khởi tạo PredictionService: {e}")

    try:
        from src.feature_engineering import AttendanceFeatureExtractor
        extractor = AttendanceFeatureExtractor()
        print("✓ Đã kết nối MongoDB AttendanceFeatureExtractor.")
    except Exception as e:
        print(f"! Lưu ý AttendanceFeatureExtractor: {e}")

    yield

    # Cleanup khi shutdown
    if extractor:
        try:
            extractor.close()
            print("✓ Đã đóng kết nối FeatureExtractor.")
        except Exception:
            pass


app = FastAPI(
    title="Intelligent Attendance AI Service",
    description="FastAPI Microservice dự báo nguy cơ chuyên cần và cảnh báo cấm thi (Early Warning).",
    version="1.0.0",
    lifespan=lifespan,
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Intelligent Attendance AI Service",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
@app.get("/api/warning/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    is_ready = prediction_service is not None and prediction_service.is_ready()
    model_name = prediction_service.model_name if prediction_service else "None"
    return HealthResponse(
        status="ok" if is_ready else "degraded",
        model_loaded=is_ready,
        model_name=model_name,
        version="1.0.0",
        timestamp=datetime.now().isoformat(),
    )


@app.get("/models/metadata", tags=["Machine Learning"])
@app.get("/api/warning/models", tags=["Machine Learning"])
def get_model_metadata():
    """Trả về chi tiết metadata của mô hình ML và kết quả đánh giá thực nghiệm."""
    if prediction_service is None or not prediction_service.metadata:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Metadata mô hình chưa sẵn sàng.",
        )
    return {
        "success": True,
        "data": prediction_service.metadata,
    }


@app.post(
    "/predict",
    response_model=PredictResponse,
    tags=["Prediction"],
    summary="Dự báo rủi ro chuyên cần từ 12 features hoặc student_id + course_section_id",
)
@app.post(
    "/api/warning/predict",
    response_model=PredictResponse,
    tags=["Prediction"],
    summary="Alias dự báo rủi ro chuyên cần",
)
def predict_attendance_risk(request: PredictRequest):
    """
    Endpoint chính để dự báo nguy cơ cấm thi / sa sút chuyên cần:
    - Cách 1: Truyền trực tiếp `features` (12 đặc trưng). NestJS tính sẵn từ MongoDB -> Rất nhanh và tin cậy.
    - Cách 2: Truyền `student_id` và `course_section_id` (hoặc `class_id`). Service tự truy vấn MongoDB.
    """
    if prediction_service is None or not prediction_service.is_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Mô hình AI chưa sẵn sàng phục vụ.",
        )

    target_course_id = request.course_section_id or request.class_id

    # Cách 1: Sử dụng features truyền trực tiếp
    if request.features is not None:
        try:
            features_dict = request.features.model_dump()
            return prediction_service.predict_from_features(
                features_dict=features_dict,
                student_id=request.student_id,
                course_section_id=target_course_id,
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Lỗi khi dự báo từ đặc trưng: {str(e)}",
            )

    # Cách 2: Sử dụng student_id và course_section_id để query DB
    if request.student_id and target_course_id:
        if extractor is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Kết nối FeatureExtractor tới cơ sở dữ liệu chưa sẵn sàng.",
            )
        try:
            db_features = extractor.extract_features_for_student(
                student_id=request.student_id,
                course_section_id=target_course_id,
            )
            return prediction_service.predict_from_features(
                features_dict=db_features,
                student_id=request.student_id,
                course_section_id=target_course_id,
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Lỗi khi trích xuất dữ liệu và dự báo: {str(e)}",
            )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Cần cung cấp đối tượng 'features' (12 đặc trưng) hoặc cặp ('student_id', 'course_section_id')!",
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("AI_SERVICE_PORT", "8001"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
