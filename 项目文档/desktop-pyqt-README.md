# AI旅行规划助手 - PyQt桌面版

基于PyQt6 WebView的桌面应用，功能与Web版本完全同步。

> 注意：原 `desktop-pyqt/` 单目录已拆分为 `desktop-windows/`（Windows）、`desktop-linux/`（Linux）、`desktop-mac/`（macOS）三个目录，本文档中的路径与入口文件已按新目录更新。

## 功能特性

- 🎯 AI智能行程生成
- 🗺️ 地图可视化（高德地图）
- ☁️ 天气查询与预报
- 🚄 交通查询（12306、携程）
- 🎫 景点门票预订
- 💱 汇率转换
- 👥 攻略社区
- 🤖 AI助手（智谱AI）
- 🤖 ClawBot（百度AI，白名单限制）
- 🔒 隐私保护

## 系统要求

- Python 3.8+
- Windows 10+ / macOS 10.15+ / Linux

## 安装依赖

```bash
pip install PyQt6 PyQt6-WebEngine PyInstaller Pillow
```

## 运行

```bash
# Windows（在 desktop-windows/ 目录下）
python main_webview.py

# macOS（在 desktop-mac/ 目录下）
python3 main_mac_fix.py

# Linux（在 desktop-linux/ 目录下）
python3 main.py
```

或双击 `run.bat` (Windows)

## 打包

### Windows
```bash
# 进入 desktop-windows/ 目录

# 安装依赖
pip install PyQt6 PyQt6-WebEngine PyInstaller Pillow

# 打包
pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.png --add-data "logo.png;." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --hidden-import PyQt6.QtWebChannel --noconfirm main_webview.py
```

### macOS
```bash
# 进入 desktop-mac/ 目录

# 安装依赖（macOS 使用 pywebview）
pip3 install pywebview pyinstaller Pillow

# 打包
pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.icns --add-data "logo.icns:." --hidden-import webview --hidden-import webview.platforms.cocoa --noconfirm main_mac_fix.py

# 移除隔离属性
xattr -cr dist/AI旅行规划助手.app
```

### Linux
```bash
# 进入 desktop-linux/ 目录

# 安装依赖
pip3 install PyQt6 PyQt6-WebEngine pyinstaller

# 打包
pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.png --add-data "logo.png:." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --noconfirm main.py
```

## 打包产物

| 系统 | 产物位置 |
|------|----------|
| Windows | `dist/AI旅行规划助手/AI旅行规划助手.exe` |
| macOS | `dist/AI旅行规划助手.app` |
| Linux | `dist/AI旅行规划助手/AI旅行规划助手` |

## 服务器配置

点击工具栏「⚙️ 服务器」切换：
- 远程服务器: `http://<服务器地址>`
- 本地服务器: `http://localhost:5174`（前端开发服务器地址；后端默认端口为 3000）

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
| Esc | 退出全屏 |

## 目录结构

原 `desktop-pyqt/` 已按平台拆分为三个目录，入口文件各不相同：

```
desktop-windows/                 # Windows（x64 / ARM64）
├── main_webview.py              # 入口文件（x64，推荐）
├── main_webview_arm.py          # 入口文件（ARM64）
├── main.py                      # 备用入口
├── logo.png
├── run.bat                      # 启动脚本
├── BUILD.md                     # 打包说明
└── requirements.txt

desktop-linux/                   # Linux（x64 / ARM64）
├── main.py                      # 入口文件
├── logo.png
├── build.sh / install.sh / uninstall.sh
└── requirements.txt

desktop-mac/                     # macOS（Intel / Apple Silicon）
├── main_mac_fix.py              # 入口文件（pywebview，推荐）
├── main_mac_webview.py          # 备用入口
├── main_mac_final.py            # 备用入口（系统浏览器方案）
└── logo.icns
```

跨平台打包说明见 [打包指南](./BUILD.md)。

## 外部链接

点击"预订门票"等外部链接会在系统浏览器中打开，并提示用户即将跳转到第三方网站。

## 注意事项

1. **Windows ARM**: 需要安装VC++运行库
2. **macOS**: 首次运行需要在"系统偏好设置 > 安全性与隐私"中允许
3. **Linux**: 需要安装 `minizip` 包
