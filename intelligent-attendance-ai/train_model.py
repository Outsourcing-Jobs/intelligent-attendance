import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
)

# Thêm thư mục hiện tại vào sys.path để import
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from src.feature_engineering import AttendanceFeatureExtractor, FEATURE_COLUMNS


def load_and_prepare_dataset() -> Tuple[pd.DataFrame, pd.Series]:
    """
    Tải dữ liệu từ MongoDB Atlas và kết hợp bộ dữ liệu mở rộng đa dạng
    để tạo tập huấn luyện toàn diện với đầy đủ các phân lớp hành vi.
    """
    print("=" * 70)
    print(" BƯỚC 1: TRÍCH XUẤT VÀ CHUẨN BỊ DỮ LIỆU ĐẶC TRƯNG")
    print("=" * 70)

    extractor = AttendanceFeatureExtractor()
    try:
        df_real = extractor.extract_all_features_from_db()
        print(f"-> Dữ liệu thực tế từ MongoDB: {len(df_real)} mẫu.")
    except Exception as e:
        print(f"-> Cảnh báo khi đọc MongoDB: {e}. Sử dụng dữ liệu sinh mô phỏng.")
        df_real = pd.DataFrame()
    finally:
        extractor.close()

    # Sinh bộ dữ liệu mở rộng đa dạng nhóm hành vi (Xuất sắc, Trung bình, Nguy cơ, Bỏ học)
    # với 5000 mẫu đại diện cho các mốc thời gian học kỳ (từ 5 đến 30 buổi)
    print("-> Đang sinh bộ dữ liệu mở rộng đa dạng hóa nhóm hành vi sinh viên...")
    df_synth = AttendanceFeatureExtractor.generate_synthetic_dataset(n_samples=5000, random_state=42)
    print(f"-> Dữ liệu mở rộng: {len(df_synth)} mẫu.")

    # Kết hợp dữ liệu thực tế và mở rộng
    if not df_real.empty:
        df_combined = pd.concat([df_real, df_synth], ignore_index=True)
    else:
        df_combined = df_synth

    print(f"-> Tổng số mẫu huấn luyện & đánh giá: {len(df_combined)} mẫu.")
    print("\nPhân bố nhãn mục tiêu (is_warning):")
    label_counts = df_combined["is_warning"].value_counts()
    print(f" - An toàn (0)   : {label_counts.get(0, 0):5d} mẫu ({label_counts.get(0, 0)/len(df_combined)*100:.2f}%)")
    print(f" - Cảnh báo (1) : {label_counts.get(1, 0):5d} mẫu ({label_counts.get(1, 0)/len(df_combined)*100:.2f}%)")

    X = df_combined[FEATURE_COLUMNS].copy()
    y = df_combined["is_warning"].copy()

    # Kiểm tra và xử lý giá trị khuyết thiếu (nếu có)
    X = X.fillna(0)

    return X, y


def train_and_evaluate_models(
    X_train: np.ndarray,
    X_test: np.ndarray,
    y_train: pd.Series,
    y_test: pd.Series,
    feature_names: list,
) -> Tuple[Dict[str, Any], str, Any]:
    """
    Huấn luyện 3 mô hình: Logistic Regression, Decision Tree, Random Forest
    và so sánh chi tiết các chỉ số đánh giá.
    """
    print("\n" + "=" * 70)
    print(" BƯỚC 2: HUẤN LUYỆN VÀ ĐÁNH GIÁ 3 MÔ HÌNH HỌC MÁY")
    print("=" * 70)

    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight="balanced",
            C=1.0,
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=6,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            class_weight="balanced",
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight="balanced",
            n_jobs=-1,
        ),
    }

    results = {}
    best_f1 = -1.0
    best_model_name = ""
    best_model_obj = None

    for name, model in models.items():
        print(f"\n--- Đang huấn luyện: [{name}] ---")
        model.fit(X_train, y_train)

        # Dự báo trên tập Test
        y_pred = model.predict(X_test)
        y_prob = (
            model.predict_proba(X_test)[:, 1]
            if hasattr(model, "predict_proba")
            else None
        )

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_prob) if y_prob is not None else 0.0
        cm = confusion_matrix(y_test, y_pred).tolist()

        # Tính Feature Importance hoặc Hệ số hồi quy
        importance = {}
        if hasattr(model, "feature_importances_"):
            for f_name, imp in zip(feature_names, model.feature_importances_):
                importance[f_name] = round(float(imp), 4)
        elif hasattr(model, "coef_"):
            for f_name, coef in zip(feature_names, model.coef_[0]):
                importance[f_name] = round(float(coef), 4)

        results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "confusion_matrix": cm,
            "feature_importance": importance,
            "model_object": model,
        }

        print(f"Accuracy  : {acc*100:.2f}%")
        print(f"Precision : {prec*100:.2f}%")
        print(f"Recall    : {rec*100:.2f}%")
        print(f"F1-Score  : {f1*100:.2f}%")
        print(f"ROC-AUC   : {roc_auc:.4f}")
        print("Confusion Matrix:")
        print(f"  [TN={cm[0][0]:4d} | FP={cm[0][1]:4d}]")
        print(f"  [FN={cm[1][0]:4d} | TP={cm[1][1]:4d}]")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = model

    # Bảng so sánh tổng hợp
    print("\n" + "=" * 70)
    print(" BẢNG SO SÁNH HIỆU NĂNG 3 MÔ HÌNH HỌC MÁY TRÊN TẬP TEST (80/20)")
    print("=" * 70)
    summary_data = []
    for name, r in results.items():
        summary_data.append({
            "Mô hình": name,
            "Accuracy (%)": f"{r['accuracy']*100:.2f}%",
            "Precision (%)": f"{r['precision']*100:.2f}%",
            "Recall (%)": f"{r['recall']*100:.2f}%",
            "F1-Score (%)": f"{r['f1_score']*100:.2f}%",
            "ROC-AUC": f"{r['roc_auc']:.4f}",
        })
    df_summary = pd.DataFrame(summary_data)
    print(df_summary.to_string(index=False))

    print("\n" + "=" * 70)
    print(f"🏆 MÔ HÌNH TỐI ƯU ĐƯỢC CHỌN: [{best_model_name}] (F1-Score = {best_f1*100:.2f}%)")
    print("=" * 70)

    return results, best_model_name, best_model_obj


def save_artifacts(
    best_model_obj: Any,
    best_model_name: str,
    scaler: StandardScaler,
    results: Dict[str, Any],
    feature_names: list,
    output_dir: str,
):
    """
    Lưu mô hình tốt nhất, scaler và metadata vào thư mục models/
    """
    os.makedirs(output_dir, exist_ok=True)

    best_model_path = os.path.join(output_dir, "best_model.pkl")
    scaler_path = os.path.join(output_dir, "scaler.pkl")
    metadata_path = os.path.join(output_dir, "model_metadata.json")

    # Lưu file .pkl
    joblib.dump(best_model_obj, best_model_path)
    joblib.dump(scaler, scaler_path)

    # Chuẩn bị dữ liệu metadata JSON (bỏ object sklearn không serialize được)
    serializable_results = {}
    for name, data in results.items():
        serializable_results[name] = {
            k: v for k, v in data.items() if k != "model_object"
        }

    metadata = {
        "best_model_name": best_model_name,
        "best_f1_score": results[best_model_name]["f1_score"],
        "feature_columns": feature_names,
        "evaluation_metrics": serializable_results,
        "train_test_split": {"train_ratio": 0.8, "test_ratio": 0.2, "random_state": 42},
        "target_label": "is_warning",
        "description": "Mô hình dự báo nguy cơ chuyên cần thấp cho Đồ án Tốt nghiệp",
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    print(f"\nĐã lưu các tệp mô hình thành công:")
    print(f" -> [Best Model] : {best_model_path}")
    print(f" -> [Scaler]     : {scaler_path}")
    print(f" -> [Metadata]   : {metadata_path}")


def main():
    # 1. Tải và chuẩn bị dữ liệu
    X, y = load_and_prepare_dataset()

    # 2. Phân chia Train/Test 80/20 với phân tầng nhãn
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nPhân chia dữ liệu: Train={len(X_train)} mẫu, Test={len(X_test)} mẫu")

    # 3. Chuẩn hóa đặc trưng bằng StandardScaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 4. Huấn luyện và đánh giá 3 mô hình
    results, best_model_name, best_model_obj = train_and_evaluate_models(
        X_train=X_train_scaled,
        X_test=X_test_scaled,
        y_train=y_train,
        y_test=y_test,
        feature_names=FEATURE_COLUMNS,
    )

    # 5. Lưu mô hình tốt nhất vào thư mục models/
    models_dir = os.path.join(current_dir, "models")
    save_artifacts(
        best_model_obj=best_model_obj,
        best_model_name=best_model_name,
        scaler=scaler,
        results=results,
        feature_names=FEATURE_COLUMNS,
        output_dir=models_dir,
    )

    print("\n✅ HOÀN TẤT BƯỚC 2: ML PIPELINE THÀNH CÔNG VƯỢT TRỘI!")


if __name__ == "__main__":
    main()
