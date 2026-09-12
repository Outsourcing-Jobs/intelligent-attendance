"""
Script Huấn luyện và Đánh giá 3 Mô hình Machine Learning:
- Logistic Regression
- Decision Tree
- Random Forest
Cho bài toán Cảnh báo sớm chuyên cần (Early Warning Attendance Risk).

Sử dụng tập dữ liệu Timeline Split: data/processed/attendance_ml_dataset.csv
"""

import os
import sys
import json
from datetime import datetime
from typing import Dict, Any, Tuple

import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend cho server
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    classification_report,
)

# Cấu hình UTF-8 an toàn trên Windows
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

# Định nghĩa 12 đặc trưng chuẩn theo Phase 6
FEATURE_COLUMNS = [
    "total_sessions",
    "present_count",
    "late_count",
    "early_leave_count",
    "excused_count",
    "absent_count",
    "attendance_rate",
    "absence_rate",
    "late_rate",
    "recent_absence_rate",
    "consecutive_absence",
    "attendance_trend",
]

TARGET_COLUMN = "risk"


def load_dataset(dataset_path: str) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame]:
    """Tải dữ liệu từ CSV và tách X, y."""
    print("=" * 70)
    print(" BƯỚC 1: ĐỌC DỮ LIỆU DATASET TỪ FILE PROCESSED CSV")
    print("=" * 70)

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Không tìm thấy dataset tại {dataset_path}")

    df = pd.read_csv(dataset_path)
    print(f"-> Đã tải dataset: {len(df)} hàng, {df.shape[1]} cột.")

    # Kiểm tra các cột feature
    missing_cols = [c for c in FEATURE_COLUMNS if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Thiếu các cột đặc trưng: {missing_cols}")

    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Thiếu cột nhãn mục tiêu '{TARGET_COLUMN}'")

    X = df[FEATURE_COLUMNS].copy().fillna(0)
    y = df[TARGET_COLUMN].copy().astype(int)

    label_counts = y.value_counts()
    print(f"-> Phân bố nhãn {TARGET_COLUMN}:")
    print(f"   - An toàn (0) : {label_counts.get(0, 0):4d} mẫu ({label_counts.get(0, 0) / len(y) * 100:.2f}%)")
    print(f"   - Nguy cơ (1) : {label_counts.get(1, 0):4d} mẫu ({label_counts.get(1, 0) / len(y) * 100:.2f}%)")

    return X, y, df


def train_models(
    X_train: np.ndarray,
    y_train: pd.Series,
) -> Dict[str, Any]:
    """Khởi tạo và huấn luyện 3 mô hình học máy."""
    print("\n" + "=" * 70)
    print(" BƯỚC 2: KHỞI TẠO VÀ HUẤN LUYỆN 3 MÔ HÌNH HỌC MÁY")
    print("=" * 70)

    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight="balanced",
            C=1.0,
            solver="lbfgs",
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=5,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            class_weight="balanced",
            criterion="gini",
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

    trained_models = {}
    for name, model in models.items():
        print(f"-> Đang huấn luyện: [{name}]...")
        model.fit(X_train, y_train)
        trained_models[name] = model
        print(f"   ✓ Huấn luyện [{name}] thành công!")

    return trained_models


def evaluate_models(
    trained_models: Dict[str, Any],
    X_test: np.ndarray,
    y_test: pd.Series,
    feature_names: list,
) -> Tuple[Dict[str, Any], pd.DataFrame]:
    """Đánh giá toàn diện các chỉ số trên tập Test."""
    print("\n" + "=" * 70)
    print(" BƯỚC 3: ĐÁNH GIÁ CÁC CHỈ SỐ TRÊN TẬP TEST (20%)")
    print("=" * 70)

    eval_results = {}
    summary_rows = []

    for name, model in trained_models.items():
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else None

        acc = accuracy_score(y_test, y_pred)
        prec_bin = precision_score(y_test, y_pred, zero_division=0)
        rec_bin = recall_score(y_test, y_pred, zero_division=0)
        f1_bin = f1_score(y_test, y_pred, zero_division=0)

        prec_macro = precision_score(y_test, y_pred, average="macro", zero_division=0)
        rec_macro = recall_score(y_test, y_pred, average="macro", zero_division=0)
        f1_macro = f1_score(y_test, y_pred, average="macro", zero_division=0)

        roc_auc = roc_auc_score(y_test, y_prob) if y_prob is not None else 0.0
        cm = confusion_matrix(y_test, y_pred).tolist()

        # Tính toán Feature Importance hoặc Coef
        importances = {}
        if hasattr(model, "feature_importances_"):
            for f, imp in zip(feature_names, model.feature_importances_):
                importances[f] = round(float(imp), 4)
        elif hasattr(model, "coef_"):
            for f, coef in zip(feature_names, model.coef_[0]):
                importances[f] = round(float(coef), 4)

        eval_results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec_bin), 4),
            "recall": round(float(rec_bin), 4),
            "f1_score": round(float(f1_bin), 4),
            "precision_macro": round(float(prec_macro), 4),
            "recall_macro": round(float(rec_macro), 4),
            "f1_macro": round(float(f1_macro), 4),
            "roc_auc": round(float(roc_auc), 4),
            "confusion_matrix": cm,
            "y_pred": y_pred.tolist(),
            "y_prob": y_prob.tolist() if y_prob is not None else [],
            "feature_importance": importances,
        }

        summary_rows.append({
            "Mô hình": name,
            "Accuracy": f"{acc * 100:.2f}%",
            "Precision (Risk=1)": f"{prec_bin * 100:.2f}%",
            "Recall (Risk=1)": f"{rec_bin * 100:.2f}%",
            "F1-Score (Risk=1)": f"{f1_bin * 100:.2f}%",
            "F1-Macro": f"{f1_macro * 100:.2f}%",
            "ROC-AUC": f"{roc_auc:.4f}",
            "TN": cm[0][0],
            "FP": cm[0][1],
            "FN": cm[1][0],
            "TP": cm[1][1],
        })

        print(f"\n--- Kết quả [{name}] ---")
        print(f"Accuracy         : {acc * 100:.2f}%")
        print(f"Precision (Risk) : {prec_bin * 100:.2f}%")
        print(f"Recall (Risk)    : {rec_bin * 100:.2f}%")
        print(f"F1-Score (Risk)  : {f1_bin * 100:.2f}%")
        print(f"F1-Score (Macro) : {f1_macro * 100:.2f}%")
        print(f"ROC-AUC          : {roc_auc:.4f}")
        print(f"Confusion Matrix : [TN={cm[0][0]:3d}, FP={cm[0][1]:3d} | FN={cm[1][0]:3d}, TP={cm[1][1]:3d}]")

    df_summary = pd.DataFrame(summary_rows)
    print("\n" + "=" * 70)
    print(" BẢNG TỔNG HỢP HIỆU NĂNG 3 MÔ HÌNH HỌC MÁY")
    print("=" * 70)
    print(df_summary.to_string(index=False))

    return eval_results, df_summary


def plot_and_save_figures(
    trained_models: Dict[str, Any],
    eval_results: Dict[str, Any],
    X_test: np.ndarray,
    y_test: pd.Series,
    feature_names: list,
    output_dir: str,
):
    """Vẽ và xuất các biểu đồ trực quan hóa kết quả."""
    os.makedirs(output_dir, exist_ok=True)
    print("\n" + "=" * 70)
    print(f" BƯỚC 4: VẼ VÀ XUẤT BIỂU ĐỒ ĐÁNH GIÁ -> {output_dir}")
    print("=" * 70)

    # 1. Confusion Matrix (3 subplots)
    fig, axes = plt.subplots(1, 3, figsize=(16, 4.5))
    model_names = list(trained_models.keys())

    for idx, name in enumerate(model_names):
        cm = np.array(eval_results[name]["confusion_matrix"])
        ax = axes[idx]
        im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
        ax.set_title(f"{name}\n(F1: {eval_results[name]['f1_score']:.3f} | Rec: {eval_results[name]['recall']:.3f})", fontsize=12, fontweight="bold")
        fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

        tick_marks = np.arange(2)
        ax.set_xticks(tick_marks)
        ax.set_xticklabels(["Safe (0)", "Risk (1)"])
        ax.set_yticks(tick_marks)
        ax.set_yticklabels(["Safe (0)", "Risk (1)"])

        thresh = cm.max() / 2.0
        for i in range(cm.shape[0]):
            for j in range(cm.shape[1]):
                color = "white" if cm[i, j] > thresh else "black"
                ax.text(j, i, format(cm[i, j], "d"), ha="center", va="center", color=color, fontsize=12, fontweight="bold")

        ax.set_ylabel("True Label" if idx == 0 else "")
        ax.set_xlabel("Predicted Label")

    plt.tight_layout()
    cm_path = os.path.join(output_dir, "confusion_matrices.png")
    plt.savefig(cm_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"-> [Saved] Confusion Matrices: {cm_path}")

    # 2. ROC Curves
    plt.figure(figsize=(8, 6))
    colors = ["#2563eb", "#10b981", "#f59e0b"]

    for idx, name in enumerate(model_names):
        y_prob = np.array(eval_results[name]["y_prob"])
        if len(y_prob) > 0:
            fpr, tpr, _ = roc_curve(y_test, y_prob)
            auc_val = eval_results[name]["roc_auc"]
            plt.plot(fpr, tpr, color=colors[idx], lw=2.2, label=f"{name} (AUC = {auc_val:.4f})")

    plt.plot([0, 1], [0, 1], color="grey", lw=1.5, linestyle="--", label="Random Chance (AUC = 0.5000)")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate (1 - Specificity)", fontsize=11, fontweight="bold")
    plt.ylabel("True Positive Rate (Recall)", fontsize=11, fontweight="bold")
    plt.title("ROC Curves Comparison - Attendance Risk Prediction", fontsize=13, fontweight="bold", pad=12)
    plt.legend(loc="lower right", fontsize=10)
    plt.grid(True, linestyle=":", alpha=0.6)

    roc_path = os.path.join(output_dir, "roc_curves.png")
    plt.savefig(roc_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"-> [Saved] ROC Curves: {roc_path}")

    # 3. Feature Importance (Random Forest & Decision Tree)
    rf_model = trained_models.get("Random Forest")
    if rf_model and hasattr(rf_model, "feature_importances_"):
        importances = rf_model.feature_importances_
        indices = np.argsort(importances)[::-1]
        sorted_features = [feature_names[i] for i in indices]
        sorted_scores = importances[indices]

        plt.figure(figsize=(10, 6))
        bars = plt.barh(range(len(sorted_features)), sorted_scores[::-1], color="#3b82f6", align="center")
        plt.yticks(range(len(sorted_features)), sorted_features[::-1], fontsize=10)
        plt.xlabel("Relative Importance Score (Gini Importance)", fontsize=11, fontweight="bold")
        plt.title("Random Forest - Feature Importance Ranking", fontsize=13, fontweight="bold", pad=12)
        plt.grid(axis="x", linestyle=":", alpha=0.6)

        for bar in bars:
            width = bar.get_width()
            plt.text(width + 0.005, bar.get_y() + bar.get_height() / 2, f"{width:.3f}", ha="left", va="center", fontsize=9)

        feat_path = os.path.join(output_dir, "feature_importance.png")
        plt.savefig(feat_path, dpi=300, bbox_inches="tight")
        plt.close()
        print(f"-> [Saved] Feature Importance: {feat_path}")

    # 4. Model Comparison Bar Chart
    plt.figure(figsize=(10, 5.5))
    metrics_to_plot = ["accuracy", "precision", "recall", "f1_score", "roc_auc"]
    metric_labels = ["Accuracy", "Precision (Risk)", "Recall (Risk)", "F1-Score (Risk)", "ROC-AUC"]

    x = np.arange(len(metric_labels))
    width = 0.25

    fig, ax = plt.subplots(figsize=(10, 5.5))
    for i, name in enumerate(model_names):
        vals = [eval_results[name][m] for m in metrics_to_plot]
        rects = ax.bar(x + (i - 1) * width, vals, width, label=name, color=colors[i], alpha=0.85)
        for rect in rects:
            height = rect.get_height()
            ax.annotate(f"{height:.2f}",
                        xy=(rect.get_x() + rect.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha="center", va="bottom", fontsize=8, rotation=45)

    ax.set_ylabel("Score (0.0 - 1.0)", fontsize=11, fontweight="bold")
    ax.set_title("Performance Comparison across 3 Classification Models", fontsize=13, fontweight="bold", pad=12)
    ax.set_xticks(x)
    ax.set_xticklabels(metric_labels, fontsize=10, fontweight="bold")
    ax.set_ylim([0, 1.15])
    ax.legend(loc="lower left", fontsize=10)
    ax.grid(axis="y", linestyle=":", alpha=0.6)

    comp_path = os.path.join(output_dir, "model_comparison.png")
    plt.savefig(comp_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"-> [Saved] Model Comparison Chart: {comp_path}")


def select_best_model(eval_results: Dict[str, Any], trained_models: Dict[str, Any]) -> Tuple[str, Any]:
    """
    Lựa chọn mô hình tối ưu cho bài toán Early Warning.
    Tiêu chuẩn:
    - Trong bài toán cảnh báo cấm thi, chi phí của False Negative (bỏ sót sinh viên nguy cơ)
      lớn hơn False Positive (nhắc nhở thừa).
    - Do đó, mô hình tối ưu ưu tiên Recall trên nhãn nguy cơ, kết hợp F1-Score và ROC-AUC cao nhất.
    """
    print("\n" + "=" * 70)
    print(" BƯỚC 5: LỰA CHỌN MÔ HÌNH TỐI ƯU CHO EARLY WARNING")
    print("=" * 70)

    best_name = None
    best_score = -1.0

    for name, res in eval_results.items():
        # Score kết hợp: 40% Recall (bắt rủi ro) + 30% F1-score + 30% ROC-AUC
        combined_score = 0.40 * res["recall"] + 0.30 * res["f1_score"] + 0.30 * res["roc_auc"]
        print(f"-> [{name}]: Recall={res['recall']:.4f}, F1={res['f1_score']:.4f}, AUC={res['roc_auc']:.4f} => Composite Score = {combined_score:.4f}")
        if combined_score > best_score:
            best_score = combined_score
            best_name = name

    print(f"\n🏆 MÔ HÌNH ĐƯỢC CHỌN: [{best_name}]")
    print(f"   Lý do: Cân bằng tối ưu giữa việc phát hiện sinh viên nguy cơ (Recall cao) và độ chính xác tổng quát.")
    return best_name, trained_models[best_name]


def export_artifacts(
    best_model_name: str,
    best_model_obj: Any,
    scaler: StandardScaler,
    eval_results: Dict[str, Any],
    df_summary: pd.DataFrame,
    feature_names: list,
    total_samples: int,
    train_count: int,
    test_count: int,
    models_dir: str,
    results_dir: str,
):
    """Xuất Artifacts: Pipeline pkl, Scaler, Best Model, Metadata JSON, Comparison CSV."""
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(results_dir, exist_ok=True)

    print("\n" + "=" * 70)
    print(f" BƯỚC 6: XUẤT ARTIFACTS VÀ METADATA RA THƯ MỤC")
    print("=" * 70)

    # 1. Lưu CSV tổng hợp
    csv_path = os.path.join(results_dir, "model_comparison.csv")
    df_summary.to_csv(csv_path, index=False, encoding="utf-8-sig")
    print(f"-> [Saved] Bảng so sánh mô hình: {csv_path}")

    # 2. Tạo Scikit-learn Pipeline đóng gói đồng bộ Scaler + Best Model
    # Pipeline giúp khi FastAPI suy luận chỉ cần truyền raw X vào pipeline.predict()
    pipeline = Pipeline(steps=[
        ("scaler", scaler),
        ("classifier", best_model_obj),
    ])

    pipeline_path = os.path.join(models_dir, "attendance_risk_pipeline.pkl")
    joblib.dump(pipeline, pipeline_path)
    print(f"-> [Saved] Full Pipeline (Scaler + Model): {pipeline_path}")

    # 3. Lưu riêng model và scaler để tương thích tối đa
    best_model_path = os.path.join(models_dir, "best_model.pkl")
    scaler_path = os.path.join(models_dir, "scaler.pkl")
    joblib.dump(best_model_obj, best_model_path)
    joblib.dump(scaler, scaler_path)
    print(f"-> [Saved] Best Model standalone: {best_model_path}")
    print(f"-> [Saved] Scaler standalone: {scaler_path}")

    # 4. Xuất metadata JSON
    clean_eval_results = {}
    for m_name, m_data in eval_results.items():
        clean_eval_results[m_name] = {
            k: v for k, v in m_data.items() if k not in ["y_pred", "y_prob"]
        }

    metadata = {
        "project": "Intelligent Attendance & Academic Risk Warning System",
        "timestamp": datetime.now().isoformat(),
        "best_model_name": best_model_name,
        "composite_criteria": "40% Recall + 30% F1 + 30% ROC-AUC (Early Warning safety focus)",
        "dataset_info": {
            "total_samples": total_samples,
            "train_samples": train_count,
            "test_samples": test_count,
            "train_ratio": 0.8,
            "test_ratio": 0.2,
            "random_state": 42,
            "stratified": True,
        },
        "feature_columns": feature_names,
        "feature_count": len(feature_names),
        "target_column": TARGET_COLUMN,
        "risk_levels": {
            "LOW": {
                "label": "An toàn",
                "color": "green",
                "probability_range": [0.0, 0.35],
                "description": "Tỷ lệ chuyên cần tốt, duy trì phong độ.",
            },
            "MEDIUM": {
                "label": "Cần chú ý",
                "color": "yellow",
                "probability_range": [0.35, 0.70],
                "description": "Bắt đầu xuất hiện vắng mặt hoặc đi muộn rải rác, cần nhắc nhở sớm.",
            },
            "HIGH": {
                "label": "Nguy cơ cao",
                "color": "red",
                "probability_range": [0.70, 1.0],
                "description": "Rất gần ngưỡng cấm thi (>20% vắng) hoặc chuỗi vắng liên tiếp nghiêm trọng.",
            },
        },
        "models_evaluation": clean_eval_results,
    }

    metadata_path = os.path.join(models_dir, "model_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"-> [Saved] Metadata JSON: {metadata_path}")


def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    dataset_path = os.path.join(base_dir, "data", "processed", "attendance_ml_dataset.csv")
    models_dir = os.path.join(base_dir, "models")
    results_dir = os.path.join(base_dir, "results")
    figures_dir = os.path.join(results_dir, "figures")

    # 1. Đọc dữ liệu
    X, y, df_all = load_dataset(dataset_path)

    # 2. Chia tập Train/Test 80/20 có phân tầng nhãn
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n-> Phân chia dữ liệu: Train = {len(X_train)} mẫu ({len(X_train)/len(X)*100:.1f}%), Test = {len(X_test)} mẫu ({len(X_test)/len(X)*100:.1f}%)")

    # 3. Chuẩn hóa đặc trưng: Fit DUY NHẤT trên X_train, transform trên cả hai
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 4. Huấn luyện 3 mô hình
    trained_models = train_models(X_train_scaled, y_train)

    # 5. Đánh giá toàn diện trên tập Test
    eval_results, df_summary = evaluate_models(trained_models, X_test_scaled, y_test, FEATURE_COLUMNS)

    # 6. Vẽ biểu đồ & lưu figures
    plot_and_save_figures(trained_models, eval_results, X_test_scaled, y_test, FEATURE_COLUMNS, figures_dir)

    # 7. Chọn mô hình tốt nhất
    best_model_name, best_model_obj = select_best_model(eval_results, trained_models)

    # 8. Xuất artifacts
    export_artifacts(
        best_model_name=best_model_name,
        best_model_obj=best_model_obj,
        scaler=scaler,
        eval_results=eval_results,
        df_summary=df_summary,
        feature_names=FEATURE_COLUMNS,
        total_samples=len(X),
        train_count=len(X_train),
        test_count=len(X_test),
        models_dir=models_dir,
        results_dir=results_dir,
    )

    print("\n" + "=" * 70)
    print("🎉 HOÀN THÀNH HUẤN LUYỆN & ĐÁNH GIÁ 3 MODEL (PHASE 7 & 8)")
    print("=" * 70)


if __name__ == "__main__":
    main()
