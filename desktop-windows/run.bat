@echo off
chcp 65001 >nul
title AI旅行规划助手

echo ========================================
echo       AI旅行规划助手 - WebView版
echo ========================================
echo.

:: 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

:: 检查依赖
echo [1/3] 检查依赖...
pip show PyQt6-WebEngine >nul 2>&1
if errorlevel 1 (
    echo [提示] 正在安装依赖...
    pip install PyQt6 PyQt6-WebEngine
)

:: 启动
echo [2/3] 启动应用...
echo [3/3] 打开窗口...
echo.

python main_webview.py
