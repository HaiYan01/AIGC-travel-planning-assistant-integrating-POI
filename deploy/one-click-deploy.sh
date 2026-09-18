#!/bin/bash

# =========================================
# AI旅行规划助手 - 百度云一键部署脚本
# 服务器: wanghaiyan.cn
# =========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}"
echo "========================================="
echo "  AI旅行规划助手 - 一键部署"
echo "========================================="
echo -e "${NC}"

# 配置变量
DB_PASSWORD="HaiYan!!BS2004"
APP_DIR="/opt/travel-planner"

# [1/6] 安装系统依赖
echo -e "${YELLOW}[1/6] 安装系统依赖...${NC}"
apt update && apt upgrade -y
apt install -y curl git nginx mysql-server

# [2/6] 安装Node.js 20
echo -e "${YELLOW}[2/6] 安装 Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# [3/6] 配置MySQL
echo -e "${YELLOW}[3/6] 配置 MySQL...${NC}"
systemctl start mysql
systemctl enable mysql

mysql -u root <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS travel_planner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

echo -e "${GREEN}MySQL配置完成！${NC}"

# [4/6] 创建项目目录
echo -e "${YELLOW}[4/6] 创建项目目录...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

# 生成JWT密钥
JWT_SECRET=$(openssl rand -hex 32)

# 创建环境变量（请在部署后修改为真实的API Key）
cat > server/.env <<EOF
PORT=3000
NODE_ENV=production

DATABASE_URL="mysql://root:${DB_PASSWORD}@localhost:3306/travel_planner"

JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"

# AI API - 请替换为你的真实Key
AI_API_KEY="你的AI_API_KEY"
AI_API_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
AI_MODEL="glm-4-flash"

# 高德地图 - 请替换为你的真实Key
AMAP_KEY="你的高德Key"
AMAP_SECURITY_CODE="你的高德安全密钥"
EOF

# [5/6] 安装依赖并构建
echo -e "${YELLOW}[5/6] 安装依赖...${NC}"

# 后端
cd $APP_DIR/server
npm ci --production
npx prisma generate
npx prisma db push

# 前端
cd $APP_DIR/web
npm ci
npm run build

# [6/6] 配置Nginx
echo -e "${YELLOW}[6/6] 配置 Nginx...${NC}"

cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name wanghaiyan.cn www.wanghaiyan.cn;

    location / {
        root ${APP_DIR}/web/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    client_max_body_size 10M;
}
EOF

nginx -t
systemctl restart nginx

# 启动服务
echo -e "${YELLOW}启动后端服务...${NC}"
cd $APP_DIR/server
pm2 start src/index.js --name travel-server
pm2 startup
pm2 save

echo -e "${GREEN}"
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "访问地址: http://wanghaiyan.cn"
echo ""
echo "管理员账号:"
echo "  邮箱: admin@travel.com"
echo "  密码: 创建管理员时自己设置的密码"
echo ""
echo "常用命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs travel-server"
echo "  重启服务: pm2 restart travel-server"
echo ""
echo -e "${NC}"
