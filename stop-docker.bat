@echo off
chcp 65001 >nul
title Stop Intelligent Attendance System - Docker

echo Đang dừng và dọn dẹp các container của Hệ Thống Điểm Danh Thông Minh...
docker compose down
echo.
echo [✓] Đã dừng toàn bộ dịch vụ thành công!
pause
