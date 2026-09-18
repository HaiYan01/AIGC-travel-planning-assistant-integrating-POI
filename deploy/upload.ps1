# AI旅行规划助手 - 上传代码到服务器

$SERVER = "wanghaiyan.cn"
$USER = "root"
$REMOTE_PATH = "/opt/travel-planner"

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  上传代码到服务器" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# 检查本地项目目录
$LOCAL_PATH = "G:\BS"
if (-not (Test-Path $LOCAL_PATH)) {
    Write-Host "错误: 找不到项目目录 $LOCAL_PATH" -ForegroundColor Red
    exit 1
}

Write-Host "[1/3] 创建服务器目录..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} "mkdir -p ${REMOTE_PATH}"

Write-Host "[2/3] 上传项目文件..." -ForegroundColor Yellow
Write-Host "请输入服务器密码: HaiYan!!BS2004" -ForegroundColor Cyan
Write-Host ""

# 上传server目录
Write-Host "上传 server..." -ForegroundColor Gray
scp -r "${LOCAL_PATH}\server" "${USER}@${SERVER}:${REMOTE_PATH}/"

# 上传web目录（排除node_modules）
Write-Host "上传 web..." -ForegroundColor Gray
scp -r "${LOCAL_PATH}\web\src" "${LOCAL_PATH}\web\public" "${LOCAL_PATH}\web\*.json" "${LOCAL_PATH}\web\*.js" "${LOCAL_PATH}\web\*.html" "${USER}@${SERVER}:${REMOTE_PATH}/web/"

# 上传部署脚本
Write-Host "上传部署脚本..." -ForegroundColor Gray
scp "${LOCAL_PATH}\deploy\one-click-deploy.sh" "${USER}@${SERVER}:${REMOTE_PATH}/"

Write-Host ""
Write-Host "[3/3] 上传完成！" -ForegroundColor Green
Write-Host ""
Write-Host "接下来请在服务器上执行以下命令:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ssh root@wanghaiyan.cn" -ForegroundColor Cyan
Write-Host "  cd /opt/travel-planner" -ForegroundColor Cyan
Write-Host "  chmod +x one-click-deploy.sh" -ForegroundColor Cyan
Write-Host "  ./one-click-deploy.sh" -ForegroundColor Cyan
Write-Host ""
