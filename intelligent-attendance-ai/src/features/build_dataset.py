import os
import sys
import io
import pandas as pd
from feature_engineering import AttendanceFeaturePipeline, FEATURE_COLUMNS

# Đảm bảo in tiếng Việt UTF-8 trên Windows console
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


def build_and_save_ml_dataset():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    raw_dir = os.path.join(project_root, "data", "raw")
    processed_dir = os.path.join(project_root, "data", "processed")
    os.makedirs(processed_dir, exist_ok=True)

    print("=" * 75)
    print(" BẮT ĐẦU XÂY DỰNG DATASET MACHINE LEARNING (EARLY WARNING SYSTEM)")
    print("=" * 75)

    pipeline = AttendanceFeaturePipeline(observation_ratio=0.60, exam_ban_threshold=20.0)

    # 1. Trích xuất dữ liệu thực tế từ MongoDB
    try:
        df_real = pipeline.build_real_dataset(raw_dir)
    except Exception as e:
        print(f"[CẢNH BÁO] Lỗi khi trích xuất dữ liệu thật: {e}")
        df_real = pd.DataFrame()

    # 2. Sinh tập dữ liệu mô phỏng có quy luật chuỗi thời gian
    print("-> Đang sinh tập dữ liệu mô phỏng Markov Profiles (3,500 mẫu)...")
    df_synth = pipeline.generate_synthetic_profiles(n_samples=3500, random_state=42)
    print(f"-> Đã sinh thành công {len(df_synth)} mẫu mô phỏng (đánh dấu is_synthetic = 1).")

    # 3. Hợp nhất hai tập dữ liệu
    if not df_real.empty:
        df_combined = pd.concat([df_real, df_synth], ignore_index=True)
    else:
        df_combined = df_synth

    # 4. Kiểm tra và làm sạch dữ liệu
    initial_len = len(df_combined)
    # Loại bỏ duplicate dựa trên feature columns
    df_combined = df_combined.drop_duplicates(subset=FEATURE_COLUMNS, keep="first").reset_index(drop=True)
    duplicates_removed = initial_len - len(df_combined)

    # Xử lý missing values
    missing_count = df_combined[FEATURE_COLUMNS].isna().sum().sum()
    df_combined[FEATURE_COLUMNS] = df_combined[FEATURE_COLUMNS].fillna(0.0)

    # 5. Lưu dataset hoàn chỉnh ra file CSV
    output_path = os.path.join(processed_dir, "attendance_ml_dataset.csv")
    df_combined.to_csv(output_path, index=False, encoding="utf-8")
    print(f"\n[OK] Đã lưu dataset thành công vào: {output_path}")

    # 6. IN THỐNG KÊ CHI TIẾT THEO YÊU CẦU ĐỀ BÀI
    print("\n" + "=" * 75)
    print(" BÁO CÁO THỐNG KÊ DATASET MACHINE LEARNING")
    print("=" * 75)
    print(f"1. Kích thước Dataset (Dataset shape): {df_combined.shape[0]} hàng × {df_combined.shape[1]} cột")
    print(f"   - Số mẫu thực nghiệm MongoDB: {len(df_real)} mẫu ({(len(df_real)/len(df_combined))*100:.1f}%)")
    print(f"   - Số mẫu mở rộng mô phỏng:   {len(df_synth)} mẫu ({(len(df_synth)/len(df_combined))*100:.1f}%)")
    print(f"\n2. Danh sách các cột đặc trưng ({len(FEATURE_COLUMNS)} Features):")
    for idx, col in enumerate(FEATURE_COLUMNS, 1):
        print(f"   {idx:2d}. {col:<25} (dtype: {df_combined[col].dtype})")

    print(f"\n3. Giá trị khuyết thiếu (Missing values): {missing_count} (Đã xử lý: 0)")
    print(f"4. Số dòng trùng lặp đã loại bỏ (Duplicate rows removed): {duplicates_removed}")

    print("\n5. Phân bố nhãn mục tiêu (Label distribution & Class balance):")
    label_counts = df_combined["risk"].value_counts().sort_index()
    for label_val, count in label_counts.items():
        label_name = "Nguy cơ cấm thi / Vi phạm (1)" if label_val == 1 else "An toàn (0)"
        pct = (count / len(df_combined)) * 100
        print(f"   - {label_name:<32}: {count:5d} mẫu ({pct:5.2f}%)")

    print("\n6. Ma trận thống kê mô tả (Descriptive Statistics) các đặc trưng chính:")
    stats_cols = ["total_sessions", "attendance_rate", "absence_rate", "consecutive_absence", "attendance_trend"]
    print(df_combined[stats_cols].describe().round(2).to_string())
    print("=" * 75 + "\n")

    return df_combined


if __name__ == "__main__":
    build_and_save_ml_dataset()
