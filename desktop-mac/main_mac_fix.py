#!/usr/bin/env python3
"""
AI旅行规划助手 - macOS版 完整版
带本地首页 + 外部链接浏览器打开
"""

import webview
import webview.menu as wm
import webbrowser

SERVER = "https://wanghaiyan.cn"
LOCAL = "http://localhost:5174"
current_server = SERVER

# 外部链接拦截器
JS_INTERCEPTOR = '''
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
                window.pywebview.api.open_in_browser(target.href);
            }
            return false;
        }
    }, true);
    
    var originalOpen = window.open;
    window.open = function(url, name, features) {
        if (url && !isInternal(url)) {
            if (shouldOpen(url)) {
                window.pywebview.api.open_in_browser(url);
            }
            return null;
        }
        return originalOpen.call(window, url, name, features);
    };
})();
'''


def get_home_html():
    return f'''<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
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


class App:
    def __init__(self):
        self.window = None
        self.api = self.Api(self)
    
    class Api:
        def __init__(self, app):
            self.app = app
        
        def open_in_browser(self, url):
            print(f"Opening: {url}")
            webbrowser.open(url)
            return "ok"
    
    def show_home(self):
        self.window.load_html(get_home_html())
    
    def navigate(self, path):
        url = SERVER if path == "/" else SERVER + path
        self.window.load_url(url)
    
    def switch_server(self, server_type):
        global current_server
        current_server = SERVER if server_type == "remote" else LOCAL
        self.show_home()
    
    def on_loaded(self, *args, **kwargs):
        try:
            self.window.evaluate_js(JS_INTERCEPTOR)
        except Exception as e:
            print(f"JS error: {e}")


def main():
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
    window.events.loaded += app.on_loaded
    
    menu_items = [
        wm.Menu("导航", [
            wm.MenuAction("首页", lambda: app.show_home()),
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
