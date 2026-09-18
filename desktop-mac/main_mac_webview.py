#!/usr/bin/env python3
"""
AI旅行规划助手 - macOS版
支持外部链接在系统浏览器打开
"""

import webview
import webview.menu as wm
import webbrowser
import threading

SERVER = "https://wanghaiyan.cn"
LOCAL_SERVER = "http://localhost:5174"
current_server = SERVER


def get_home_html():
    return f'''<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff}}
.logo{{font-size:80px;margin-bottom:16px}}
h1{{font-size:36px;margin-bottom:8px}}
.sub{{font-size:16px;opacity:.8;margin-bottom:40px}}
.btns{{display:flex;gap:20px;margin-bottom:24px}}
.btn{{padding:24px 40px;border:none;border-radius:16px;font-size:18px;font-weight:bold;cursor:pointer}}
.btn:hover{{transform:translateY(-4px)}}
.w{{background:#fff;color:#333}}.g{{background:#10b981;color:#fff}}
.sbtns{{display:flex;gap:12px}}
.sb{{padding:14px 20px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);border-radius:10px;color:#fff;font-size:14px;cursor:pointer}}
</style></head>
<body>
<div class="logo">🧭</div>
<h1>AI旅行规划助手</h1>
<p class="sub">让AI为你规划完美旅程</p>
<div class="btns">
<button class="btn w" onclick="pywebview.api.nav('/generate')">✨ 生成行程</button>
<button class="btn g" onclick="pywebview.api.nav('/community')">👥 攻略社区</button>
</div>
<div class="sbtns">
<button class="sb" onclick="pywebview.api.nav('/weather')">🌤️ 天气</button>
<button class="sb" onclick="pywebview.api.nav('/exchange')">💱 汇率</button>
<button class="sb" onclick="pywebview.api.nav('/chat')">🤖 AI助手</button>
<button class="sb" onclick="pywebview.api.nav('/my-plans')">📋 我的</button>
</div>
</body></html>'''


class Api:
    def __init__(self, app):
        self.app = app
    
    def nav(self, path):
        self.app.navigate(path)
    
    def open_external(self, url):
        """在系统浏览器打开链接"""
        webbrowser.open(url)
        return True


class App:
    def __init__(self):
        self.window = None
        self.api = Api(self)
    
    def navigate(self, path):
        if path == "/":
            self.window.load_html(get_home_html())
        else:
            self.window.load_url(current_server + path)
    
    def switch_server(self, server_type):
        global current_server
        current_server = SERVER if server_type == "remote" else LOCAL_SERVER
        self.navigate("/")


def on_url_changed(url):
    """URL变化时的处理"""
    # 如果是外部链接，在系统浏览器打开
    if not any(d in url for d in ["wanghaiyan.cn", "localhost", "about:blank"]):
        if url.startswith("http://") or url.startswith("https://"):
            webbrowser.open(url)
            # 返回首页
            app.navigate("/")
            return False
    return True


def main():
    global app
    app = App()
    
    window = webview.create_window(
        title="AI旅行规划助手",
        html=get_home_html(),
        width=1300,
        height=850,
        min_size=(900, 600),
        js_api=app.api
    )
    
    app.window = window
    
    menu_items = [
        wm.Menu("导航", [
            wm.MenuAction("首页", lambda: app.navigate("/")),
            wm.MenuSeparator(),
            wm.MenuAction("生成行程", lambda: app.navigate("/generate")),
            wm.MenuAction("攻略社区", lambda: app.navigate("/community")),
            wm.MenuAction("天气查询", lambda: app.navigate("/weather")),
            wm.MenuAction("汇率转换", lambda: app.navigate("/exchange")),
            wm.MenuAction("AI助手", lambda: app.navigate("/chat")),
            wm.MenuAction("我的行程", lambda: app.navigate("/my-plans")),
        ]),
        wm.Menu("服务器", [
            wm.MenuAction("远程服务器", lambda: app.switch_server("remote")),
            wm.MenuAction("本地服务器", lambda: app.switch_server("local")),
        ])
    ]
    
    webview.start(menu=menu_items)


if __name__ == "__main__":
    main()
