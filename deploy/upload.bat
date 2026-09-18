@echo off
echo =========================================
echo   AI旅行规划助手 - 打包上传脚本
echo =========================================

set /p SERVER_IP="请输入服务器IP: "
set /p SERVER_USER="请输入用户名(root): "

if "%SERVER_USER%"=="" set SERVER_USER=root

echo.
echo [1/3] 打包项目...

cd /d G:\BS

echo.
echo [2/3] 上传代码到服务器...
echo 请输入服务器密码:

scp -r server web deploy root@%SERVER_IP%:/opt/travel-planner/

echo.
echo [3/3] 上传完成！
echo.
echo 接下来请在服务器上执行:
echo   cd /opt/travel-planner/deploy
echo   chmod +x *.sh
echo   ./setup.sh
echo   ./setup-db.sh
echo   ./deploy.sh
echo   ./setup-nginx.sh
echo.
pause
