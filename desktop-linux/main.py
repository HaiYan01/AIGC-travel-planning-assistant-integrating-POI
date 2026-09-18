#!/usr/bin/env python3
"""
AI旅行规划助手 - Linux版
使用PyQt6-WebEngine + JavaScript拦截外部链接
"""

import sys
import os
import webbrowser

os.environ['QTWEBENGINE_CHROMIUM_FLAGS'] = '--no-sandbox'

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QStackedWidget
)
from PyQt6.QtCore import Qt, QUrl, QObject, pyqtSlot
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebEngineCore import QWebEnginePage
from PyQt6.QtWebChannel import QWebChannel
from PyQt6.QtGui import QFont

SERVER = "https://wanghaiyan.cn"
LOCAL = "http://localhost:5174"
current_server = SERVER


def get_home_html():
    return f'''<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
    font-family: -apple-system, BlinkMacSystemFont, "Noto Sans", sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
}}
.logo {{ font-size: 80px; margin-bottom: 16px; }}
h1 {{ font-size: 36px; margin-bottom: 8px; }}
.sub {{ font-size: 16px; opacity: 0.8; margin-bottom: 40px; }}
.row {{ display: flex; gap: 20px; margin-bottom: 24px; }}
.btn {{
    padding: 24px 40px;
    border: none;
    border-radius: 16px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s;
}}
.btn:hover {{ transform: translateY(-4px); }}
.primary {{ background: white; color: #333; }}
.green {{ background: #10b981; color: white; }}
.sub-row {{ display: flex; gap: 12px; }}
.small {{
    padding: 14px 24px;
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 10px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    text-decoration: none;
}}
.small:hover {{ background: rgba(255,255,255,0.35); }}
.info {{ margin-top: 40px; font-size: 12px; opacity: 0.6; }}
</style>
</head>
<body>
    <div class="logo">🧭</div>
    <h1>AI旅行规划助手</h1>
    <p class="sub">让AI为你规划完美旅程</p>
    
    <div class="row">
        <a href="{current_server}/generate" class="btn primary">
            <span style="font-size:32px">✨</span>
            <span>生成行程</span>
        </a>
        <a href="{current_server}/community" class="btn green">
            <span style="font-size:32px">👥</span>
            <span>攻略社区</span>
        </a>
    </div>
    
    <div class="sub-row">
        <a href="{current_server}/weather" class="small">🌤️ 天气</a>
        <a href="{current_server}/exchange" class="small">💱 汇率</a>
        <a href="{current_server}/chat" class="small">🤖 AI助手</a>
        <a href="{current_server}/my-plans" class="small">📋 我的</a>
    </div>
    
    <p class="info">当前服务器: {current_server}</p>
</body>
</html>'''


JS_INTERCEPTOR = '''
// 先引入qwebchannel
if (!window.pyBridge && typeof QWebChannel !== 'undefined') {
    new QWebChannel(qt.webChannelTransport, function(channel) {
        window.pyBridge = channel.objects.pyBridge;
    });
}

(function() {
    if (window.__linkInterceptorLoaded) return;
    window.__linkInterceptorLoaded = true;
    
    var lastOpenedUrl = '';
    var lastOpenTime = 0;
    
    function shouldOpen(url) {
        var now = Date.now();
        if (url === lastOpenedUrl && now - lastOpenTime < 1000) return false;
        lastOpenedUrl = url;
        lastOpenTime = now;
        return true;
    }
    
    function isInternal(url) {
        if (!url) return true;
        return url.indexOf('wanghaiyan.cn') >= 0 || 
               url.indexOf('localhost') >= 0 || 
               url.indexOf('127.0.0.1') >= 0 ||
               url.indexOf('javascript:') >= 0 ||
               url.indexOf('#') === 0 ||
               url.indexOf('about:') >= 0;
    }
    
    function openExternal(url) {
        if (window.pyBridge && window.pyBridge.open_in_browser) {
            window.pyBridge.open_in_browser(url);
        } else {
            // 回退：尝试通过fetch调用
            console.log('Opening: ' + url);
        }
    }
    
    // 拦截链接点击
    document.addEventListener('click', function(e) {
        var target = e.target;
        while (target && target.tagName !== 'A') {
            target = target.parentElement;
        }
        if (target && target.href && !isInternal(target.href)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (shouldOpen(target.href)) {
                openExternal(target.href);
            }
            return false;
        }
    }, true);
    
    // 拦截window.open
    var originalOpen = window.open;
    window.open = function(url, name, features) {
        if (url && !isInternal(url)) {
            if (shouldOpen(url)) {
                openExternal(url);
            }
            return null;
        }
        return originalOpen.call(window, url, name, features);
    };
    
    console.log('Link interceptor loaded');
})();
'''


class Bridge(QObject):
    """Python桥接，暴露给JavaScript"""
    
    @pyqtSlot(str)
    def open_in_browser(self, url):
        print(f"Opening in browser: {url}")
        webbrowser.open(url)


class CustomWebPage(QWebEnginePage):
    def javaScriptConsoleMessage(self, level, message, line, source):
        pass  # 忽略控制台消息


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.bridge = Bridge()
        self.setWindowTitle("AI旅行规划助手")
        self.resize(1300, 850)
        
        central = QWidget()
        self.setCentralWidget(central)
        vbox = QVBoxLayout(central)
        vbox.setContentsMargins(0, 0, 0, 0)
        vbox.setSpacing(0)
        
        # 工具栏
        toolbar = QWidget()
        toolbar.setFixedHeight(46)
        toolbar.setStyleSheet("background: white; border-bottom: 1px solid #ddd;")
        hbox = QHBoxLayout(toolbar)
        hbox.setContentsMargins(8, 0, 8, 0)
        
        btn_style = "QPushButton{background:transparent;border:none;padding:8px 14px;border-radius:6px;font-size:13px;}QPushButton:hover{background:#f0f0f0;}"
        
        btn = QPushButton("🏠 首页")
        btn.setStyleSheet(btn_style)
        btn.clicked.connect(self.show_home)
        hbox.addWidget(btn)
        
        for text, path in [
            ("✨ 生成行程", "/generate"),
            ("👥 攻略社区", "/community"),
            ("🌤️ 天气", "/weather"),
            ("💱 汇率", "/exchange"),
            ("🤖 AI助手", "/chat"),
            ("📋 我的", "/my-plans"),
        ]:
            btn = QPushButton(text)
            btn.setStyleSheet(btn_style)
            btn.clicked.connect(lambda checked, p=path: self.navigate(p))
            hbox.addWidget(btn)
        
        hbox.addStretch()
        
        btn = QPushButton("⚙️ 服务器")
        btn.setStyleSheet(btn_style)
        btn.clicked.connect(self.switch_server)
        hbox.addWidget(btn)
        
        vbox.addWidget(toolbar)
        
        # 页面栈
        self.stack = QStackedWidget()
        vbox.addWidget(self.stack)
        
        # 首页
        self.home_page = QWidget()
        self.home_page.setStyleSheet("background: qlineargradient(x1:0,y1:0,x2:1,y2:1,stop:0 #667eea,stop:1 #764ba2);")
        self.stack.addWidget(self.home_page)
        
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
        
        r1 = QHBoxLayout()
        r1.setAlignment(Qt.AlignmentFlag.AlignCenter)
        r1.setSpacing(20)
        r1.addWidget(self.make_btn("✨", "生成行程", "/generate"))
        r1.addWidget(self.make_btn("👥", "攻略社区", "/community"))
        hv.addLayout(r1)
        
        r2 = QHBoxLayout()
        r2.setAlignment(Qt.AlignmentFlag.AlignCenter)
        r2.setSpacing(12)
        for icon, text, path in [("🌤️","天气","/weather"),("💱","汇率","/exchange"),("🤖","AI助手","/chat"),("📋","我的","/my-plans")]:
            r2.addWidget(self.make_small_btn(icon, text, path))
        hv.addLayout(r2)
        
        hv.addStretch()
        
        # WebView
        self.web = QWebEngineView()
        self.custom_page = CustomWebPage(self.web.page().profile(), self.web)
        self.web.setPage(self.custom_page)
        self.stack.addWidget(self.web)
        
        # 设置WebChannel
        channel = QWebChannel(self.web.page())
        channel.registerObject("pyBridge", self.bridge)
        self.web.page().setWebChannel(channel)
        
        # 页面加载完成后注入JS
        self.web.loadFinished.connect(self.inject_js)
        
        self.web.titleChanged.connect(self.on_title)
    
    def inject_js(self, ok):
        if ok:
            # 先注入qwebchannel.js，再注入拦截器
            js = '''
            var script = document.createElement('script');
            script.src = 'qrc:///qtwebchannel/qwebchannel.js';
            script.onload = function() {
                new QWebChannel(qt.webChannelTransport, function(channel) {
                    window.pyBridge = channel.objects.pyBridge;
                });
            };
            document.head.appendChild(script);
            ''' + JS_INTERCEPTOR
            self.web.page().runJavaScript(js)
    
    def make_btn(self, icon, text, path):
        btn = QPushButton()
        btn.setFixedSize(200, 90)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setStyleSheet("QPushButton{background:white;border:none;border-radius:14px;}QPushButton:hover{background:#eee;}")
        inner = QVBoxLayout(btn)
        inner.setSpacing(4)
        l1 = QLabel(icon)
        l1.setStyleSheet("font-size:28px;background:transparent;")
        l1.setAlignment(Qt.AlignmentFlag.AlignCenter)
        inner.addWidget(l1)
        l2 = QLabel(text)
        l2.setStyleSheet("font-size:16px;font-weight:bold;color:#333;background:transparent;")
        l2.setAlignment(Qt.AlignmentFlag.AlignCenter)
        inner.addWidget(l2)
        btn.clicked.connect(lambda: self.navigate(path))
        return btn
    
    def make_small_btn(self, icon, text, path):
        btn = QPushButton(f"{icon} {text}")
        btn.setFixedSize(140, 44)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)
        btn.setStyleSheet("QPushButton{background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);border-radius:8px;color:white;font-size:13px;font-weight:bold;}QPushButton:hover{background:rgba(255,255,255,0.35);}")
        btn.clicked.connect(lambda: self.navigate(path))
        return btn
    
    def show_home(self):
        self.stack.setCurrentWidget(self.home_page)
        self.setWindowTitle("AI旅行规划助手")
    
    def navigate(self, path):
        url = current_server + path
        self.web.setUrl(QUrl(url))
        self.stack.setCurrentWidget(self.web)
    
    def switch_server(self):
        global current_server
        current_server = LOCAL if current_server == SERVER else SERVER
        self.show_home()
    
    def on_title(self, title):
        if self.stack.currentWidget() == self.web and title:
            self.setWindowTitle(f"{title} - AI旅行规划助手")


def main():
    app = QApplication(sys.argv)
    app.setFont(QFont("Noto Sans", 10))
    w = MainWindow()
    w.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
