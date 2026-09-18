"""
AI旅行规划助手 - PyQt原生客户端
液态玻璃风格，完整功能
"""

import sys
import os

# macOS兼容性
os.environ['QT_MAC_WANTS_LAYER'] = '1'

import requests
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                              QHBoxLayout, QStackedWidget, QPushButton, QLabel, 
                              QLineEdit, QTextEdit, QListWidget, QListWidgetItem,
                              QFormLayout, QSpinBox, QComboBox, QScrollArea,
                              QGroupBox, QMessageBox, QInputDialog, QGridLayout,
                              QTabWidget, QFrame, QSizePolicy, QSpacerItem)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QUrl, QTimer
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtGui import QFont, QColor, QPalette, QIcon, QPixmap, QPainter, QLinearGradient


# 服务器地址
API_BASE = "https://wanghaiyan.cn/api"
# 高德地图Key
AMAP_KEY = "API_KEY"


# ==================== 样式 ====================
GLASS_STYLE = """
QWidget {
    background: transparent;
}

QMainWindow {
    background: qlineargradient(x1:0, y1:0, x2:0, y2:1, 
        stop:0 #e8eaf6, stop:0.3 #f3e5f5, stop:0.6 #e8eaf6, stop:1 #fce4ec);
}

QGroupBox {
    background: rgba(255, 255, 255, 150);
    border: 1px solid rgba(255, 255, 255, 200);
    border-radius: 16px;
    margin-top: 10px;
    padding: 15px;
    font-weight: bold;
}

QGroupBox::title {
    subcontrol-origin: margin;
    left: 15px;
    padding: 0 5px;
}

QLineEdit, QTextEdit, QSpinBox, QComboBox {
    background: rgba(255, 255, 255, 180);
    border: 1px solid rgba(0, 0, 0, 30);
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 14px;
}

QLineEdit:focus, QTextEdit:focus, QSpinBox:focus, QComboBox:focus {
    border: 2px solid rgba(99, 102, 241, 150);
}

QPushButton {
    border-radius: 12px;
    padding: 10px 20px;
    font-weight: bold;
}

QListWidget {
    background: transparent;
    border: none;
}

QListWidget::item {
    background: rgba(255, 255, 255, 150);
    border: 1px solid rgba(255, 255, 255, 200);
    border-radius: 12px;
    margin: 5px 0;
    padding: 15px;
}

QListWidget::item:hover {
    background: rgba(255, 255, 255, 200);
}

QListWidget::item:selected {
    background: rgba(99, 102, 241, 50);
    border: 1px solid rgba(99, 102, 241, 100);
}

QScrollArea {
    border: none;
    background: transparent;
}

QScrollBar:vertical {
    background: rgba(0, 0, 0, 20);
    width: 8px;
    border-radius: 4px;
}

QScrollBar::handle:vertical {
    background: rgba(99, 102, 241, 100);
    border-radius: 4px;
    min-height: 30px;
}

QTabWidget::pane {
    border: none;
    background: transparent;
}

QTabBar::tab {
    background: rgba(255, 255, 255, 100);
    border: 1px solid rgba(255, 255, 255, 150);
    border-radius: 8px;
    padding: 8px 16px;
    margin-right: 5px;
}

QTabBar::tab:selected {
    background: rgba(99, 102, 241, 80);
    color: #6366f1;
}
"""

PRIMARY_BTN_STYLE = """
QPushButton {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, 
        stop:0 #6366f1, stop:1 #a855f7);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: bold;
}
QPushButton:hover {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, 
        stop:0 #4f46e5, stop:1 #9333ea);
}
QPushButton:pressed {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, 
        stop:0 #4338ca, stop:1 #7e22ce);
}
QPushButton:disabled {
    background: #a5b4fc;
}
"""

SECONDARY_BTN_STYLE = """
QPushButton {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, 
        stop:0 #10b981, stop:1 #059669);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: bold;
}
QPushButton:hover {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, 
        stop:0 #059669, stop:1 #047857);
}
"""

GHOST_BTN_STYLE = """
QPushButton {
    background: transparent;
    color: #6366f1;
    border: none;
    font-size: 14px;
}
QPushButton:hover {
    color: #4f46e5;
}
"""


# ==================== API客户端 ====================
class ApiClient:
    def __init__(self):
        self.token = None
        self.base_url = API_BASE
    
    def set_token(self, token):
        self.token = token
    
    def get_headers(self):
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers
    
    def get(self, path, params=None):
        resp = requests.get(f"{self.base_url}{path}", headers=self.get_headers(), params=params, timeout=30)
        resp.raise_for_status()
        return resp.json()
    
    def post(self, path, data=None):
        resp = requests.post(f"{self.base_url}{path}", headers=self.get_headers(), json=data, timeout=120)
        resp.raise_for_status()
        return resp.json()


api = ApiClient()


class ApiThread(QThread):
    success = pyqtSignal(object)
    error = pyqtSignal(str)
    
    def __init__(self, func, *args, **kwargs):
        super().__init__()
        self.func = func
        self.args = args
        self.kwargs = kwargs
    
    def run(self):
        try:
            result = self.func(*self.args, **self.kwargs)
            self.success.emit(result)
        except Exception as e:
            self.error.emit(str(e))


# ==================== 通用组件 ====================
class GlassCard(QGroupBox):
    """玻璃卡片"""
    def __init__(self, title=""):
        super().__init__(title)
        self.setStyleSheet("""
            QGroupBox {
                background: rgba(255, 255, 255, 150);
                border: 1px solid rgba(255, 255, 255, 200);
                border-radius: 16px;
                padding: 20px;
            }
        """)


# ==================== 登录页面 ====================
class LoginWidget(QWidget):
    login_success = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self.setup_ui()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setSpacing(25)
        
        # Logo
        logo = QLabel("🧭")
        logo.setStyleSheet("font-size: 80px;")
        logo.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(logo)
        
        # 标题
        title = QLabel("AI旅行规划助手")
        title.setStyleSheet("font-size: 32px; font-weight: bold; color: #6366f1;")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)
        
        subtitle = QLabel("让AI为你规划完美旅程")
        subtitle.setStyleSheet("font-size: 16px; color: #6b7280;")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(subtitle)
        
        layout.addSpacing(20)
        
        # 表单卡片
        card = GlassCard()
        card.setFixedWidth(380)
        card_layout = QVBoxLayout()
        card_layout.setSpacing(15)
        
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("📧 邮箱地址")
        self.email_input.setFixedHeight(45)
        card_layout.addWidget(self.email_input)
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("🔒 密码")
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.password_input.setFixedHeight(45)
        card_layout.addWidget(self.password_input)
        
        # 按钮
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(15)
        
        self.login_btn = QPushButton("登录")
        self.login_btn.setFixedSize(160, 48)
        self.login_btn.setStyleSheet(PRIMARY_BTN_STYLE)
        self.login_btn.clicked.connect(self.login)
        btn_layout.addWidget(self.login_btn)
        
        self.register_btn = QPushButton("注册")
        self.register_btn.setFixedSize(160, 48)
        self.register_btn.setStyleSheet(SECONDARY_BTN_STYLE)
        self.register_btn.clicked.connect(self.register)
        btn_layout.addWidget(self.register_btn)
        
        card_layout.addLayout(btn_layout)
        card.setLayout(card_layout)
        layout.addWidget(card, alignment=Qt.AlignmentFlag.AlignCenter)
        
        layout.addStretch()
        self.setLayout(layout)
    
    def login(self):
        email = self.email_input.text()
        password = self.password_input.text()
        
        if not email or not password:
            QMessageBox.warning(self, "提示", "请输入邮箱和密码")
            return
        
        self.login_btn.setEnabled(False)
        
        def do_login():
            result = api.post("/auth/login", {"email": email, "password": password})
            api.set_token(result["token"])
            return result
        
        self.thread = ApiThread(do_login)
        self.thread.success.connect(lambda r: self.on_success())
        self.thread.error.connect(self.on_error)
        self.thread.start()
    
    def register(self):
        email = self.email_input.text()
        password = self.password_input.text()
        
        if not email or not password:
            QMessageBox.warning(self, "提示", "请输入邮箱和密码")
            return
        
        username, ok = QInputDialog.getText(self, "注册", "请输入用户名:")
        if not ok or not username:
            return
        
        self.register_btn.setEnabled(False)
        
        def do_register():
            result = api.post("/auth/register", {"username": username, "email": email, "password": password})
            api.set_token(result["token"])
            return result
        
        self.thread = ApiThread(do_register)
        self.thread.success.connect(lambda r: self.on_success())
        self.thread.error.connect(self.on_error)
        self.thread.start()
    
    def on_success(self):
        self.login_btn.setEnabled(True)
        self.register_btn.setEnabled(True)
        self.login_success.emit()
    
    def on_error(self, error):
        self.login_btn.setEnabled(True)
        self.register_btn.setEnabled(True)
        QMessageBox.warning(self, "错误", f"操作失败: {error}")


# ==================== 首页 ====================
class HomeWidget(QWidget):
    generate_clicked = pyqtSignal()
    community_clicked = pyqtSignal()
    weather_clicked = pyqtSignal()
    exchange_clicked = pyqtSignal()
    chat_clicked = pyqtSignal()
    my_clicked = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self.setup_ui()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setSpacing(30)
        layout.setContentsMargins(50, 40, 50, 40)
        
        # Hero
        hero_layout = QVBoxLayout()
        hero_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        logo = QLabel("🧭")
        logo.setStyleSheet("font-size: 72px;")
        logo.setAlignment(Qt.AlignmentFlag.AlignCenter)
        hero_layout.addWidget(logo)
        
        title = QLabel("AI旅行规划助手")
        title.setStyleSheet("font-size: 36px; font-weight: bold; background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #6366f1, stop:0.5 #8b5cf6, stop:1 #a855f7); -webkit-background-clip: text; color: #6366f1;")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        hero_layout.addWidget(title)
        
        desc = QLabel("让AI为你规划完美旅程")
        desc.setStyleSheet("font-size: 16px; color: #6b7280;")
        desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
        hero_layout.addWidget(desc)
        
        layout.addLayout(hero_layout)
        
        # 主要功能
        main_btn_layout = QHBoxLayout()
        main_btn_layout.setSpacing(20)
        
        gen_btn = self.create_main_btn("✨", "生成行程", "AI智能规划", PRIMARY_BTN_STYLE)
        gen_btn.clicked.connect(self.generate_clicked.emit)
        main_btn_layout.addWidget(gen_btn)
        
        com_btn = self.create_main_btn("👥", "攻略社区", "发现精彩", SECONDARY_BTN_STYLE)
        com_btn.clicked.connect(self.community_clicked.emit)
        main_btn_layout.addWidget(com_btn)
        
        layout.addLayout(main_btn_layout)
        
        # 次要功能
        sec_btn_layout = QHBoxLayout()
        sec_btn_layout.setSpacing(15)
        
        weather_btn = self.create_sec_btn("🌤️", "天气查询")
        weather_btn.clicked.connect(self.weather_clicked.emit)
        sec_btn_layout.addWidget(weather_btn)
        
        exchange_btn = self.create_sec_btn("💱", "汇率转换")
        exchange_btn.clicked.connect(self.exchange_clicked.emit)
        sec_btn_layout.addWidget(exchange_btn)
        
        chat_btn = self.create_sec_btn("🤖", "AI助手")
        chat_btn.clicked.connect(self.chat_clicked.emit)
        sec_btn_layout.addWidget(chat_btn)
        
        my_btn = self.create_sec_btn("👤", "我的")
        my_btn.clicked.connect(self.my_clicked.emit)
        sec_btn_layout.addWidget(my_btn)
        
        layout.addLayout(sec_btn_layout)
        
        layout.addStretch()
        self.setLayout(layout)
    
    def create_main_btn(self, icon, title, desc, style):
        btn = QPushButton(f"{icon}\n{title}\n{desc}")
        btn.setFixedHeight(100)
        btn.setStyleSheet(style)
        return btn
    
    def create_sec_btn(self, icon, title):
        btn = QPushButton(f"{icon}\n{title}")
        btn.setFixedHeight(80)
        btn.setStyleSheet("""
            QPushButton {
                background: rgba(255, 255, 255, 150);
                border: 1px solid rgba(255, 255, 255, 200);
                border-radius: 12px;
                font-size: 14px;
                color: #374151;
            }
            QPushButton:hover {
                background: rgba(255, 255, 255, 200);
            }
        """)
        return btn


# ==================== 生成行程 ====================
class GenerateWidget(QWidget):
    plan_generated = pyqtSignal(int)
    back_clicked = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self.setup_ui()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setSpacing(20)
        layout.setContentsMargins(40, 20, 40, 20)
        
        # 头部
        header = QHBoxLayout()
        back_btn = QPushButton("← 返回")
        back_btn.setStyleSheet(GHOST_BTN_STYLE)
        back_btn.clicked.connect(self.back_clicked.emit)
        header.addWidget(back_btn)
        header.addStretch()
        layout.addLayout(header)
        
        # 标题
        title = QLabel("🧭 AI行程规划")
        title.setStyleSheet("font-size: 28px; font-weight: bold; color: #1a1a2e;")
        layout.addWidget(title)
        
        desc = QLabel("告诉我们你的旅行需求，AI将为你生成专属行程方案")
        desc.setStyleSheet("font-size: 14px; color: #6b7280;")
        layout.addWidget(desc)
        
        # 表单
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        
        form_widget = QWidget()
        form_layout = QVBoxLayout()
        
        card = GlassCard()
        card_layout = QFormLayout()
        card_layout.setSpacing(20)
        
        self.destination_input = QLineEdit()
        self.destination_input.setPlaceholderText("例如：杭州、成都、北京...")
        self.destination_input.setFixedHeight(45)
        card_layout.addRow("📍 目的地", self.destination_input)
        
        self.days_spin = QSpinBox()
        self.days_spin.setRange(1, 30)
        self.days_spin.setValue(3)
        self.days_spin.setFixedHeight(45)
        card_layout.addRow("📅 旅行天数", self.days_spin)
        
        self.budget_spin = QSpinBox()
        self.budget_spin.setRange(100, 100000)
        self.budget_spin.setValue(2000)
        self.budget_spin.setFixedHeight(45)
        card_layout.addRow("💰 预算 (元)", self.budget_spin)
        
        self.pref_combo = QComboBox()
        self.pref_combo.addItems(["美食探店", "历史文化", "自然风光", "购物娱乐", "网红打卡", "亲子游", "休闲度假", "户外探险"])
        self.pref_combo.setFixedHeight(45)
        card_layout.addRow("❤️ 旅行偏好", self.pref_combo)
        
        self.requirements_input = QTextEdit()
        self.requirements_input.setPlaceholderText("例如：我想去西湖看日落，想吃正宗的龙井虾仁...")
        self.requirements_input.setMaximumHeight(100)
        card_layout.addRow("📝 其他要求", self.requirements_input)
        
        card.setLayout(card_layout)
        form_layout.addWidget(card)
        
        # 生成按钮
        self.generate_btn = QPushButton("✨ 生成行程方案")
        self.generate_btn.setFixedHeight(55)
        self.generate_btn.setStyleSheet(PRIMARY_BTN_STYLE)
        self.generate_btn.clicked.connect(self.generate_plan)
        form_layout.addWidget(self.generate_btn)
        
        form_widget.setLayout(form_layout)
        scroll.setWidget(form_widget)
        layout.addWidget(scroll)
        
        self.setLayout(layout)
    
    def generate_plan(self):
        destination = self.destination_input.text()
        if not destination:
            QMessageBox.warning(self, "提示", "请输入目的地")
            return
        
        self.generate_btn.setEnabled(False)
        self.generate_btn.setText("⏳ AI正在生成中...")
        
        data = {
            "destination": destination,
            "days": self.days_spin.value(),
            "budget": self.budget_spin.value(),
            "preferences": [self.pref_combo.currentText()],
            "requirements": self.requirements_input.toPlainText()
        }
        
        def do_generate():
            return api.post("/plans/generate", data)
        
        self.thread = ApiThread(do_generate)
        self.thread.success.connect(self.on_generated)
        self.thread.error.connect(self.on_error)
        self.thread.start()
    
    def on_generated(self, result):
        self.generate_btn.setEnabled(True)
        self.generate_btn.setText("✨ 生成行程方案")
        self.plan_generated.emit(result["planId"])
    
    def on_error(self, error):
        self.generate_btn.setEnabled(True)
        self.generate_btn.setText("✨ 生成行程方案")
        QMessageBox.warning(self, "错误", f"生成失败: {error}")


# ==================== 行程详情（含地图）====================
class PlanDetailWidget(QWidget):
    back_clicked = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self.plan = None
        self.setup_ui()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 15, 20, 15)
        
        # 头部
        header = QHBoxLayout()
        back_btn = QPushButton("← 返回")
        back_btn.setStyleSheet(GHOST_BTN_STYLE)
        back_btn.clicked.connect(self.back_clicked.emit)
        header.addWidget(back_btn)
        header.addStretch()
        layout.addLayout(header)
        
        # 内容区
        self.tab_widget = QTabWidget()
        
        # 行程标签
        self.plan_tab = QWidget()
        self.plan_layout = QVBoxLayout()
        self.plan_tab.setLayout(self.plan_layout)
        self.tab_widget.addTab(self.plan_tab, "📋 行程详情")
        
        # 地图标签
        self.map_view = QWebEngineView()
        self.tab_widget.addTab(self.map_view, "🗺️ 地图")
        
        layout.addWidget(self.tab_widget)
        self.setLayout(layout)
    
    def load_plan(self, plan_id):
        def do_load():
            return api.get(f"/plans/{plan_id}")
        
        self.thread = ApiThread(do_load)
        self.thread.success.connect(self.show_plan)
        self.thread.error.connect(lambda e: QMessageBox.warning(self, "错误", f"加载失败: {e}"))
        self.thread.start()
    
    def show_plan(self, plan):
        self.plan = plan
        
        # 清空行程布局
        while self.plan_layout.count():
            item = self.plan_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        
        # 标题卡片
        header_card = GlassCard()
        header_layout = QVBoxLayout()
        
        title = QLabel(f"📍 {plan['title']}")
        title.setStyleSheet("font-size: 24px; font-weight: bold; color: #1a1a2e;")
        header_layout.addWidget(title)
        
        info = QLabel(f"{plan['destination']}  •  {plan['days']}天  •  预算 ¥{plan['budget']}")
        info.setStyleSheet("font-size: 14px; color: #6b7280;")
        header_layout.addWidget(info)
        
        # 偏好标签
        if plan.get("preferences"):
            tags_layout = QHBoxLayout()
            for pref in plan["preferences"]:
                tag = QLabel(pref)
                tag.setStyleSheet("background: rgba(99, 102, 241, 100); color: #6366f1; padding: 4px 12px; border-radius: 8px; font-size: 12px;")
                tags_layout.addWidget(tag)
            tags_layout.addStretch()
            header_layout.addLayout(tags_layout)
        
        # 操作按钮
        btn_layout = QHBoxLayout()
        
        like_btn = QPushButton(f"❤️ 点赞 {plan.get('likeCount', 0)}")
        like_btn.setStyleSheet("""
            QPushButton {
                background: rgba(239, 68, 68, 80);
                color: #ef4444;
                border: none;
                border-radius: 8px;
                padding: 8px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background: rgba(239, 68, 68, 120);
            }
        """)
        like_btn.clicked.connect(lambda: self.like_plan(plan['id']))
        btn_layout.addWidget(like_btn)
        
        copy_btn = QPushButton("📋 复制行程")
        copy_btn.setStyleSheet("""
            QPushButton {
                background: rgba(99, 102, 241, 80);
                color: #6366f1;
                border: none;
                border-radius: 8px;
                padding: 8px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background: rgba(99, 102, 241, 120);
            }
        """)
        copy_btn.clicked.connect(lambda: self.copy_plan(plan['id']))
        btn_layout.addWidget(copy_btn)
        
        btn_layout.addStretch()
        header_layout.addLayout(btn_layout)
        
        header_card.setLayout(header_layout)
        self.plan_layout.addWidget(header_card)
        
        # 每日行程
        itinerary = plan.get("itinerary", {})
        
        # 摘要信息
        if itinerary.get("summary"):
            summary_card = GlassCard("行程概要")
            summary_layout = QVBoxLayout()
            summary_label = QLabel(itinerary["summary"])
            summary_label.setWordWrap(True)
            summary_label.setStyleSheet("color: #6b7280; font-size: 14px;")
            summary_layout.addWidget(summary_label)
            summary_card.setLayout(summary_layout)
            self.plan_layout.addWidget(summary_card)
        
        for day in itinerary.get("days", []):
            day_title = f"第{day['day']}天 - {day.get('theme', '')}"
            if day.get('dailyBudget'):
                day_title += f" (预估 ¥{day['dailyBudget']})"
            day_card = GlassCard(day_title)
            day_layout = QVBoxLayout()
            
            for act in day.get("activities", []):
                act_widget = QWidget()
                act_layout = QVBoxLayout()
                act_layout.setContentsMargins(10, 10, 10, 10)
                
                # 时间、类型和花费
                type_time_layout = QHBoxLayout()
                type_time = QLabel(f"[{act.get('type', '活动')}] {act.get('time', '')}")
                type_time.setStyleSheet("color: #6366f1; font-weight: bold; font-size: 12px;")
                type_time_layout.addWidget(type_time)
                type_time_layout.addStretch()
                if act.get('cost'):
                    cost_label = QLabel(f"¥{act['cost']}")
                    cost_label.setStyleSheet("color: #10b981; font-weight: bold; font-size: 12px;")
                    type_time_layout.addWidget(cost_label)
                act_layout.addLayout(type_time_layout)
                
                # 名称
                name = QLabel(act.get("name", ""))
                name.setStyleSheet("font-size: 16px; font-weight: bold; color: #1a1a2e;")
                act_layout.addWidget(name)
                
                # 描述
                if act.get("description"):
                    desc = QLabel(act["description"])
                    desc.setWordWrap(True)
                    desc.setStyleSheet("color: #6b7280; font-size: 13px;")
                    act_layout.addWidget(desc)
                
                # 地址
                if act.get("address"):
                    addr = QLabel(f"📍 {act['address']}")
                    addr.setWordWrap(True)
                    addr.setStyleSheet("color: #9ca3af; font-size: 11px;")
                    act_layout.addWidget(addr)
                
                # 小贴士
                if act.get("tips"):
                    tips = QLabel(f"💡 {act['tips']}")
                    tips.setWordWrap(True)
                    tips.setStyleSheet("color: #f59e0b; font-size: 12px;")
                    act_layout.addWidget(tips)
                
                act_widget.setLayout(act_layout)
                act_widget.setStyleSheet("background: rgba(255, 255, 255, 100); border-radius: 8px; margin: 3px 0;")
                day_layout.addWidget(act_widget)
            
            # 美食推荐
            if day.get("meals"):
                meals_widget = QWidget()
                meals_widget.setStyleSheet("background: rgba(255, 255, 255, 100); border-radius: 8px; margin: 3px 0; padding: 10px;")
                meals_layout = QHBoxLayout()
                
                meal_names = {'breakfast': '早餐', 'lunch': '午餐', 'dinner': '晚餐'}
                for meal_key, meal_label in meal_names.items():
                    meal_data = day["meals"].get(meal_key, {})
                    if meal_data.get("name"):
                        meal_widget = QWidget()
                        meal_layout = QVBoxLayout()
                        meal_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
                        
                        label = QLabel(meal_label)
                        label.setStyleSheet("color: #6b7280; font-size: 11px;")
                        label.setAlignment(Qt.AlignmentFlag.AlignCenter)
                        meal_layout.addWidget(label)
                        
                        name_label = QLabel(meal_data["name"])
                        name_label.setStyleSheet("font-weight: bold; color: #1a1a2e; font-size: 13px;")
                        name_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
                        name_label.setWordWrap(True)
                        meal_layout.addWidget(name_label)
                        
                        if meal_data.get("recommendation"):
                            rec_label = QLabel(meal_data["recommendation"])
                            rec_label.setStyleSheet("color: #6b7280; font-size: 11px;")
                            rec_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
                            rec_label.setWordWrap(True)
                            meal_layout.addWidget(rec_label)
                        
                        meal_widget.setLayout(meal_layout)
                        meals_layout.addWidget(meal_widget)
                
                meals_widget.setLayout(meals_layout)
                
                # 美食推荐标题
                meals_title = QLabel("🍽️ 美食推荐")
                meals_title.setStyleSheet("color: #6366f1; font-weight: bold; font-size: 12px; margin-top: 10px;")
                day_layout.addWidget(meals_title)
                day_layout.addWidget(meals_widget)
            
            day_card.setLayout(day_layout)
            self.plan_layout.addWidget(day_card)
        
        # 旅行小贴士
        if itinerary.get("tips"):
            tips_card = GlassCard("旅行小贴士")
            tips_layout = QVBoxLayout()
            for tip in itinerary["tips"]:
                tip_label = QLabel(f"• {tip}")
                tip_label.setWordWrap(True)
                tip_label.setStyleSheet("color: #6b7280; font-size: 13px; margin: 4px 0;")
                tips_layout.addWidget(tip_label)
            tips_card.setLayout(tips_layout)
            self.plan_layout.addWidget(tips_card)
        
        # 实用信息
        info_card = GlassCard("实用信息")
        info_layout = QVBoxLayout()
        
        if itinerary.get("weatherAdvice"):
            weather_info = QLabel(f"🌤️ 天气穿衣：{itinerary['weatherAdvice']}")
            weather_info.setWordWrap(True)
            weather_info.setStyleSheet("color: #6b7280; font-size: 13px; margin: 4px 0;")
            info_layout.addWidget(weather_info)
        
        if itinerary.get("transportAdvice"):
            transport_info = QLabel(f"🚗 交通建议：{itinerary['transportAdvice']}")
            transport_info.setWordWrap(True)
            transport_info.setStyleSheet("color: #6b7280; font-size: 13px; margin: 4px 0;")
            info_layout.addWidget(transport_info)
        
        if itinerary.get("totalBudget"):
            budget_info = QLabel(f"💰 预估总花费：{itinerary['totalBudget']}")
            budget_info.setWordWrap(True)
            budget_info.setStyleSheet("color: #6b7280; font-size: 13px; margin: 4px 0;")
            info_layout.addWidget(budget_info)
        
        info_card.setLayout(info_layout)
        self.plan_layout.addWidget(info_card)
        
        self.plan_layout.addStretch()
        
        # 加载地图
        self.load_map(itinerary)
    
    def like_plan(self, plan_id):
        """点赞行程"""
        def do_like():
            return api.post(f"/community/plans/{plan_id}/like")
        
        self.like_thread = ApiThread(do_like)
        self.like_thread.success.connect(lambda: QMessageBox.information(self, "成功", "点赞成功"))
        self.like_thread.error.connect(lambda e: QMessageBox.warning(self, "错误", str(e)))
        self.like_thread.start()
    
    def copy_plan(self, plan_id):
        """复制行程"""
        def do_copy():
            return api.post(f"/community/plans/{plan_id}/copy")
        
        self.copy_thread = ApiThread(do_copy)
        self.copy_thread.success.connect(lambda r: QMessageBox.information(self, "成功", "复制成功，可在我的行程中查看"))
        self.copy_thread.error.connect(lambda e: QMessageBox.warning(self, "错误", str(e)))
        self.copy_thread.start()
    
    def load_map(self, itinerary):
        """加载高德地图"""
        days = itinerary.get("days", [])
        if not days:
            self.map_view.setHtml('<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#6b7280;">暂无地图数据</div>')
            return
        
        # 收集所有坐标点
        markers = []
        for day in days:
            for act in day.get("activities", []):
                lng = act.get("longitude")
                lat = act.get("latitude")
                if lng and lat:
                    try:
                        markers.append({
                            "name": act.get("name", ""),
                            "lng": float(lng),
                            "lat": float(lat)
                        })
                    except (ValueError, TypeError):
                        continue
        
        if not markers:
            self.map_view.setHtml('<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#6b7280;">暂无有效坐标数据</div>')
            return
        
        # 生成HTML
        markers_js = ""
        center_lng = markers[0]["lng"]
        center_lat = markers[0]["lat"]
        
        for i, m in enumerate(markers):
            markers_js += f"""
            new AMap.Marker({{
                position: [{m['lng']}, {m['lat']}],
                label: {{
                    content: '<div style="background:#6366f1;color:white;padding:4px 10px;border-radius:10px;font-size:12px;white-space:nowrap;">{i+1}. {m['name']}</div>',
                    offset: new AMap.Pixel(-30, -40)
                }},
                map: map
            }});
            """
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
            <style>
                html, body, #container {{ width: 100%; height: 100%; margin: 0; padding: 0; }}
            </style>
        </head>
        <body>
            <div id="container"></div>
            <script type="text/javascript">
                window._AMapSecurityConfig = {{
                    securityJsCode: '',
                }}
            </script>
            <script src="https://webapi.amap.com/maps?v=2.0&key={AMAP_KEY}&plugin=AMap.Driving,AMap.Walking"></script>
            <script type="text/javascript">
                var map = new AMap.Map('container', {{
                    zoom: 12,
                    center: [{center_lng}, {center_lat}],
                    viewMode: '2D'
                }});
                
                var markers = [];
                {markers_js}
                
                if ({len(markers)} > 1) {{
                    setTimeout(function() {{
                        map.setFitView(markers, false, [80, 80, 80, 80]);
                    }}, 500);
                }}
            </script>
        </body>
        </html>
        """
        
        self.map_view.setHtml(html)


# ==================== 社区 ====================
class CommunityWidget(QWidget):
    plan_clicked = pyqtSignal(int)
    back_clicked = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self.setup_ui()
        self.load_plans()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 20, 30, 20)
        
        # 头部
        header = QHBoxLayout()
        back_btn = QPushButton("← 返回")
        back_btn.setStyleSheet(GHOST_BTN_STYLE)
        back_btn.clicked.connect(self.back_clicked.emit)
        header.addWidget(back_btn)
        header.addStretch()
        layout.addLayout(header)
        
        # 标题
        title = QLabel("👥 攻略社区")
        title.setStyleSheet("font-size: 28px; font-weight: bold; color: #1a1a2e;")
        layout.addWidget(title)
        
        desc = QLabel("发现更多精彩旅行方案")
        desc.setStyleSheet("font-size: 14px; color: #6b7280;")
        layout.addWidget(desc)
        
        # 搜索和排序
        filter_layout = QHBoxLayout()
        
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("🔍 搜索目的地...")
        self.search_input.setFixedHeight(40)
        self.search_input.returnPressed.connect(self.load_plans)
        filter_layout.addWidget(self.search_input)
        
        self.sort_combo = QComboBox()
        self.sort_combo.addItems(["最新发布", "最多浏览", "最多点赞"])
        self.sort_combo.setFixedHeight(40)
        self.sort_combo.currentIndexChanged.connect(self.load_plans)
        filter_layout.addWidget(self.sort_combo)
        
        layout.addLayout(filter_layout)
        
        # 行程列表
        self.plan_list = QListWidget()
        self.plan_list.itemClicked.connect(self.on_plan_clicked)
        self.plan_list.setStyleSheet("""
            QListWidget {
                background: transparent;
                border: none;
            }
            QListWidget::item {
                background: rgba(255, 255, 255, 150);
                border: 1px solid rgba(255, 255, 255, 200);
                border-radius: 12px;
                margin: 8px 0;
                padding: 5px;
            }
            QListWidget::item:hover {
                background: rgba(255, 255, 255, 200);
            }
            QListWidget::item:selected {
                background: rgba(99, 102, 241, 50);
                border: 1px solid rgba(99, 102, 241, 100);
            }
        """)
        layout.addWidget(self.plan_list)
        
        self.setLayout(layout)
    
    def load_plans(self):
        sort_map = {0: "newest", 1: "popular", 2: "mostLiked"}
        sort = sort_map.get(self.sort_combo.currentIndex(), "newest")
        destination = self.search_input.text().strip()
        
        params = {"limit": 20, "sort": sort}
        if destination:
            params["destination"] = destination
        
        def do_load():
            return api.get("/community/plans", params)
        
        self.thread = ApiThread(do_load)
        self.thread.success.connect(self.show_plans)
        self.thread.start()
    
    def show_plans(self, result):
        self.plan_list.clear()
        for plan in result.get("data", []):
            item = QListWidgetItem()
            item.setData(Qt.ItemDataRole.UserRole, plan["id"])
            
            # 创建自定义widget
            widget = QWidget()
            layout = QVBoxLayout()
            layout.setContentsMargins(10, 10, 10, 10)
            
            # 标题
            title = QLabel(plan["title"])
            title.setStyleSheet("font-size: 16px; font-weight: bold; color: #1a1a2e;")
            layout.addWidget(title)
            
            # 信息行
            info_layout = QHBoxLayout()
            
            # 用户信息
            if plan.get("user"):
                user_label = QLabel(f"👤 {plan['user'].get('nickname') or plan['user'].get('username', '匿名')}")
                user_label.setStyleSheet("color: #6b7280; font-size: 12px;")
                info_layout.addWidget(user_label)
            
            info_layout.addWidget(QLabel(f"📍 {plan['destination']}"))
            info_layout.addWidget(QLabel(f"📅 {plan['days']}天"))
            info_layout.addStretch()
            layout.addLayout(info_layout)
            
            # 统计信息
            stats_layout = QHBoxLayout()
            
            view_label = QLabel(f"👁 {plan.get('viewCount', 0)}")
            view_label.setStyleSheet("color: #6b7280; font-size: 12px;")
            stats_layout.addWidget(view_label)
            
            like_count = plan.get('_count', {}).get('likes', 0) if isinstance(plan.get('_count'), dict) else plan.get('likeCount', 0)
            like_label = QLabel(f"❤️ {like_count}")
            like_label.setStyleSheet("color: #ef4444; font-size: 12px;")
            stats_layout.addWidget(like_label)
            
            comment_count = plan.get('_count', {}).get('comments', 0) if isinstance(plan.get('_count'), dict) else plan.get('commentCount', 0)
            comment_label = QLabel(f"💬 {comment_count}")
            comment_label.setStyleSheet("color: #6366f1; font-size: 12px;")
            stats_layout.addWidget(comment_label)
            
            # 创建时间
            if plan.get("createdAt"):
                try:
                    from datetime import datetime
                    create_time = datetime.fromisoformat(plan["createdAt"].replace('Z', '+00:00'))
                    time_label = QLabel(create_time.strftime("%m-%d"))
                    time_label.setStyleSheet("color: #9ca3af; font-size: 11px;")
                    stats_layout.addWidget(time_label)
                except:
                    pass
            
            stats_layout.addStretch()
            layout.addLayout(stats_layout)
            
            # 偏好标签
            if plan.get("preferences"):
                tags_layout = QHBoxLayout()
                for pref in plan["preferences"][:3]:
                    tag = QLabel(pref)
                    tag.setStyleSheet("background: rgba(99, 102, 241, 80); color: #6366f1; padding: 2px 8px; border-radius: 6px; font-size: 11px;")
                    tags_layout.addWidget(tag)
                tags_layout.addStretch()
                layout.addLayout(tags_layout)
            
            widget.setLayout(layout)
            
            item.setSizeHint(widget.sizeHint())
            self.plan_list.addItem(item)
            self.plan_list.setItemWidget(item, widget)
    
    def on_plan_clicked(self, item):
        plan_id = item.data(Qt.ItemDataRole.UserRole)
        self.plan_clicked.emit(plan_id)


# ==================== 天气 ====================
# 天气图标映射
WEATHER_ICONS = {
    '晴': '☀️', '多云': '⛅', '阴': '☁️', '雨': '🌧️', '小雨': '🌦️',
    '中雨': '🌧️', '大雨': '⛈️', '雷阵雨': '⛈️', '雪': '❄️', '小雪': '🌨️',
    '雾': '🌫️', '霾': '😷'
}

def get_weather_icon(weather_text):
    for key, icon in WEATHER_ICONS.items():
        if weather_text and key in weather_text:
            return icon
    return '🌤️'


class WeatherWidget(QWidget):
    back_clicked = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self.setup_ui()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 20, 30, 20)
        
        # 头部
        header = QHBoxLayout()
        back_btn = QPushButton("← 返回")
        back_btn.setStyleSheet(GHOST_BTN_STYLE)
        back_btn.clicked.connect(self.back_clicked.emit)
        header.addWidget(back_btn)
        header.addStretch()
        layout.addLayout(header)
        
        title = QLabel("🌤️ 天气查询")
        title.setStyleSheet("font-size: 28px; font-weight: bold;")
        layout.addWidget(title)
        
        # 搜索
        search_layout = QHBoxLayout()
        self.city_input = QLineEdit()
        self.city_input.setPlaceholderText("输入城市名，如：杭州")
        self.city_input.setFixedHeight(45)
        search_layout.addWidget(self.city_input)
        
        search_btn = QPushButton("查询")
        search_btn.setFixedSize(100, 45)
        search_btn.setStyleSheet(PRIMARY_BTN_STYLE)
        search_btn.clicked.connect(self.search_weather)
        search_layout.addWidget(search_btn)
        
        layout.addLayout(search_layout)
        
        # 滚动区域
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")
        
        self.scroll_widget = QWidget()
        self.result_layout = QVBoxLayout()
        self.result_layout.setSpacing(15)
        self.scroll_widget.setLayout(self.result_layout)
        scroll.setWidget(self.scroll_widget)
        
        layout.addWidget(scroll)
        self.setLayout(layout)
    
    def search_weather(self):
        city = self.city_input.text()
        if not city:
            return
        
        def do_search():
            return api.get(f"/weather/{city}")
        
        self.thread = ApiThread(do_search)
        self.thread.success.connect(self.show_weather)
        self.thread.error.connect(lambda e: QMessageBox.warning(self, "错误", str(e)))
        self.thread.start()
    
    def show_weather(self, weather):
        # 清空
        while self.result_layout.count():
            item = self.result_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        
        realtime = weather.get("realtime", {})
        forecast = weather.get("forecast", [])
        
        # 实时天气卡片
        realtime_card = GlassCard()
        realtime_layout = QHBoxLayout()
        
        # 左侧：城市和温度
        left_layout = QVBoxLayout()
        left_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        city_label = QLabel(weather.get("city", ""))
        city_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #1a1a2e;")
        city_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        left_layout.addWidget(city_label)
        
        weather_text = realtime.get('weather', '--')
        icon_label = QLabel(get_weather_icon(weather_text))
        icon_label.setStyleSheet("font-size: 64px;")
        icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        left_layout.addWidget(icon_label)
        
        temp_label = QLabel(f"{realtime.get('temperature', '--')}°C")
        temp_label.setStyleSheet("font-size: 48px; font-weight: bold; color: #6366f1;")
        temp_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        left_layout.addWidget(temp_label)
        
        weather_label = QLabel(weather_text)
        weather_label.setStyleSheet("font-size: 18px; color: #6b7280;")
        weather_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        left_layout.addWidget(weather_label)
        
        realtime_layout.addLayout(left_layout)
        
        # 右侧：详细信息
        right_layout = QVBoxLayout()
        right_layout.setSpacing(12)
        
        # 风向
        wind_dir_widget = QWidget()
        wind_dir_widget.setStyleSheet("background: rgba(255, 255, 255, 100); border-radius: 8px; padding: 8px;")
        wind_dir_layout = QHBoxLayout()
        wind_dir_label = QLabel("风向")
        wind_dir_label.setStyleSheet("color: #6b7280;")
        wind_dir_value = QLabel(realtime.get('winddirection', '--'))
        wind_dir_value.setStyleSheet("font-weight: bold; color: #1a1a2e;")
        wind_dir_layout.addWidget(wind_dir_label)
        wind_dir_layout.addStretch()
        wind_dir_layout.addWidget(wind_dir_value)
        wind_dir_widget.setLayout(wind_dir_layout)
        right_layout.addWidget(wind_dir_widget)
        
        # 风力
        wind_power_widget = QWidget()
        wind_power_widget.setStyleSheet("background: rgba(255, 255, 255, 100); border-radius: 8px; padding: 8px;")
        wind_power_layout = QHBoxLayout()
        wind_power_label = QLabel("风力")
        wind_power_label.setStyleSheet("color: #6b7280;")
        wind_power_value = QLabel(f"{realtime.get('windpower', '--')}级")
        wind_power_value.setStyleSheet("font-weight: bold; color: #1a1a2e;")
        wind_power_layout.addWidget(wind_power_label)
        wind_power_layout.addStretch()
        wind_power_layout.addWidget(wind_power_value)
        wind_power_widget.setLayout(wind_power_layout)
        right_layout.addWidget(wind_power_widget)
        
        # 湿度
        humidity_widget = QWidget()
        humidity_widget.setStyleSheet("background: rgba(255, 255, 255, 100); border-radius: 8px; padding: 8px;")
        humidity_layout = QHBoxLayout()
        humidity_label = QLabel("湿度")
        humidity_label.setStyleSheet("color: #6b7280;")
        humidity_value = QLabel(f"{realtime.get('humidity', '--')}%")
        humidity_value.setStyleSheet("font-weight: bold; color: #1a1a2e;")
        humidity_layout.addWidget(humidity_label)
        humidity_layout.addStretch()
        humidity_layout.addWidget(humidity_value)
        humidity_widget.setLayout(humidity_layout)
        right_layout.addWidget(humidity_widget)
        
        # 穿衣建议
        if weather.get("advice"):
            advice_widget = QWidget()
            advice_widget.setStyleSheet("background: rgba(99, 102, 241, 50); border-radius: 8px; padding: 10px; border: 1px solid rgba(99, 102, 241, 100);")
            advice_layout = QVBoxLayout()
            advice_label = QLabel(f"👕 {weather['advice']}")
            advice_label.setStyleSheet("color: #6366f1; font-size: 13px;")
            advice_label.setWordWrap(True)
            advice_layout.addWidget(advice_label)
            advice_widget.setLayout(advice_layout)
            right_layout.addWidget(advice_widget)
        
        realtime_layout.addLayout(right_layout)
        realtime_card.setLayout(realtime_layout)
        self.result_layout.addWidget(realtime_card)
        
        # 天气预报卡片
        if forecast:
            forecast_card = GlassCard("未来天气预报")
            forecast_layout = QGridLayout()
            forecast_layout.setSpacing(10)
            
            for i, day in enumerate(forecast):
                day_widget = QWidget()
                day_widget.setStyleSheet("background: rgba(255, 255, 255, 100); border-radius: 12px; padding: 12px;")
                day_layout = QVBoxLayout()
                day_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
                
                # 日期
                date_str = day.get('date', '')
                try:
                    from datetime import datetime
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    weekday = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][date_obj.weekday()]
                    date_display = f"{date_obj.month}/{date_obj.day} {weekday}"
                except:
                    date_display = date_str
                
                date_label = QLabel(date_display)
                date_label.setStyleSheet("color: #6b7280; font-size: 12px;")
                date_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
                day_layout.addWidget(date_label)
                
                # 天气图标
                icon_label = QLabel(get_weather_icon(day.get('dayweather', '')))
                icon_label.setStyleSheet("font-size: 32px;")
                icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
                day_layout.addWidget(icon_label)
                
                # 温度
                temp_label = QLabel(f"{day.get('daytemp', '--')}° / {day.get('nighttemp', '--')}°")
                temp_label.setStyleSheet("font-weight: bold; color: #1a1a2e; font-size: 14px;")
                temp_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
                day_layout.addWidget(temp_label)
                
                # 天气
                weather_label = QLabel(day.get('dayweather', '--'))
                weather_label.setStyleSheet("color: #6b7280; font-size: 11px;")
                weather_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
                day_layout.addWidget(weather_label)
                
                day_widget.setLayout(day_layout)
                forecast_layout.addWidget(day_widget, i // 4, i % 4)
            
            forecast_card.setLayout(forecast_layout)
            self.result_layout.addWidget(forecast_card)
        
        self.result_layout.addStretch()


# ==================== 汇率 ====================
class ExchangeWidget(QWidget):
    back_clicked = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self.setup_ui()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 20, 30, 20)
        
        header = QHBoxLayout()
        back_btn = QPushButton("← 返回")
        back_btn.setStyleSheet(GHOST_BTN_STYLE)
        back_btn.clicked.connect(self.back_clicked.emit)
        header.addWidget(back_btn)
        header.addStretch()
        layout.addLayout(header)
        
        title = QLabel("💱 汇率转换")
        title.setStyleSheet("font-size: 28px; font-weight: bold;")
        layout.addWidget(title)
        
        card = GlassCard()
        card_layout = QFormLayout()
        
        self.amount_input = QLineEdit("100")
        self.amount_input.setFixedHeight(45)
        card_layout.addRow("金额", self.amount_input)
        
        self.from_combo = QComboBox()
        self.from_combo.addItems(["CNY - 人民币", "USD - 美元", "EUR - 欧元", "JPY - 日元", "GBP - 英镑"])
        self.from_combo.setFixedHeight(45)
        card_layout.addRow("从", self.from_combo)
        
        self.to_combo = QComboBox()
        self.to_combo.addItems(["USD - 美元", "CNY - 人民币", "EUR - 欧元", "JPY - 日元", "GBP - 英镑"])
        self.to_combo.setFixedHeight(45)
        card_layout.addRow("到", self.to_combo)
        
        card.setLayout(card_layout)
        layout.addWidget(card)
        
        convert_btn = QPushButton("💱 转换")
        convert_btn.setFixedHeight(50)
        convert_btn.setStyleSheet(PRIMARY_BTN_STYLE)
        convert_btn.clicked.connect(self.convert)
        layout.addWidget(convert_btn)
        
        self.result_label = QLabel("")
        self.result_label.setStyleSheet("font-size: 32px; font-weight: bold; color: #6366f1; padding: 20px;")
        self.result_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.result_label)
        
        layout.addStretch()
        self.setLayout(layout)
    
    def convert(self):
        amount = self.amount_input.text()
        from_code = self.from_combo.currentText().split(" - ")[0]
        to_code = self.to_combo.currentText().split(" - ")[0]
        
        def do_convert():
            return api.post("/exchange/convert", {"amount": float(amount), "from": from_code, "to": to_code})
        
        self.thread = ApiThread(do_convert)
        self.thread.success.connect(self.show_result)
        self.thread.error.connect(lambda e: QMessageBox.warning(self, "错误", str(e)))
        self.thread.start()
    
    def show_result(self, result):
        from_info = result.get("from", {})
        to_info = result.get("to", {})
        self.result_label.setText(f"{from_info.get('amount', '')} {from_info.get('currency', '')} = {to_info.get('amount', '')} {to_info.get('currency', '')}")


# ==================== AI助手 ====================
class ChatWidget(QWidget):
    back_clicked = pyqtSignal()
    
    def __init__(self):
        super().__init__()
        self.messages = []
        self.my_plans = []
        self.setup_ui()
        self.load_plans()
    
    def setup_ui(self):
        main_layout = QHBoxLayout()
        main_layout.setContentsMargins(20, 15, 20, 15)
        
        # 左侧面板：统计和快捷操作
        left_panel = QWidget()
        left_panel.setFixedWidth(250)
        left_layout = QVBoxLayout()
        left_layout.setSpacing(15)
        
        # 旅行统计卡片
        stats_card = GlassCard("我的旅行统计")
        stats_layout = QGridLayout()
        stats_layout.setSpacing(10)
        
        self.trips_label = QLabel("0")
        self.trips_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #6366f1;")
        self.trips_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        stats_layout.addWidget(self.trips_label, 0, 0)
        stats_layout.addWidget(QLabel("行程数"), 1, 0)
        
        self.days_label = QLabel("0")
        self.days_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #10b981;")
        self.days_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        stats_layout.addWidget(self.days_label, 0, 1)
        stats_layout.addWidget(QLabel("总天数"), 1, 1)
        
        self.budget_label = QLabel("¥0")
        self.budget_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #f59e0b;")
        self.budget_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        stats_layout.addWidget(self.budget_label, 2, 0)
        stats_layout.addWidget(QLabel("总预算"), 3, 0)
        
        self.dest_label = QLabel("0")
        self.dest_label.setStyleSheet("font-size: 24px; font-weight: bold; color: #8b5cf6;")
        self.dest_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        stats_layout.addWidget(self.dest_label, 2, 1)
        stats_layout.addWidget(QLabel("目的地"), 3, 1)
        
        stats_card.setLayout(stats_layout)
        left_layout.addWidget(stats_card)
        
        # 快捷操作卡片
        quick_card = GlassCard("AI分析")
        quick_layout = QVBoxLayout()
        quick_layout.setSpacing(8)
        
        quick_actions = [
            ("📊 总结所有行程", "分析你的旅行历史和偏好"),
            ("🎯 推荐新目的地", "基于历史行程推荐"),
            ("📈 行程对比分析", "对比不同行程的优劣"),
            ("📋 统计报告", "旅行花费和时间统计")
        ]
        
        for title, desc in quick_actions:
            btn = QPushButton(title)
            btn.setStyleSheet("""
                QPushButton {
                    background: rgba(255, 255, 255, 100);
                    border: 1px solid rgba(255, 255, 255, 150);
                    border-radius: 8px;
                    padding: 10px;
                    text-align: left;
                    font-weight: bold;
                }
                QPushButton:hover {
                    background: rgba(99, 102, 241, 50);
                    border: 1px solid rgba(99, 102, 241, 100);
                }
            """)
            btn.setToolTip(desc)
            btn.clicked.connect(lambda checked, t=title: self.quick_action(t))
            quick_layout.addWidget(btn)
        
        quick_card.setLayout(quick_layout)
        left_layout.addWidget(quick_card)
        
        left_layout.addStretch()
        left_panel.setLayout(left_layout)
        main_layout.addWidget(left_panel)
        
        # 右侧面板：聊天区域
        right_panel = QWidget()
        right_layout = QVBoxLayout()
        
        header = QHBoxLayout()
        back_btn = QPushButton("← 返回")
        back_btn.setStyleSheet(GHOST_BTN_STYLE)
        back_btn.clicked.connect(self.back_clicked.emit)
        header.addWidget(back_btn)
        
        title = QLabel("🤖 AI助手")
        title.setStyleSheet("font-size: 20px; font-weight: bold;")
        header.addWidget(title)
        header.addStretch()
        
        clear_btn = QPushButton("清空对话")
        clear_btn.setStyleSheet(GHOST_BTN_STYLE)
        clear_btn.clicked.connect(self.clear_chat)
        header.addWidget(clear_btn)
        
        right_layout.addLayout(header)
        
        # 欢迎信息
        self.welcome_widget = QWidget()
        welcome_layout = QVBoxLayout()
        welcome_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        welcome_icon = QLabel("🤖")
        welcome_icon.setStyleSheet("font-size: 64px;")
        welcome_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        welcome_layout.addWidget(welcome_icon)
        
        welcome_title = QLabel("你好！我是你的AI旅行助手")
        welcome_title.setStyleSheet("font-size: 18px; font-weight: bold; color: #1a1a2e;")
        welcome_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        welcome_layout.addWidget(welcome_title)
        
        welcome_desc = QLabel("我可以帮你总结旅行历史、分析行程、推荐目的地")
        welcome_desc.setStyleSheet("font-size: 14px; color: #6b7280;")
        welcome_desc.setAlignment(Qt.AlignmentFlag.AlignCenter)
        welcome_layout.addWidget(welcome_desc)
        
        welcome_layout.addSpacing(20)
        
        # 推荐问题
        questions = [
            "总结一下我的旅行历史",
            "分析我的旅行偏好是什么",
            "推荐几个适合我的新目的地",
            "帮我做一份旅行花费报告"
        ]
        
        for q in questions:
            q_btn = QPushButton(q)
            q_btn.setStyleSheet("""
                QPushButton {
                    background: rgba(255, 255, 255, 100);
                    border: 1px solid rgba(255, 255, 255, 150);
                    border-radius: 8px;
                    padding: 12px 16px;
                    text-align: left;
                }
                QPushButton:hover {
                    background: rgba(99, 102, 241, 30);
                    border: 1px solid rgba(99, 102, 241, 80);
                }
            """)
            q_btn.clicked.connect(lambda checked, text=q: self.input_edit.setText(text))
            welcome_layout.addWidget(q_btn)
        
        self.welcome_widget.setLayout(welcome_layout)
        right_layout.addWidget(self.welcome_widget)
        
        self.chat_list = QListWidget()
        self.chat_list.setStyleSheet("""
            QListWidget {
                background: transparent;
                border: none;
            }
            QListWidget::item {
                background: transparent;
                border: none;
                padding: 5px;
            }
        """)
        self.chat_list.hide()
        right_layout.addWidget(self.chat_list)
        
        # 输入区
        input_layout = QHBoxLayout()
        self.input_edit = QLineEdit()
        self.input_edit.setPlaceholderText("问我关于你的旅行历史...")
        self.input_edit.setFixedHeight(45)
        self.input_edit.returnPressed.connect(self.send_message)
        input_layout.addWidget(self.input_edit)
        
        send_btn = QPushButton("发送")
        send_btn.setFixedSize(80, 45)
        send_btn.setStyleSheet(PRIMARY_BTN_STYLE)
        send_btn.clicked.connect(self.send_message)
        input_layout.addWidget(send_btn)
        
        right_layout.addLayout(input_layout)
        right_panel.setLayout(right_layout)
        main_layout.addWidget(right_panel)
        
        self.setLayout(main_layout)
    
    def load_plans(self):
        """加载用户行程用于统计"""
        def do_load():
            return api.get("/plans/my")
        
        self.load_thread = ApiThread(do_load)
        self.load_thread.success.connect(self.update_stats)
        self.load_thread.start()
    
    def update_stats(self, plans):
        self.my_plans = plans if isinstance(plans, list) else []
        
        total_trips = len(self.my_plans)
        total_days = sum(p.get('days', 0) for p in self.my_plans)
        total_budget = sum(p.get('budget', 0) for p in self.my_plans)
        destinations = list(set(p.get('destination', '') for p in self.my_plans if p.get('destination')))
        
        self.trips_label.setText(str(total_trips))
        self.days_label.setText(str(total_days))
        self.budget_label.setText(f"¥{total_budget}")
        self.dest_label.setText(str(len(destinations)))
    
    def quick_action(self, action):
        """快捷操作"""
        if not self.my_plans:
            self.add_message("AI", "你还没有创建任何行程，快去生成一个吧！", False)
            return
        
        prompts = {
            "📊 总结所有行程": "请总结我所有的旅行历史，分析我的旅行偏好和特点",
            "🎯 推荐新目的地": "根据我的旅行历史，请推荐一些我可能喜欢的新目的地",
            "📈 行程对比分析": "请对比分析我过去的不同行程，指出各自的亮点和可改进之处",
            "📋 统计报告": "请为我生成一份旅行统计报告，包括花费、时间、目的地等"
        }
        
        prompt = prompts.get(action, action)
        self.input_edit.setText(prompt)
        self.send_message()
    
    def send_message(self):
        text = self.input_edit.text().strip()
        if not text:
            return
        
        self.input_edit.clear()
        
        # 隐藏欢迎信息，显示聊天列表
        self.welcome_widget.hide()
        self.chat_list.show()
        
        self.messages.append({"role": "user", "content": text})
        self.add_message("我", text, True)
        
        # 如果有行程历史，使用带历史的聊天
        if self.my_plans:
            def do_chat():
                return api.post("/ai/chat/history", {"messages": self.messages, "plansHistory": self.my_plans})
        else:
            def do_chat():
                return api.post("/ai/chat", {"messages": self.messages})
        
        self.thread = ApiThread(do_chat)
        self.thread.success.connect(self.on_response)
        self.thread.error.connect(lambda e: self.add_message("AI", f"错误: {e}", False))
        self.thread.start()
    
    def on_response(self, result):
        msg = result.get("message", "") if isinstance(result, dict) else str(result)
        self.messages.append({"role": "assistant", "content": msg})
        self.add_message("AI", msg, False)
    
    def add_message(self, sender, content, is_user):
        item = QListWidgetItem()
        widget = QWidget()
        layout = QVBoxLayout()
        
        sender_label = QLabel(sender)
        sender_label.setStyleSheet(f"font-weight: bold; color: {'#6366f1' if is_user else '#10b981'};")
        layout.addWidget(sender_label)
        
        content_label = QLabel(content)
        content_label.setWordWrap(True)
        content_label.setTextInteractionFlags(Qt.TextInteractionFlag.TextSelectableByMouse)
        content_label.setStyleSheet("font-size: 14px; color: #1a1a2e;")
        layout.addWidget(content_label)
        
        widget.setLayout(layout)
        item.setSizeHint(widget.sizeHint())
        self.chat_list.addItem(item)
        self.chat_list.setItemWidget(item, widget)
        self.chat_list.scrollToBottom()
    
    def clear_chat(self):
        self.messages.clear()
        self.chat_list.clear()
        self.chat_list.hide()
        self.welcome_widget.show()


# ==================== 我的 ====================
class MyWidget(QWidget):
    back_clicked = pyqtSignal()
    logout_clicked = pyqtSignal()
    plan_clicked = pyqtSignal(int)
    
    def __init__(self):
        super().__init__()
        self.setup_ui()
        self.load_user_info()
    
    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 20, 30, 20)
        
        header = QHBoxLayout()
        back_btn = QPushButton("← 返回")
        back_btn.setStyleSheet(GHOST_BTN_STYLE)
        back_btn.clicked.connect(self.back_clicked.emit)
        header.addWidget(back_btn)
        header.addStretch()
        
        logout_btn = QPushButton("退出登录")
        logout_btn.setStyleSheet(GHOST_BTN_STYLE)
        logout_btn.clicked.connect(self.logout_clicked.emit)
        header.addWidget(logout_btn)
        
        layout.addLayout(header)
        
        # 用户信息卡片
        self.user_card = GlassCard()
        user_layout = QVBoxLayout()
        
        self.user_label = QLabel("加载中...")
        self.user_label.setStyleSheet("font-size: 24px; font-weight: bold;")
        user_layout.addWidget(self.user_label)
        
        self.email_label = QLabel("")
        self.email_label.setStyleSheet("font-size: 14px; color: #6b7280;")
        user_layout.addWidget(self.email_label)
        
        self.user_card.setLayout(user_layout)
        layout.addWidget(self.user_card)
        
        # 我的行程
        plans_title = QLabel("📋 我的行程")
        plans_title.setStyleSheet("font-size: 20px; font-weight: bold; margin-top: 10px;")
        layout.addWidget(plans_title)
        
        self.plans_list = QListWidget()
        self.plans_list.itemClicked.connect(self.on_plan_clicked)
        layout.addWidget(self.plans_list)
        
        self.setLayout(layout)
    
    def load_user_info(self):
        def do_load():
            return api.get("/auth/me")
        
        self.thread = ApiThread(do_load)
        self.thread.success.connect(self.show_user_info)
        self.thread.start()
    
    def show_user_info(self, user):
        self.user_label.setText(user.get("nickname") or user.get("username", ""))
        self.email_label.setText(user.get("email", ""))
        self.load_plans()
    
    def load_plans(self):
        def do_load():
            return api.get("/plans/my")
        
        self.thread2 = ApiThread(do_load)
        self.thread2.success.connect(self.show_plans)
        self.thread2.start()
    
    def show_plans(self, plans):
        self.plans_list.clear()
        for plan in plans:
            item = QListWidgetItem(f"{plan['title']}  |  {plan['destination']}  |  {plan['days']}天")
            item.setData(Qt.ItemDataRole.UserRole, plan["id"])
            self.plans_list.addItem(item)
    
    def on_plan_clicked(self, item):
        plan_id = item.data(Qt.ItemDataRole.UserRole)
        self.plan_clicked.emit(plan_id)


# ==================== 主窗口 ====================
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setup_window()
        self.setup_pages()
    
    def setup_window(self):
        self.setWindowTitle("AI旅行规划助手")
        self.setMinimumSize(1000, 700)
        self.resize(1200, 800)
        self.setStyleSheet(GLASS_STYLE)
    
    def setup_pages(self):
        self.stack = QStackedWidget()
        self.setCentralWidget(self.stack)
        
        # 登录
        self.login_page = LoginWidget()
        self.login_page.login_success.connect(self.show_home)
        self.stack.addWidget(self.login_page)
        
        # 首页
        self.home_page = HomeWidget()
        self.home_page.generate_clicked.connect(self.show_generate)
        self.home_page.community_clicked.connect(self.show_community)
        self.home_page.weather_clicked.connect(self.show_weather)
        self.home_page.exchange_clicked.connect(self.show_exchange)
        self.home_page.chat_clicked.connect(self.show_chat)
        self.home_page.my_clicked.connect(self.show_my)
        self.stack.addWidget(self.home_page)
        
        # 生成行程
        self.generate_page = GenerateWidget()
        self.generate_page.plan_generated.connect(self.show_plan_detail)
        self.generate_page.back_clicked.connect(self.show_home)
        self.stack.addWidget(self.generate_page)
        
        # 行程详情
        self.plan_page = PlanDetailWidget()
        self.plan_page.back_clicked.connect(self.show_home)
        self.stack.addWidget(self.plan_page)
        
        # 社区
        self.community_page = CommunityWidget()
        self.community_page.plan_clicked.connect(self.show_plan_detail)
        self.community_page.back_clicked.connect(self.show_home)
        self.stack.addWidget(self.community_page)
        
        # 天气
        self.weather_page = WeatherWidget()
        self.weather_page.back_clicked.connect(self.show_home)
        self.stack.addWidget(self.weather_page)
        
        # 汇率
        self.exchange_page = ExchangeWidget()
        self.exchange_page.back_clicked.connect(self.show_home)
        self.stack.addWidget(self.exchange_page)
        
        # AI助手
        self.chat_page = ChatWidget()
        self.chat_page.back_clicked.connect(self.show_home)
        self.stack.addWidget(self.chat_page)
        
        # 我的
        self.my_page = MyWidget()
        self.my_page.back_clicked.connect(self.show_home)
        self.my_page.logout_clicked.connect(self.logout)
        self.my_page.plan_clicked.connect(self.show_plan_detail)
        self.stack.addWidget(self.my_page)
        
        self.stack.setCurrentWidget(self.login_page)
    
    def show_home(self):
        self.stack.setCurrentWidget(self.home_page)
    
    def show_generate(self):
        self.stack.setCurrentWidget(self.generate_page)
    
    def show_community(self):
        self.community_page.load_plans()
        self.stack.setCurrentWidget(self.community_page)
    
    def show_plan_detail(self, plan_id):
        self.plan_page.load_plan(plan_id)
        self.stack.setCurrentWidget(self.plan_page)
    
    def show_weather(self):
        self.stack.setCurrentWidget(self.weather_page)
    
    def show_exchange(self):
        self.stack.setCurrentWidget(self.exchange_page)
    
    def show_chat(self):
        self.stack.setCurrentWidget(self.chat_page)
    
    def show_my(self):
        self.my_page.load_user_info()
        self.stack.setCurrentWidget(self.my_page)
    
    def logout(self):
        api.set_token(None)
        self.stack.setCurrentWidget(self.login_page)


def main():
    app = QApplication(sys.argv)
    app.setApplicationName("AI旅行规划助手")
    
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec())


if __name__ == '__main__':
    main()
