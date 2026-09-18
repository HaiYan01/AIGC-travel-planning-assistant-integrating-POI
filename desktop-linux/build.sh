#!/bin/bash
# AI旅行规划助手 - Linux打包脚本
# 适用于所有Linux发行版（Ubuntu、Debian、CentOS、Fedora、Arch等）

set -e

cd "$(dirname "$0")"

echo "========================================="
echo "  AI旅行规划助手 - Linux 打包脚本"
echo "========================================="
echo ""

# 检测架构
ARCH=$(uname -m)
echo "当前架构: $ARCH"

# 映射架构名称
case $ARCH in
    x86_64)
        ARCH_NAME="x64"
        ;;
    aarch64|arm64)
        ARCH_NAME="arm64"
        ;;
    *)
        ARCH_NAME="$ARCH"
        ;;
esac

OUTPUT_NAME="AI旅行规划助手-linux-${ARCH_NAME}"
echo "输出名称: $OUTPUT_NAME"
echo ""

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到Python3"
    echo ""
    echo "请安装Python3："
    echo "  Ubuntu/Debian: sudo apt install python3 python3-pip python3-tk"
    echo "  CentOS/RHEL:   sudo yum install python3 python3-pip python3-tkinter"
    echo "  Fedora:        sudo dnf install python3 python3-pip python3-tkinter"
    echo "  Arch Linux:    sudo pacman -S python python-pip tk"
    exit 1
fi

# 安装依赖
echo "[1/3] 安装依赖..."
pip3 install --user pywebview pyinstaller 2>/dev/null || pip3 install pywebview pyinstaller

# 清理旧文件
rm -rf build dist *.spec

echo ""
echo "[2/3] 打包中..."

# 打包
pyinstaller \
    --name "$OUTPUT_NAME" \
    --windowed \
    --onedir \
    --add-data "logo.png:." \
    --hidden-import webview \
    --hidden-import webview.platforms.gtk \
    --hidden-import webview.platforms.qt \
    --noconfirm \
    main.py

if [ $? -ne 0 ]; then
    echo "打包失败！"
    exit 1
fi

echo ""
echo "[3/3] 创建启动脚本..."

# 创建启动脚本
cat > "dist/$OUTPUT_NAME/start.sh" << EOF
#!/bin/bash
cd "\$(dirname "\$0")"
./$OUTPUT_NAME
EOF
chmod +x "dist/$OUTPUT_NAME/start.sh"

# 创建桌面文件
cat > "dist/$OUTPUT_NAME/ai-travel-planner.desktop" << EOF
[Desktop Entry]
Name=AI旅行规划助手
Name[zh_CN]=AI旅行规划助手
Comment=AI-powered travel planner
Comment[zh_CN]=AI驱动的旅行规划助手
Exec=$PWD/dist/$OUTPUT_NAME/$OUTPUT_NAME
Icon=$PWD/dist/$OUTPUT_NAME/logo.png
Terminal=false
Type=Application
Categories=Utility;Travel;Network;
Keywords=travel;planner;ai;
EOF

echo ""
echo "========================================="
echo "  打包完成！"
echo "========================================="
echo ""
echo "产物位置: dist/$OUTPUT_NAME/"
echo "运行命令: ./dist/$OUTPUT_NAME/start.sh"
echo ""
echo "安装到系统（可选）："
echo "  bash install.sh"
echo ""
