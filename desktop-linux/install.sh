#!/bin/bash
# AI旅行规划助手 - Linux安装脚本
# 将应用安装到系统

set -e

cd "$(dirname "$0")"

# 查找打包产物
DIST_DIR=$(find dist -maxdepth 1 -name "AI旅行规划助手-linux-*" -type d | head -1)

if [ -z "$DIST_DIR" ]; then
    echo "[错误] 未找到打包产物，请先运行 build.sh"
    exit 1
fi

echo "========================================="
echo "  AI旅行规划助手 - 安装脚本"
echo "========================================="
echo ""

# 安装目录
INSTALL_DIR="$HOME/.local/share/ai-travel-planner"
DESKTOP_DIR="$HOME/.local/share/applications"
BIN_DIR="$HOME/.local/bin"

echo "安装目录: $INSTALL_DIR"
echo ""

# 创建目录
mkdir -p "$INSTALL_DIR"
mkdir -p "$DESKTOP_DIR"
mkdir -p "$BIN_DIR"

# 复制文件
echo "[1/3] 复制文件..."
cp -r "$DIST_DIR"/* "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR"/*

# 创建符号链接
echo "[2/3] 创建命令链接..."
ln -sf "$INSTALL_DIR/start.sh" "$BIN_DIR/ai-travel-planner"

# 创建桌面文件
echo "[3/3] 创建桌面快捷方式..."
cat > "$DESKTOP_DIR/ai-travel-planner.desktop" << EOF
[Desktop Entry]
Name=AI旅行规划助手
Name[zh_CN]=AI旅行规划助手
Comment=AI-powered travel planner
Comment[zh_CN]=AI驱动的旅行规划助手
Exec=$INSTALL_DIR/start.sh
Icon=$INSTALL_DIR/logo.png
Terminal=false
Type=Application
Categories=Utility;Travel;Network;
Keywords=travel;planner;ai;
EOF

# 更新桌面数据库
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
fi

echo ""
echo "========================================="
echo "  安装完成！"
echo "========================================="
echo ""
echo "启动方式："
echo "  1. 在应用菜单中搜索 'AI旅行规划助手'"
echo "  2. 终端运行: ai-travel-planner"
echo "  3. 直接运行: $INSTALL_DIR/start.sh"
echo ""
echo "卸载方式："
echo "  bash uninstall.sh"
echo ""
