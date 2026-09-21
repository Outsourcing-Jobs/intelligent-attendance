@echo off
chcp 65001 >nul
title Intelligent Attendance System - Docker Local Runner

echo =======================================================================
echo    HỆ THỐNG ĐIỂM DANH THÔNG MINH - CHẠY TOÀN BỘ DỊCH VỤ VỚI DOCKER
echo =======================================================================
echo.
echo [1/3] Đang kiểm tra Docker Engine...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] LỖI: Docker Desktop chưa được khởi động!
    echo Vui lòng mở Docker Desktop và đợi đến khi biểu tượng chuyển màu xanh (Engine running).
    echo.
    pause
    exit /b 1
)

echo [✓] Docker Desktop đang hoạt động bình thường.
echo.
echo [2/3] Bắt đầu build và khởi chạy các container (AI Service, Backend, Frontend)...
echo Quá trình build lần đầu có thể mất 3-5 phút để tải Docker base image và cài đặt thư viện.
echo.
docker compose up --build -d

if %errorlevel% neq 0 (
    echo.
    echo [!] Lỗi khi build hoặc chạy Docker Compose. Vui lòng kiểm tra log lỗi bên trên.
    pause
    exit /b 1
)

echo.
echo [3/3] Toàn bộ 3 dịch vụ đã được khởi chạy thành công ở chế độ nền (Detached mode)!
echo =======================================================================
echo   - Frontend Web App:  http://localhost:4000
echo   - Backend NestJS:    http://localhost:3000 (Swagger: http://localhost:3000/api/docs)
echo   - AI Service Python: http://localhost:8000 (Swagger: http://localhost:8000/docs)
echo =======================================================================
echo.
echo Các lệnh thường dùng:
echo   - Xem log trực tiếp:   docker compose logs -f
echo   - Xem trạng thái:      docker compose ps
echo   - Dừng hệ thống:       docker compose down
echo.
pause
