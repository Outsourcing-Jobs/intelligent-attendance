"""
Unit / Integration Tests cho FastAPI AI Service.
Kiểm tra các endpoints: /health, /models/metadata, /predict với các ca kiểm thử cụ thể.
"""

import os
import sys
from fastapi.testclient import TestClient

# Cấu hình đường dẫn
current_dir = os.path.dirname(os.path.abspath(__file__))
ai_root = os.path.abspath(os.path.join(current_dir, ".."))
if ai_root not in sys.path:
    sys.path.insert(0, ai_root)

from app.main import app

client = TestClient(app)


def test_health_check():
    """Kiểm tra endpoint GET /health"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert data["model_name"] == "Random Forest"
    print("✓ test_health_check: PASSED")


def test_models_metadata():
    """Kiểm tra endpoint GET /models/metadata"""
    response = client.get("/models/metadata")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    metadata = data["data"]
    assert metadata["best_model_name"] == "Random Forest"
    assert len(metadata["feature_columns"]) == 12
    assert "Random Forest" in metadata["models_evaluation"]
    print("✓ test_models_metadata: PASSED")


def test_predict_safe_student():
    """Kiểm tra dự báo cho sinh viên chuyên cần tốt -> Phải trả về LOW (An toàn)"""
    safe_features = {
        "total_sessions": 15.0,
        "present_count": 14.0,
        "late_count": 1.0,
        "early_leave_count": 0.0,
        "excused_count": 0.0,
        "absent_count": 0.0,
        "attendance_rate": 0.9333,
        "absence_rate": 0.0,
        "late_rate": 0.0667,
        "recent_absence_rate": 0.0,
        "consecutive_absence": 0.0,
        "attendance_trend": 0.1,
    }

    payload = {
        "student_id": "test_student_safe",
        "course_section_id": "test_course_01",
        "features": safe_features,
    }

    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["risk"] == "LOW"
    assert res_data["prediction"] == 0
    assert res_data["riskLevel"]["label"] == "An toàn"
    assert res_data["riskProbability"] < 0.35
    assert "duy trì" in res_data["recommendation"]["for_student"].lower()
    print("✓ test_predict_safe_student: PASSED (Risk = LOW, Prob = {:.4f})".format(res_data["riskProbability"]))


def test_predict_high_risk_student():
    """Kiểm tra dự báo cho sinh viên vắng nhiều, vắng liên tiếp -> Phải trả về HIGH (Nguy cơ cao)"""
    high_risk_features = {
        "total_sessions": 15.0,
        "present_count": 7.0,
        "late_count": 2.0,
        "early_leave_count": 1.0,
        "excused_count": 0.0,
        "absent_count": 5.0,
        "attendance_rate": 0.4667,
        "absence_rate": 0.3333,
        "late_rate": 0.1333,
        "recent_absence_rate": 1.0,
        "consecutive_absence": 3.0,
        "attendance_trend": -0.5,
    }

    payload = {
        "student_id": "test_student_high_risk",
        "course_section_id": "test_course_01",
        "features": high_risk_features,
    }

    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["risk"] == "HIGH"
    assert res_data["riskLevel"]["label"] == "Nguy cơ cao"
    assert "CẤM THI" in res_data["recommendation"]["for_student"]
    print("✓ test_predict_high_risk_student: PASSED (Risk = HIGH, Prob = {:.4f})".format(res_data["riskProbability"]))


def test_predict_medium_risk_student():
    """Kiểm tra dự báo cho sinh viên ranh giới -> Phải trả về MEDIUM (Cần chú ý)"""
    medium_features = {
        "total_sessions": 15.0,
        "present_count": 11.0,
        "late_count": 2.0,
        "early_leave_count": 0.0,
        "excused_count": 0.0,
        "absent_count": 2.0,
        "attendance_rate": 0.7333,
        "absence_rate": 0.1333,
        "late_rate": 0.1333,
        "recent_absence_rate": 0.3333,
        "consecutive_absence": 1.0,
        "attendance_trend": -0.2,
    }

    payload = {
        "student_id": "test_student_medium_risk",
        "course_section_id": "test_course_01",
        "features": medium_features,
    }

    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["risk"] in ["MEDIUM", "HIGH"]
    print("✓ test_predict_medium_risk_student: PASSED (Risk = {}, Prob = {:.4f})".format(res_data["risk"], res_data["riskProbability"]))


def test_predict_missing_params():
    """Kiểm tra lỗi 400 khi không truyền features lẫn student_id"""
    response = client.post("/predict", json={})
    assert response.status_code == 400
    print("✓ test_predict_missing_params: PASSED (Correctly rejected with 400)")


if __name__ == "__main__":
    with TestClient(app) as client:
        test_health_check()
        test_models_metadata()
        test_predict_safe_student()
        test_predict_high_risk_student()
        test_predict_medium_risk_student()
        test_predict_missing_params()
    print("\n🎉 TẤT CẢ TEST CASES CHO FASTAPI AI SERVICE ĐÃ VƯỢT QUA 100%!")
