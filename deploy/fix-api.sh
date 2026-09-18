#!/bin/bash
# 在服务器上快速更新 AI / 高德 API 配置
# 说明:密钥通过环境变量传入,脚本内不保存任何真实密钥
#
# 用法示例:
#   AI_API_KEY=你的Key AMAP_KEY=你的Key AMAP_SECURITY_CODE=你的安全密钥 bash deploy/fix-api.sh
#
# 可用环境变量:
#   ENV_FILE              后端 .env 路径,默认 /opt/travel-planner/server/.env
#   AI_API_KEY            AI 大模型 Key
#   AMAP_KEY              高德 Web 服务 Key
#   AMAP_SECURITY_CODE    高德 JS API 安全密钥

set -e

ENV_FILE="${ENV_FILE:-/opt/travel-planner/server/.env}"

if [ ! -f "$ENV_FILE" ]; then
    echo "错误: 找不到配置文件 $ENV_FILE"
    exit 1
fi

: "${AI_API_KEY:=API_KEY}"
: "${AMAP_KEY:=API_KEY}"
: "${AMAP_SECURITY_CODE:=API_KEY}"

echo "========================================="
echo "  更新 AI / 高德 API 配置"
echo "========================================="
echo "当前配置(脱敏):"
grep -E "AI_API_KEY|AMAP_KEY|AMAP_SECURITY_CODE" "$ENV_FILE" | sed -E 's/=(.{6}).*/=\1***/'

sed -i "s|^AI_API_KEY=.*|AI_API_KEY=\"$AI_API_KEY\"|" "$ENV_FILE"
sed -i "s|^AMAP_KEY=.*|AMAP_KEY=\"$AMAP_KEY\"|" "$ENV_FILE"
sed -i "s|^AMAP_SECURITY_CODE=.*|AMAP_SECURITY_CODE=\"$AMAP_SECURITY_CODE\"|" "$ENV_FILE"

echo ""
echo "更新完成,正在重启后端服务..."
if command -v pm2 >/dev/null 2>&1; then
    pm2 restart travel-server
else
    echo "(未检测到 pm2,请手动重启后端服务)"
fi
echo "完成。"
