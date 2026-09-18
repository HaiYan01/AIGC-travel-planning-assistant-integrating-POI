#!/bin/bash

# 项目部署脚本

APP_DIR="/opt/travel-planner"

echo "========================================="
echo "  部署AI旅行规划助手"
echo "========================================="

# 创建目录
mkdir -p $APP_DIR
cd $APP_DIR

# 如果是第一次部署，需要克隆代码
if [ ! -d ".git" ]; then
    echo "请先上传代码到服务器，或使用Git克隆："
    echo "git clone https://github.com/你的用户名/travel-planner.git ."
    exit 1
fi

# 读取数据库密码
read -sp "请输入MySQL root密码: " DB_PASSWORD
echo ""

# 创建环境变量文件
echo "[1/4] 配置环境变量..."
cat > server/.env <<EOF
PORT=3000
NODE_ENV=production

DATABASE_URL="mysql://root:${DB_PASSWORD}@localhost:3306/travel_planner"

JWT_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="7d"

# AI API (替换为你自己的Key)
AI_API_KEY="your-api-key"
AI_API_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
AI_MODEL="glm-4-flash"

# 高德地图 (替换为你自己的Key)
AMAP_KEY="your-amap-key"
EOF

# 安装后端依赖
echo "[2/4] 安装后端依赖..."
cd $APP_DIR/server
npm ci --production

# 初始化数据库
echo "[3/4] 初始化数据库..."
npx prisma generate
npx prisma db push

# 构建前端
echo "[4/4] 构建前端..."
cd $APP_DIR/web
npm ci
npm run build

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "请编辑 $APP_DIR/server/.env 填入你的API Key"
echo ""
echo "启动服务: pm2 start $APP_DIR/server/src/index.js --name travel-server"
echo "查看日志: pm2 logs travel-server"
echo ""
