# AI旅行规划助手 - PyQt桌面版

基于PyQt6 WebView的桌面应用，功能与Web版本完全同步。

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
# Windows
python main_webview.py

# macOS
python3 main_webview.py

# Linux
python3 main_webview.py
```

或双击 `run.bat` (Windows)

## 打包

### Windows
```bash
# 安装依赖
pip install PyQt6 PyQt6-WebEngine PyInstaller Pillow

# 打包
pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.png --add-data "logo.png;." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --hidden-import PyQt6.QtWebChannel --noconfirm main_webview.py
```

### macOS
```bash
# 安装依赖
pip3 install PyQt6 PyQt6-WebEngine pyinstaller Pillow

# 打包
pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.icns --add-data "logo.icns:." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --noconfirm main_webview.py

# 移除隔离属性
xattr -cr dist/AI旅行规划助手.app
```

### Linux
```bash
# 安装依赖
pip3 install PyQt6 PyQt6-WebEngine pyinstaller

# 打包
pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.png --add-data "logo.png:." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --noconfirm main_webview.py
```

## 打包产物

| 系统 | 产物位置 |
|------|----------|
| Windows | `dist/AI旅行规划助手/AI旅行规划助手.exe` |
| macOS | `dist/AI旅行规划助手.app` |
| Linux | `dist/AI旅行规划助手/AI旅行规划助手` |

## 服务器配置

点击工具栏「⚙️ 服务器」切换：
- 远程服务器: `https://wanghaiyan.cn`
- 本地服务器: `http://localhost:5174`

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

```
desktop-pyqt/
├── main_webview.py        # WebView版本主程序（推荐）
├── main_mac_webview.py    # macOS专用版本
├── main_webview_arm.py    # Windows ARM专用版本
├── logo.png               # Windows图标
├── logo.icns              # macOS图标
├── requirements.txt       # Python依赖
├── run.bat                # Windows启动脚本
├── build-windows.bat      # Windows打包脚本
├── build-mac.sh           # macOS打包脚本
├── build-linux.sh         # Linux打包脚本
└── BUILD.md               # 打包说明文档
```

## 外部链接

点击"预订门票"等外部链接会在系统浏览器中打开，并提示用户即将跳转到第三方网站。

## 注意事项

1. **Windows ARM**: 需要安装VC++运行库
2. **macOS**: 首次运行需要在"系统偏好设置 > 安全性与隐私"中允许
3. **Linux**: 需要安装 `minizip` 包
