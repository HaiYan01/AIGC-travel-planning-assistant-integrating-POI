"""
AI旅行规划助手 - 桌面版 (WebView)
功能与Web版本完全同步
支持外部链接在系统浏览器中打开
"""

import sys
import os
import webbrowser

# 环境变量配置
os.environ['QTWEBENGINE_CHROMIUM_FLAGS'] = '--no-sandbox'
os.environ['QT_MAC_WANTS_LAYER'] = '1'  # macOS兼容

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QStackedWidget, QInputDialog, QMessageBox
)
from PyQt6.QtCore import Qt, QUrl, QSettings
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebEngineCore import QWebEnginePage
from PyQt6.QtGui import QFont, QIcon


def get_icon_path():
    """获取图标路径"""
    if getattr(sys, 'frozen', False):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, 'logo.png')


class CustomWebPage(QWebEnginePage):
    """自定义页面，处理外部链接"""
    
    def createWindow(self, type):
        """返回一个临时页面用于捕获URL"""
        return CustomWebPage(self.profile(), self)
    
    def acceptNavigationRequest(self, url, type, isMainFrame):
        """拦截导航请求"""
        url_str = url.toString()
        
        # 如果是外部链接（不是当前服务器的链接）
        if isMainFrame and not url_str.startswith("https://wanghaiyan.cn") and not url_str.startswith("http://localhost"):
            if url_str.startswith("http://") or url_str.startswith("https://"):
                webbrowser.open(url_str)
                return False
        
        return super().acceptNavigationRequest(url, type, isMainFrame)


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.settings = QSettings("TravelPlanner", "Desktop")
        self.setWindowTitle("AI旅行规划助手")
        self.resize(1300, 850)

        # 设置窗口图标
        icon_path = get_icon_path()
        if os.path.exists(icon_path):
            self.setWindowIcon(QIcon(icon_path))

        # 中心部件
        central = QWidget()
        self.setCentralWidget(central)
        vbox = QVBoxLayout(central)
        vbox.setContentsMargins(0, 0, 0, 0)
        vbox.setSpacing(0)

        # 工具栏
        self.toolbar = QWidget()
        self.toolbar.setFixedHeight(46)
        self.toolbar.setStyleSheet("background: white; border-bottom: 1px solid #ddd;")
        hbox = QHBoxLayout(self.toolbar)
        hbox.setContentsMargins(8, 0, 8, 0)

        s = "QPushButton{background:transparent;border:none;padding:8px 14px;border-radius:6px;font-size:13px;}QPushButton:hover{background:#f0f0f0;}"

        self.btn_home = QPushButton("🏠 首页")
        self.btn_home.setStyleSheet(s)
        self.btn_home.clicked.connect(self.on_home)
        hbox.addWidget(self.btn_home)

        for text, slot in [
            ("✨ 生成行程", lambda: self.on_nav("/generate")),
            ("👥 攻略社区", lambda: self.on_nav("/community")),
            ("🌤️ 天气", lambda: self.on_nav("/weather")),
            ("💱 汇率", lambda: self.on_nav("/exchange")),
            ("🤖 AI助手", lambda: self.on_nav("/chat")),
            ("📋 我的", lambda: self.on_nav("/my-plans")),
        ]:
            b = QPushButton(text)
            b.setStyleSheet(s)
            b.clicked.connect(slot)
            hbox.addWidget(b)

        hbox.addStretch()

        # 服务器设置按钮
        self.btn_settings = QPushButton("⚙️ 服务器")
        self.btn_settings.setStyleSheet(s)
        self.btn_settings.clicked.connect(self.show_settings)
        hbox.addWidget(self.btn_settings)

        vbox.addWidget(self.toolbar)

        # 页面栈
        self.stack = QStackedWidget()
        vbox.addWidget(self.stack)

        # 首页
        self.home_page = QWidget()
        self.home_page.setStyleSheet("background: qlineargradient(x1:0,y1:0,x2:1,y2:1,stop:0 #667eea,stop:1 #764ba2);")
        self.stack.addWidget(self.home_page)

        # 首页布局
        hv = QVBoxLayout(self.home_page)
        hv.setAlignment(Qt.AlignmentFlag.AlignCenter)
        hv.setSpacing(20)

        for text, css in [
            ("🧭", "font-size:72px;"),
            ("AI旅行规划助手", "font-size:32px;font-weight:bold;color:white;"),
            ("让AI为你规划完美旅程", "font-size:14px;color:rgba(255,255,255,0.8);"),
        ]:
            l = QLabel(text)
            l.setStyleSheet(css + "background:transparent;")
            l.setAlignment(Qt.AlignmentFlag.AlignCenter)
            hv.addWidget(l)

        hv.addSpacing(10)

        # 主按钮
        r1 = QHBoxLayout()
        r1.setAlignment(Qt.AlignmentFlag.AlignCenter)
        r1.setSpacing(20)
        r1.addWidget(self._big_btn("✨", "生成行程", "/generate"))
        r1.addWidget(self._big_btn("👥", "攻略社区", "/community"))
        hv.addLayout(r1)

        # 次按钮
        r2 = QHBoxLayout()
        r2.setAlignment(Qt.AlignmentFlag.AlignCenter)
        r2.setSpacing(12)
        for icon, text, path in [("🌤️","天气查询","/weather"),("💱","汇率转换","/exchange"),("🤖","AI助手","/chat"),("📋","我的行程","/my-plans")]:
            r2.addWidget(self._small_btn(icon, text, path))
        hv.addLayout(r2)

        hv.addStretch()

        # 服务器信息
        self.server_label = QLabel(f"当前服务器: {self.get_server()}")
        self.server_label.setStyleSheet("font-size:11px;color:rgba(255,255,255,0.6);background:transparent;")
        self.server_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        hv.addWidget(self.server_label)

        # WebView - 使用自定义页面
        self.web = QWebEngineView()
        self.custom_page = CustomWebPage(self.web.page().profile(), self.web)
        self.web.setPage(self.custom_page)
        self.stack.addWidget(self.web)
        self.web.titleChanged.connect(self._on_title)

    def get_server(self):
        return self.settings.value("server", "https://wanghaiyan.cn")

    def _big_btn(self, icon, text, path):
        b = QPushButton()
        b.setFixedSize(200, 90)
        b.setCursor(Qt.CursorShape.PointingHandCursor)
        b.setStyleSheet("QPushButton{background:white;border:none;border-radius:14px;}QPushButton:hover{background:#eee;}")
        inner = QVBoxLayout(b)
        inner.setSpacing(4)
        l1 = QLabel(icon)
        l1.setStyleSheet("font-size:28px;background:transparent;")
        l1.setAlignment(Qt.AlignmentFlag.AlignCenter)
        inner.addWidget(l1)
        l2 = QLabel(text)
        l2.setStyleSheet("font-size:16px;font-weight:bold;color:#333;background:transparent;")
        l2.setAlignment(Qt.AlignmentFlag.AlignCenter)
        inner.addWidget(l2)
        b.clicked.connect(lambda checked=False, p=path: self.on_nav(p))
        return b

    def _small_btn(self, icon, text, path):
        b = QPushButton(f"{icon} {text}")
        b.setFixedSize(140, 44)
        b.setCursor(Qt.CursorShape.PointingHandCursor)
        b.setStyleSheet("QPushButton{background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);border-radius:8px;color:white;font-size:13px;font-weight:bold;}QPushButton:hover{background:rgba(255,255,255,0.35);}")
        b.clicked.connect(lambda checked=False, p=path: self.on_nav(p))
        return b

    def on_home(self):
        self.stack.setCurrentWidget(self.home_page)
        self.setWindowTitle("AI旅行规划助手")

    def on_nav(self, path):
        server = self.get_server()
        self.web.setUrl(QUrl(server + path))
        self.stack.setCurrentWidget(self.web)

    def _on_title(self, t):
        if self.stack.currentWidget() == self.web and t:
            self.setWindowTitle(f"{t} - AI旅行规划助手")

    def show_settings(self):
        current = self.get_server()
        servers = [
            "远程服务器: https://wanghaiyan.cn",
            "本地服务器: http://localhost:5174",
            "自定义地址"
        ]
        item, ok = QInputDialog.getItem(
            self, "选择服务器", 
            "当前服务器: " + current,
            servers, 0, False
        )
        if ok and item:
            if "远程" in item:
                new_server = "https://wanghaiyan.cn"
            elif "本地" in item:
                new_server = "http://localhost:5174"
            else:
                text, ok = QInputDialog.getText(
                    self, "自定义服务器",
                    "请输入服务器地址:",
                    text=current
                )
                if ok and text:
                    new_server = text
                else:
                    return
            self.settings.setValue("server", new_server)
            self.server_label.setText(f"当前服务器: {new_server}")
            QMessageBox.information(self, "设置", f"服务器已更新为: {new_server}\n请重新导航到页面以生效")

    def keyPressEvent(self, e):
        k, m = e.key(), e.modifiers()
        if m == Qt.KeyboardModifier.ControlModifier:
            if k == Qt.Key.Key_H: self.on_home()
            elif k == Qt.Key.Key_1: self.on_nav("/generate")
            elif k == Qt.Key.Key_2: self.on_nav("/community")
            elif k == Qt.Key.Key_3: self.on_nav("/weather")
            elif k == Qt.Key.Key_4: self.on_nav("/exchange")
            elif k == Qt.Key.Key_5: self.on_nav("/chat")
            elif k == Qt.Key.Key_6: self.on_nav("/my-plans")
        elif k == Qt.Key.Key_F5 and self.stack.currentWidget() == self.web:
            self.web.reload()
        elif k == Qt.Key.Key_F11:
            self.showNormal() if self.isFullScreen() else self.showFullScreen()


def main():
    app = QApplication(sys.argv)
    app.setFont(QFont("Microsoft YaHei", 10))
    w = MainWindow()
    w.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
