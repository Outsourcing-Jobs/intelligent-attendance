import os
import sys
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Đảm bảo đường dẫn import và UTF-8
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

from src.prediction.predictor import WarningPredictor

predictor: Optional[WarningPredictor] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo mô hình khi server start
    global predictor
    try:
        predictor = WarningPredictor()
        print("-> WarningPredictor đã nạp thành công mô hình học máy!")
    except Exception as e:
        print(f"-> Cảnh báo khởi tạo Predictor: {e}")
    yield
    # Cleanup khi server tắt
    if predictor and predictor.extractor:
        predictor.extractor.close()


app = FastAPI(
    title="Intelligent Attendance AI Service",
    description="Hệ thống AI/ML dự báo và cảnh báo điểm chuyên cần cho Đồ án Tốt nghiệp",
    version="1.0.0",
    lifespan=lifespan,
)

# Cấu hình CORS để Next.js Frontend và NestJS Backend có thể gọi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictWarningRequest(BaseModel):
    student_id: str = Field(
        ...,
        description="Mã định danh sinh viên (studentId trong CSDL)",
        examples=["6a71f25456c0266186cf59ad"],
    )
    course_section_id: Optional[str] = Field(
        None,
        description="Mã lớp học phần (courseSectionId trong CSDL)",
        examples=["6a71f25956c0266186cf5ab6"],
    )
    class_id: Optional[str] = Field(
        None,
        description="Bí danh tương đương với course_section_id nếu client truyền vào class_id",
        examples=["6a71f25956c0266186cf5ab6"],
    )


class RecommendationResponse(BaseModel):
    for_student: str
    for_lecturer: str


class PredictWarningResponse(BaseModel):
    success: bool
    data: Dict[str, Any]


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Intelligent Attendance AI Service",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/api/warning/health", tags=["Health"])
def health_check():
    is_ready = predictor is not None and predictor.model is not None
    return {
        "status": "healthy" if is_ready else "unhealthy",
        "model_loaded": is_ready,
        "best_model": predictor.metadata.get("best_model_name", "N/A") if predictor else "N/A",
    }


@app.get("/api/warning/models", tags=["Machine Learning"])
def get_model_metadata():
    """
    Trả về thông tin chi tiết các mô hình đã huấn luyện và các chỉ số đánh giá.
    """
    if predictor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Predictor chưa được khởi tạo.",
        )
    return {
        "success": True,
        "metadata": predictor.metadata,
    }


@app.post(
    "/api/warning/predict",
    response_model=PredictWarningResponse,
    tags=["Prediction"],
    summary="Dự báo nguy cơ chuyên cần thấp và sinh khuyến nghị",
)
@app.post(
    "/predict",
    response_model=PredictWarningResponse,
    tags=["Prediction"],
    summary="Alias dự báo nguy cơ chuyên cần",
)
def predict_warning(request: PredictWarningRequest):
    """
    Nhận `student_id` và `course_section_id` (hoặc `class_id`),
    tự động lấy dữ liệu điểm danh từ CSDL MongoDB -> đưa qua mô hình ML -> trả về kết quả dự báo.
    """
    target_course_id = request.course_section_id or request.class_id
    if not target_course_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cần cung cấp course_section_id hoặc class_id!",
        )

    if predictor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Mô hình AI chưa sẵn sàng.",
        )

    try:
        result = predictor.predict(
            student_id=request.student_id,
            course_section_id=target_course_id,
        )
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi thực hiện dự báo: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
