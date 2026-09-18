# 部署指南

AI旅行规划助手部署到云服务器的完整指南。

## 系统要求

- Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- Node.js 18+
- MySQL 8.0+
- Nginx

## 准备工作

### 1. 购买服务器

推荐配置：2核4G，Ubuntu 22.04

### 2. 准备API密钥

| 服务 | 获取地址 |
|------|----------|
| 高德地图 | https://console.amap.com |
| 智谱AI | https://open.bigmodel.cn |
| 百度AI | https://console.bce.baidu.com |

## 部署步骤

### 1. 连接服务器

```bash
ssh root@你的服务器IP
```

### 2. 安装环境

```bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装MySQL
apt install -y mysql-server

# 安装Nginx
apt install -y nginx

# 安装PM2
npm install -g pm2
```

### 3. 配置MySQL

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE travel_planner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（可选）
CREATE USER 'travel'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON travel_planner.* TO 'travel'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. 上传代码

**方式一：Git**

```bash
mkdir -p /opt/travel-planner
cd /opt/travel-planner
git clone https://github.com/your-username/travel-planner.git .
```

**方式二：FileZilla**

使用FileZilla上传项目文件到 `/opt/travel-planner/`

### 5. 配置环境变量

```bash
cd /opt/travel-planner
cp server/.env.example server/.env
nano server/.env
```

配置内容：

```env
PORT=3000
NODE_ENV=production

DATABASE_URL="mysql://root:your_password@localhost:3306/travel_planner"

JWT_SECRET="你的64位随机字符串"
JWT_EXPIRES_IN="7d"

# 智谱AI
AI_API_KEY="你的智谱API Key"
AI_API_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
AI_MODEL="glm-4-flash"

# 百度AI (ClawBot)
BAIDU_APP_ID="你的百度AI应用ID"
BAIDU_SECRET_KEY="你的百度AI密钥"
BAIDU_API_URL="https://agentapi.baidu.com/assistant/getAnswer"

# 高德地图
AMAP_KEY="你的高德地图Key"
AMAP_SECURITY_CODE="你的高德安全码"
```

### 6. 构建前端

```bash
cd /opt/travel-planner/web
npm install
npm run build
```

### 7. 初始化数据库

```bash
cd /opt/travel-planner/server
npm install
npx prisma db push
```

### 8. 配置Nginx

```bash
nano /etc/nginx/sites-available/travel-planner
```

配置内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 或服务器IP

    # 前端
    location / {
        root /opt/travel-planner/web/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/travel-planner /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 9. 启动服务

```bash
cd /opt/travel-planner/server
pm2 start src/index.js --name travel-server
pm2 startup
pm2 save
```

### 10. 开放端口

在云服务器控制台：
- 开放TCP 80端口（HTTP）
- 开放TCP 443端口（HTTPS）

## 配置HTTPS（可选）

```bash
# 安装Certbot
apt install -y certbot python3-certbot-nginx

# 获取SSL证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

## 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs travel-server

# 重启服务
pm2 restart travel-server

# 停止服务
pm2 stop travel-server

# 重启Nginx
systemctl restart nginx
```

## 故障排查

### 502 Bad Gateway

```bash
# 检查后端是否运行
pm2 status

# 检查端口是否监听
netstat -tlnp | grep 3000
```

### 数据库连接失败

```bash
# 检查MySQL状态
systemctl status mysql

# 测试连接
mysql -u root -p travel_planner
```

### 前端白屏

```bash
# 重新构建前端
cd /opt/travel-planner/web
npm run build
```

## 更新部署

```bash
cd /opt/travel-planner
git pull
cd web && npm run build
cd ../server && npx prisma db push
pm2 restart travel-server
```

## 管理员账号

默认管理员：
- 通过脚本创建(密码自己设置):
```bash
cd server && ADMIN_PASSWORD=你的密码 node create-admin.mjs
```

**请登录后立即修改密码！**
