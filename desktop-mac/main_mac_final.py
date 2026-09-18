#!/usr/bin/env python3
"""
AI旅行规划助手 - macOS版
tkinter界面 + 系统浏览器
"""

import tkinter as tk
import webbrowser

SERVER = "https://wanghaiyan.cn"


def open_url(path):
    webbrowser.open(SERVER + path)


def main():
    win = tk.Tk()
    win.title("AI旅行规划助手")
    win.geometry("500x450")
    win.configure(bg="#667eea")
    win.resizable(False, False)
    
    # 居中
    w, h = 500, 450
    x = (win.winfo_screenwidth() - w) // 2
    y = (win.winfo_screenheight() - h) // 2
    win.geometry(f"{w}x{h}+{x}+{y}")
    
    # Logo
    tk.Label(win, text="🧭", font=("Arial", 64), bg="#667eea").pack(pady=(35, 5))
    
    # 标题
    tk.Label(win, text="AI旅行规划助手", font=("Arial", 28, "bold"),
             bg="#667eea", fg="white").pack()
    
    # 副标题
    tk.Label(win, text="点击按钮在浏览器中打开", font=("Arial", 12),
             bg="#667eea", fg="#c4b5fd").pack(pady=(3, 30))
    
    # 主按钮
    row1 = tk.Frame(win, bg="#667eea")
    row1.pack()
    
    tk.Button(row1, text="✨ 生成行程", font=("Arial", 15, "bold"),
              bg="white", fg="#333", width=14, height=2, relief="flat",
              command=lambda: open_url("/generate")).pack(side="left", padx=10)
    
    tk.Button(row1, text="👥 攻略社区", font=("Arial", 15, "bold"),
              bg="#10b981", fg="white", width=14, height=2, relief="flat",
              command=lambda: open_url("/community")).pack(side="left", padx=10)
    
    # 次按钮
    row2 = tk.Frame(win, bg="#667eea")
    row2.pack(pady=20)
    
    for text, path in [("🌤️ 天气", "/weather"), ("💱 汇率", "/exchange"),
                       ("🤖 AI", "/chat"), ("📋 我的", "/my-plans")]:
        tk.Button(row2, text=text, font=("Arial", 12),
                  bg="#7c3aed", fg="white", width=9, height=2,
                  relief="flat", command=lambda p=path: open_url(p)).pack(side="left", padx=5)
    
    # 底部
    tk.Label(win, text="所有功能与网页版完全同步", font=("Arial", 10),
             bg="#667eea", fg="#a78bfa").pack(side="bottom", pady=15)
    
    win.mainloop()


if __name__ == "__main__":
    main()
