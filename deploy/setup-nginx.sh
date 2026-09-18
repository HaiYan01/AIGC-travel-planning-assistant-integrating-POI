#!/bin/bash

# Nginx配置脚本

echo "========================================="
echo "  配置Nginx"
echo "========================================="

read -p "请输入你的域名或服务器IP: " SERVER_NAME

# 备份原配置
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

# 创建新配置
cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name ${SERVER_NAME};

    # 前端静态文件
    location / {
        root /opt/travel-planner/web/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # 后端API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    client_max_body_size 10M;
}
EOF

# 测试配置
nginx -t

# 重启Nginx
systemctl restart nginx

echo ""
echo "Nginx配置完成！"
echo "访问地址: http://${SERVER_NAME}"
