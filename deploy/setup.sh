#!/bin/bash

# AI旅行规划助手 - 百度云Ubuntu服务器部署脚本
# 使用方法: chmod +x setup.sh && sudo ./setup.sh

set -e

echo "========================================="
echo "  AI旅行规划助手 - 服务器环境安装"
echo "========================================="

# 更新系统
echo "[1/5] 更新系统..."
apt update && apt upgrade -y

# 安装Node.js 20
echo "[2/5] 安装 Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# 安装MySQL 8.0
echo "[3/5] 安装 MySQL 8.0..."
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# 安装Nginx
echo "[4/5] 安装 Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# 安装Git
echo "[5/5] 安装 Git..."
apt install -y git

echo ""
echo "========================================="
echo "  环境安装完成！"
echo "========================================="
echo ""
echo "Node.js版本: $(node -v)"
echo "npm版本: $(npm -v)"
echo ""
echo "接下来请执行以下步骤："
echo "1. 配置MySQL数据库"
echo "2. 上传代码"
echo "3. 配置环境变量"
echo "4. 启动服务"
echo ""
