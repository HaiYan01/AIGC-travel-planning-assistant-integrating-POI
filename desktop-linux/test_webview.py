#!/usr/bin/env python3
"""
测试能否加载远程页面
"""

import webview

# 先测试加载本地HTML
def test_local():
    window = webview.create_window(
        title="测试本地",
        html="<h1>本地HTML加载成功!</h1>",
        width=400,
        height=300
    )
    webview.start()

# 再测试加载远程URL
def test_remote():
    window = webview.create_window(
        title="测试远程",
        url="https://wanghaiyan.cn",
        width=800,
        height=600
    )
    webview.start()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "remote":
        print("测试远程加载...")
        test_remote()
    else:
        print("测试本地加载...")
        test_local()
