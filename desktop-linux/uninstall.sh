#!/bin/bash
# AI旅行规划助手 - Linux卸载脚本

echo "========================================="
echo "  AI旅行规划助手 - 卸载脚本"
echo "========================================="
echo ""

# 删除安装目录
INSTALL_DIR="$HOME/.local/share/ai-travel-planner"
if [ -d "$INSTALL_DIR" ]; then
    echo "删除安装目录..."
    rm -rf "$INSTALL_DIR"
fi

# 删除桌面文件
DESKTOP_FILE="$HOME/.local/share/applications/ai-travel-planner.desktop"
if [ -f "$DESKTOP_FILE" ]; then
    echo "删除桌面快捷方式..."
    rm -f "$DESKTOP_FILE"
fi

# 删除命令链接
BIN_LINK="$HOME/.local/bin/ai-travel-planner"
if [ -L "$BIN_LINK" ]; then
    echo "删除命令链接..."
    rm -f "$BIN_LINK"
fi

# 更新桌面数据库
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
fi

echo ""
echo "卸载完成！"
echo ""
