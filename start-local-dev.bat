@echo off
chcp 65001 >nul
title Start All Services (Local Dev Mode)
echo =======================================================================
echo    HỆ THỐNG ĐIỂM DANH THÔNG MINH - LOCAL DEV LAUNCHER
echo =======================================================================
echo.

echo [1/3] Khởi động AI Service (Python FastAPI trên cổng 8000)...
start "AI Service (FastAPI :8000)" cmd /k "cd /d %~dp0intelligent-attendance-ai && python main.py"

echo [2/3] Khởi động Backend (NestJS trên cổng 3000)...
start "Backend API (NestJS :3000)" cmd /k "cd /d %~dp0intelligent-attendance-system && npm run start:dev"

echo [3/3] Khởi động Frontend (Next.js trên cổng 4000)...
start "Frontend Web (Next.js :4000)" cmd /k "cd /d %~dp0intelligent-attendance-web-app && npm run dev"

echo.
echo [✓] Đã mở cả 3 dịch vụ trong 3 cửa sổ terminal riêng biệt!
echo - Frontend:  http://localhost:4000
echo - Backend:   http://localhost:3000 (Docs: http://localhost:3000/api/docs)
echo - AI Service: http://localhost:8000 (Docs: http://localhost:8000/docs)
echo.
pause
