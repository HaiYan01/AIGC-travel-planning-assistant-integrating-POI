#!/bin/bash

# AI旅行规划助手 - Ubuntu服务器部署脚本
# 使用方法: chmod +x deploy.sh && sudo ./deploy.sh

set -e

echo "===== AI旅行规划助手 部署脚本 ====="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "请使用 sudo 运行此脚本"
  exit 1
fi

# Install dependencies
echo "[1/6] 安装系统依赖..."
apt update
apt install -y curl git nginx

# Install Node.js 20
echo "[2/6] 安装 Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# Install Docker (optional, for containerized deployment)
echo "[3/6] 安装 Docker..."
if ! command -v docker &> /dev/null; then
  apt install -y apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
  add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  apt install -y docker-ce docker-compose
fi

# Clone or pull repository
echo "[4/6] 获取代码..."
APP_DIR="/opt/travel-planner"
if [ -d "$APP_DIR" ]; then
  cd $APP_DIR && git pull
else
  git clone https://github.com/your-repo/travel-planner.git $APP_DIR
  cd $APP_DIR
fi

# Setup environment
echo "[5/6] 配置环境..."
if [ ! -f "$APP_DIR/server/.env" ]; then
  cp $APP_DIR/server/.env.example $APP_DIR/server/.env
  echo "请编辑 $APP_DIR/server/.env 填入你的配置"
fi

# Build and start
echo "[6/6] 构建并启动服务..."

# Using Docker Compose
cd $APP_DIR/docker
docker-compose up -d --build

# Or using PM2 (without Docker)
# cd $APP_DIR/server
# npm ci --production
# npx prisma generate
# npx prisma db push
# pm2 start src/index.js --name travel-server

# Configure Nginx
cp $APP_DIR/docker/nginx/nginx.conf /etc/nginx/nginx.conf
nginx -t && systemctl restart nginx

echo ""
echo "===== 部署完成! ====="
echo "访问 http://your-server-ip 即可使用"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo ""
