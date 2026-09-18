# AI旅行规划助手 - 桌面端开发笔记

## 项目概述

AI旅行规划助手桌面端使用WebView嵌入Web版本，实现多平台同步。

支持平台：
- **Windows**: x64 和 ARM64
- **macOS**: Intel 和 Apple Silicon
- **Linux**: x64 和 ARM64（包括LoongArch、统信UOS）

## 技术选型

| 平台 | 技术方案 | 原因 |
|------|----------|------|
| Windows | PyQt6-WebEngine | 稳定，功能完整 |
| macOS | pywebview (WebKit) | PyQt6在ARM Mac闪退 |
| Linux | PyQt6-WebEngine | 跨发行版兼容 |

## 文件结构

原 `desktop-pyqt/` 已拆分为三个平台目录：

```
desktop-windows/            # Windows（x64 / ARM64）
├── main_webview.py         # 入口文件（x64，推荐）
├── main_webview_arm.py     # 入口文件（ARM64）
├── main.py                 # 备用入口
├── logo.png                # Windows图标
├── requirements.txt        # Python依赖
├── run.bat                 # Windows启动脚本
├── BUILD.md                # 打包说明
└── README.md               # 使用说明

desktop-mac/                # macOS（Intel / Apple Silicon）
├── main_mac_fix.py         # 入口文件（pywebview）
├── main_mac_webview.py     # 备用入口
├── main_mac_final.py       # 备用入口（系统浏览器方案）
└── logo.icns               # macOS图标

desktop-linux/              # Linux（x64 / ARM64）
├── main.py                 # 入口文件
├── logo.png                # 图标
├── build.sh                # 打包脚本
├── install.sh              # 安装脚本
├── uninstall.sh            # 卸载脚本
└── requirements.txt        # Python依赖
```

## Windows版本

### 核心功能

1. **WebView加载**：使用PyQt6-WebEngine加载Web版本
2. **外部链接处理**：拦截外部链接，在系统浏览器打开
3. **服务器切换**：支持远程/本地服务器切换
4. **本地首页**：渐变紫色背景的本地首页

### 代码结构

```python
# 主要类
class MainWindow(QMainWindow)      # 主窗口
class CustomWebPage(QWebEnginePage) # 自定义页面（处理外部链接）

# 主要功能
- load_home()        # 加载本地首页
- navigate(path)     # 导航到功能页面
- on_load_finished() # 页面加载完成后注入JS
- handle_external_link() # 处理外部链接
```

### 外部链接处理

```python
class CustomWebPage(QWebEnginePage):
    def acceptNavigationRequest(self, url, nav_type, is_main_frame):
        url_str = url.toString()
        
        # 拦截外部链接
        if not is_internal_url(url_str):
            webbrowser.open(url_str)
            return False
        
        return True
```

## macOS版本

### 核心问题

PyQt6-WebEngine在ARM Mac（M1/M2/M3）上会闪退，原因是Chromium内核兼容性问题。

### 解决方案

使用pywebview（基于系统WebKit）替代PyQt6-WebEngine。

```python
import webview

window = webview.create_window(
    title="AI旅行规划助手",
    url=SERVER,
    js_api=api
)
webview.start()
```

### 外部链接处理

使用JavaScript拦截链接点击，调用Python API在系统浏览器打开：

```javascript
document.addEventListener('click', function(e) {
    var target = e.target;
    while (target && target.tagName !== 'A') {
        target = target.parentElement;
    }
    if (target && target.href && !isInternal(target.href)) {
        e.preventDefault();
        window.pywebview.api.open_in_browser(target.href);
    }
}, true);
```

## Linux版本

### 核心问题

1. pywebview在Fedora上无法加载远程URL
2. 不同发行版的依赖不同

### 解决方案

使用PyQt6-WebEngine（与Windows版相同代码）。

```python
# 安装依赖
sudo apt install python3-tk libminizip-dev  # Ubuntu
sudo dnf install python3-tkinter minizip     # Fedora
```

## 打包指南

### Windows

```bash
pip install PyQt6 PyQt6-WebEngine PyInstaller Pillow

pyinstaller --name "AI旅行规划助手" --windowed --onedir \
    --icon logo.png --add-data "logo.png;." \
    --hidden-import PyQt6 --hidden-import PyQt6.sip \
    --hidden-import PyQt6.QtWebEngineWidgets \
    --hidden-import PyQt6.QtWebEngineCore \
    --hidden-import PyQt6.QtWebChannel \
    --noconfirm main_webview.py
```

### macOS

```bash
# 在 desktop-mac/ 目录下执行
pip3 install pywebview pyinstaller Pillow

pyinstaller --name "AI旅行规划助手" --windowed --onedir \
    --icon logo.icns --add-data "logo.icns:." \
    --hidden-import webview \
    --hidden-import webview.platforms.cocoa \
    --noconfirm main_mac_fix.py

xattr -cr dist/AI旅行规划助手.app
```

### Linux

```bash
# 在 desktop-linux/ 目录下执行
pip3 install PyQt6 PyQt6-WebEngine pyinstaller

pyinstaller --name "AI旅行规划助手" --windowed --onedir \
    --icon logo.png --add-data "logo.png:." \
    --hidden-import PyQt6 --hidden-import PyQt6.sip \
    --hidden-import PyQt6.QtWebEngineWidgets \
    --hidden-import PyQt6.QtWebEngineCore \
    --hidden-import PyQt6.QtWebChannel \
    --noconfirm main.py
```

## 打包体积

| 平台 | 大小 | 原因 |
|------|------|------|
| Windows | ~500MB | 包含Chromium内核 |
| macOS | ~30MB | 使用系统WebKit |
| Linux | ~500MB | 包含Chromium内核 |

## 踩坑记录

### 1. macOS ARM闪退

**现象**：点击任何按钮都闪退

**原因**：Chromium在ARM Mac不兼容

**解决**：使用pywebview替代PyQt6-WebEngine

### 2. 外部链接无法跳转

**现象**：点击"预订门票"无反应

**原因**：WebView默认阻止新窗口打开

**解决**：注入JavaScript拦截 + Python API

### 3. 链接打开两次

**现象**：点击一次打开两个标签

**原因**：事件冒泡导致多次触发

**解决**：添加1秒防重复机制

### 4. 图标格式错误

**现象**：打包失败 - icon format error

**原因**：Windows需要ICO，macOS需要ICNS

**解决**：安装Pillow自动转换

### 5. Windows ARM缺少VC++

**现象**：DLL load failed

**原因**：缺少VC++运行库

**解决**：安装 vc_redist.x64.exe

### 6. Fedora pywebview无法加载URL

**现象**：页面一直转圈

**原因**：WebKit配置问题

**解决**：使用PyQt6-WebEngine替代

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+H | 首页 |
| Ctrl+1~6 | 功能导航 |
| F5 | 刷新 |
| F11 | 全屏 |
| Esc | 退出全屏 |

## 服务器配置

支持切换服务器：

```python
SERVER = "http://<服务器地址>"      # 生产环境服务器地址
LOCAL = "http://localhost:5174"    # 本地前端开发服务器
```

点击工具栏「⚙️ 服务器」切换。后端 API 默认端口为 3000（本地开发若用 3001，需与 `web/vite.config.js` 的代理配置一致）。

## 更新日志

### v1.0.0 (2026-03-25)
- 初始版本
- 支持Windows、macOS、Linux
- WebView嵌入Web版本
- 外部链接在系统浏览器打开
- 服务器切换功能

---

*文档更新日期: 2026-03-29*
