#!/usr/bin/env python3
"""
测试不同加载方式
"""

import webview

SERVER = "https://wanghaiyan.cn"

# 方法1: HTML中用location.href跳转
def test1():
    html = f'''<html>
    <head>
    <script>
        window.location.href = "{SERVER}";
    </script>
    </head>
    <body><p>跳转中...</p></body>
    </html>'''
    window = webview.create_window("方法1", html=html, width=800, height=600)
    webview.start()

# 方法2: 用meta refresh跳转
def test2():
    html = f'''<html>
    <head>
    <meta http-equiv="refresh" content="0;url={SERVER}">
    </head>
    <body><p>跳转中...</p></body>
    </html>'''
    window = webview.create_window("方法2", html=html, width=800, height=600)
    webview.start()

# 方法3: 用iframe
def test3():
    html = f'''<html>
    <body style="margin:0;padding:0">
        <iframe src="{SERVER}" width="100%" height="100%" frameborder="0" style="position:absolute;top:0;left:0;width:100%;height:100%"></iframe>
    </body>
    </html>'''
    window = webview.create_window("方法3", html=html, width=800, height=600)
    webview.start()

if __name__ == "__main__":
    import sys
    if sys.argv[1:] and sys.argv[1] == "2":
        test2()
    elif sys.argv[1:] and sys.argv[1] == "3":
        test3()
    else:
        test1()
