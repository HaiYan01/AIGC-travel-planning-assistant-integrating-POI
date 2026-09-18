#!/bin/bash

# MySQL数据库配置脚本

echo "========================================="
echo "  配置MySQL数据库"
echo "========================================="

# 设置MySQL root密码
read -sp "请设置MySQL root密码: " DB_PASSWORD
echo ""

# 配置MySQL
mysql -u root <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS travel_planner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EOF

echo ""
echo "数据库创建成功！"
echo "数据库名: travel_planner"
echo "用户名: root"
echo ""

# 保存数据库信息
cat > /opt/travel-planner/db-info.txt <<EOF
数据库配置信息
================
主机: localhost
端口: 3306
用户名: root
密码: ${DB_PASSWORD}
数据库名: travel_planner
连接字符串: mysql://root:${DB_PASSWORD}@localhost:3306/travel_planner
EOF

echo "数据库信息已保存到 /opt/travel-planner/db-info.txt"
