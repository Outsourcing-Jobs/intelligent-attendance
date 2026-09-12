"""
Pydantic Schemas cho FastAPI AI Service.
Định nghĩa cấu trúc dữ liệu đầu vào và đầu ra cho API dự báo rủi ro chuyên cần.
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class AttendanceFeaturesInput(BaseModel):
    total_sessions: float = Field(..., ge=0, description="Tổng số buổi học trong cửa sổ quan sát", examples=[15.0])
    present_count: float = Field(..., ge=0, description="Số buổi có mặt", examples=[10.0])
    late_count: float = Field(0.0, ge=0, description="Số buổi đi muộn", examples=[2.0])
    early_leave_count: float = Field(0.0, ge=0, description="Số buổi về sớm", examples=[1.0])
    excused_count: float = Field(0.0, ge=0, description="Số buổi vắng có phép", examples=[1.0])
    absent_count: float = Field(0.0, ge=0, description="Số buổi vắng không phép", examples=[1.0])
    attendance_rate: float = Field(..., ge=0.0, le=1.0, description="Tỷ lệ có mặt (0.0 - 1.0)", examples=[0.6667])
    absence_rate: float = Field(..., ge=0.0, le=1.0, description="Tỷ lệ vắng (0.0 - 1.0)", examples=[0.0667])
    late_rate: float = Field(0.0, ge=0.0, le=1.0, description="Tỷ lệ đi muộn", examples=[0.1333])
    recent_absence_rate: float = Field(0.0, ge=0.0, le=1.0, description="Tỷ lệ vắng trong 3 buổi gần nhất", examples=[0.3333])
    consecutive_absence: float = Field(0.0, ge=0, description="Số buổi vắng liên tiếp hiện tại", examples=[1.0])
    attendance_trend: float = Field(0.0, description="Xu hướng điểm danh (nửa sau - nửa trước)", examples=[-0.2])


class PredictRequest(BaseModel):
    student_id: Optional[str] = Field(None, description="Mã sinh viên", examples=["6a71f25456c0266186cf59ad"])
    course_section_id: Optional[str] = Field(None, description="Mã lớp học phần", examples=["6a71f25956c0266186cf5ab6"])
    class_id: Optional[str] = Field(None, description="Alias tương đương course_section_id")
    features: Optional[AttendanceFeaturesInput] = Field(None, description="Vector 12 đặc trưng truyền trực tiếp")


class RiskLevelInfo(BaseModel):
    level: str = Field(..., description="LOW, MEDIUM hoặc HIGH", examples=["HIGH"])
    label: str = Field(..., description="Nhãn tiếng Việt: An toàn, Cần chú ý, Nguy cơ cao", examples=["Nguy cơ cao"])
    color: str = Field(..., description="Màu sắc đại diện: green, yellow, red", examples=["red"])
    probability_range: List[float] = Field(..., description="Khoảng xác suất tương ứng", examples=[[0.7, 1.0]])
    description: str = Field(..., description="Mô tả trạng thái", examples=["Rất gần ngưỡng cấm thi (>20% vắng)"])


class RecommendationInfo(BaseModel):
    for_student: str = Field(..., description="Khuyến nghị dành cho sinh viên")
    for_lecturer: str = Field(..., description="Khuyến nghị dành cho giảng viên phụ trách")


class PredictResponse(BaseModel):
    success: bool = True
    student_id: Optional[str] = None
    course_section_id: Optional[str] = None
    risk: str = Field(..., description="Mức độ rủi ro: LOW, MEDIUM, HIGH", examples=["HIGH"])
    riskProbability: float = Field(..., description="Xác suất rủi ro (0.0 - 1.0)", examples=[0.8524])
    model: str = Field(..., description="Tên mô hình ML đang phục vụ", examples=["Random Forest"])
    prediction: int = Field(..., description="Nhãn phân loại nhị phân (0: an toàn, 1: nguy cơ)", examples=[1])
    riskLevel: RiskLevelInfo
    recommendation: RecommendationInfo
    features: Dict[str, float]


class HealthResponse(BaseModel):
    status: str = "ok"
    model_loaded: bool
    model_name: str
    version: str = "1.0.0"
    timestamp: str
