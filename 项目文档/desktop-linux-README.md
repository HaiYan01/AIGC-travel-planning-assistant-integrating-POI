# AI旅行规划助手 - Linux版

基于PyQt6 WebView的Linux桌面应用，功能与Web版本完全同步。

## 功能特性

- 🎯 AI智能行程生成
- 🗺️ 地图可视化（高德地图）
- ☁️ 天气查询与预报
- 🚄 交通查询（12306、携程）
- 🎫 景点门票预订
- 💱 汇率转换
- 👥 攻略社区
- 🤖 AI助手
- 🔒 隐私保护

## 系统要求

- Python 3.8+
- PyQt6 和 PyQt6-WebEngine

## 支持的发行版

| 发行版 | 支持状态 |
|--------|----------|
| Ubuntu 20.04+ | ✅ |
| Debian 10+ | ✅ |
| Linux Mint | ✅ |
| Fedora | ✅ |
| CentOS 7+ | ✅ |
| Arch Linux | ✅ |
| openSUSE | ✅ |
| 树莓派 (ARM) | ✅ |
| LoongArch | ✅ (使用x64版本+兼容层) |
| 统信UOS | ✅ |

## 快速开始

### 方式1：直接运行

```bash
# 下载并解压
tar -xzf AI旅行规划助手-linux-x64.tar.gz

# 运行
./AI旅行规划助手-linux-x64/start.sh
```

### 方式2：安装到系统

```bash
# 下载并解压
tar -xzf AI旅行规划助手-linux-x64.tar.gz

# 进入目录
cd AI旅行规划助手-linux-x64

# 运行安装脚本
bash install.sh
```

安装后可通过以下方式启动：
- 应用菜单中搜索 "AI旅行规划助手"
- 终端运行 `ai-travel-planner`

### 方式3：从源码构建

```bash
# 进入 desktop-linux/ 目录

# 安装依赖
pip3 install PyQt6 PyQt6-WebEngine pyinstaller

# 打包
bash build.sh

# 安装
bash install.sh
```

## 依赖安装

### Ubuntu / Debian / 统信UOS

```bash
sudo apt update
sudo apt install python3 python3-pip python3-tk libminizip-dev
pip3 install PyQt6 PyQt6-WebEngine pyinstaller
```

### CentOS / RHEL

```bash
sudo yum install python3 python3-pip python3-tkinter minizip
pip3 install PyQt6 PyQt6-WebEngine pyinstaller
```

### Fedora

```bash
sudo dnf install python3 python3-pip python3-tkinter minizip
pip3 install PyQt6 PyQt6-WebEngine pyinstaller
```

### Arch Linux

```bash
sudo pacman -S python python-pip tk minizip-ng
pip install PyQt6 PyQt6-WebEngine pyinstaller
```

## 打包

```bash
# 在 desktop-linux/ 目录下执行（入口文件为 main.py）

# x64版本
pyinstaller --name "AI旅行规划助手-linux-x64" --windowed --onedir --icon logo.png --add-data "logo.png:." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --hidden-import PyQt6.QtWebChannel --noconfirm main.py

# ARM64版本（在ARM机器上运行同样的命令）
pyinstaller --name "AI旅行规划助手-linux-arm64" --windowed --onedir --icon logo.png --add-data "logo.png:." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --hidden-import PyQt6.QtWebChannel --noconfirm main.py
```

## 打包产物

```
dist/AI旅行规划助手-linux-x64/
├── AI旅行规划助手-linux-x64  # 可执行文件
├── start.sh                   # 启动脚本
├── ai-travel-planner.desktop  # 桌面快捷方式
├── logo.png                   # 图标
└── ...其他依赖文件
```

## 卸载

```bash
bash uninstall.sh
```

## 目录结构

```
desktop-linux/
├── main.py              # 主程序
├── logo.png             # 应用图标
├── build.sh             # 打包脚本
├── install.sh           # 安装脚本
├── uninstall.sh         # 卸载脚本
├── requirements.txt     # Python依赖
└── README.md            # 本文档
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+H | 首页 |
| Ctrl+1 | 生成行程 |
| Ctrl+2 | 攻略社区 |
| Ctrl+3 | 天气查询 |
| Ctrl+4 | 汇率转换 |
| Ctrl+5 | AI助手 |
| Ctrl+6 | 我的行程 |
| F5 | 刷新 |
| F11 | 全屏 |

## 常见问题

### Q: 提示找不到 QtWebEngineWidgets

```bash
pip3 install PyQt6-WebEngine
```

### Q: 提示缺少 libminizip.so

```bash
# Ubuntu/Debian
sudo apt install libminizip-dev

# Fedora
sudo dnf install minizip
```

### Q: 窗口无法显示

检查是否安装了 tkinter：

```bash
# Ubuntu/Debian
sudo apt install python3-tk

# CentOS/RHEL
sudo yum install python3-tkinter
```

### Q: 外部链接无法打开

这通常是系统默认浏览器未设置的问题：

```bash
# 设置默认浏览器
xdg-settings set default-web-browser firefox.desktop
```

### Q: LoongArch/MIPS 设备

请下载 Linux X64 版本，使用兼容层转译运行。

## 许可证

Apache License 2.0 (Apache-2.0)
