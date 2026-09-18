# 打包指南

> 最后更新：2026-09

## 准备工作

### 1. 复制图标

```bash
# Windows图标
copy logo.png desktop-windows\logo.png

# macOS图标
copy logo.icns desktop-mac\logo.icns
```

### 2. 安装依赖

**Windows:**
```bash
pip install PyQt6 PyQt6-WebEngine PyInstaller Pillow
```

**macOS:**
```bash
pip3 install pywebview pyinstaller Pillow
```

**Linux:**
```bash
pip3 install PyQt6 PyQt6-WebEngine pyinstaller
```

---

## Windows 打包

### x64版本

```bash
cd desktop-windows

# 清理旧文件
rmdir /s /q build dist
del *.spec

# 打包
pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.png --add-data "logo.png;." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --hidden-import PyQt6.QtWebChannel --noconfirm main_webview.py
```

### ARM64版本

```bash
cd desktop-windows

# 清理旧文件
rmdir /s /q build dist
del *.spec

# 打包（使用ARM专用版本）
pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.png --add-data "logo.png;." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --hidden-import PyQt6.QtWebChannel --noconfirm main_webview_arm.py
```

### 产物位置

`dist/AI旅行规划助手/AI旅行规划助手.exe`

### 注意事项

- 需要安装 [VC++运行库](https://aka.ms/vs/17/release/vc_redist.x64.exe)
- 如果提示PIL错误，执行 `pip install Pillow`

---

## macOS 打包

### Intel版本

```bash
cd desktop-mac

# 清理旧文件
rm -rf build dist *.spec

# 打包
pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.icns --add-data "logo.icns:." --hidden-import webview --hidden-import webview.platforms.cocoa --noconfirm main_mac_fix.py

# 移除隔离属性
xattr -cr dist/AI旅行规划助手.app
```

### Apple Silicon版本

```bash
cd desktop-mac

# 使用Rosetta运行（如需要）
arch -x86_64 python3 -m PyInstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.icns --add-data "logo.icns:." --hidden-import webview --hidden-import webview.platforms.cocoa --noconfirm main_mac_fix.py

xattr -cr dist/AI旅行规划助手.app
```

### 产物位置

`dist/AI旅行规划助手.app`

### 注意事项

- 首次运行需要在"系统偏好设置 > 安全性与隐私"中允许
- 图标需要ICNS格式（Pillow会自动转换）

---

## Linux 打包

### x64版本

```bash
cd desktop-linux

# 清理旧文件
rm -rf build dist *.spec

# 打包
pyinstaller --name "AI旅行规划助手-linux-x64" --windowed --onedir --icon logo.png --add-data "logo.png:." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --hidden-import PyQt6.QtWebChannel --noconfirm main.py
```

### ARM64版本

```bash
# 在ARM机器上运行
pyinstaller --name "AI旅行规划助手-linux-arm64" --windowed --onedir --icon logo.png --add-data "logo.png:." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --hidden-import PyQt6.QtWebChannel --noconfirm main.py
```

### 产物位置

`dist/AI旅行规划助手-linux-x64/AI旅行规划助手-linux-x64`

### 系统依赖

**Ubuntu/Debian:**
```bash
sudo apt install python3-tk libminizip-dev
```

**Fedora:**
```bash
sudo dnf install python3-tkinter minizip
```

**Arch:**
```bash
sudo pacman -S tk minizip-ng
```

---

## 打包产物大小

| 平台 | 大小 | 说明 |
|------|------|------|
| Windows x64 | ~500MB | 包含Chromium内核 |
| Windows ARM64 | ~500MB | 包含Chromium内核 |
| macOS Intel | ~30MB | 使用系统WebKit |
| macOS ARM | ~30MB | 使用系统WebKit |
| Linux x64 | ~500MB | 包含Chromium内核 |
| Linux ARM64 | ~500MB | 包含Chromium内核 |

---

## 快速打包命令

### Windows一行命令

```bash
cd desktop-windows && rmdir /s /q build dist 2>nul & del *.spec 2>nul & pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.png --add-data "logo.png;." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --hidden-import PyQt6.QtWebChannel --noconfirm main_webview.py
```

### macOS一行命令

```bash
cd desktop-mac && rm -rf build dist *.spec && pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.icns --add-data "logo.icns:." --hidden-import webview --hidden-import webview.platforms.cocoa --noconfirm main_mac_fix.py && xattr -cr dist/AI旅行规划助手.app
```

### Linux一行命令

```bash
cd desktop-linux && rm -rf build dist *.spec && pyinstaller --name "AI旅行规划助手" --windowed --onedir --icon logo.png --add-data "logo.png:." --hidden-import PyQt6 --hidden-import PyQt6.sip --hidden-import PyQt6.QtWebEngineWidgets --hidden-import PyQt6.QtWebEngineCore --hidden-import PyQt6.QtWebChannel --noconfirm main.py
```
