# AI旅行规划助手 - 完整技术架构文档

## 📋 目录
- [项目概述](#项目概述)
- [整体架构](#整体架构)
- [技术栈详解](#技术栈详解)
- [后端架构](#后端架构)
- [前端架构](#前端架构)
- [小程序架构](#小程序架构)
- [桌面端架构](#桌面端架构)
- [数据流详解](#数据流详解)
- [POI搜索原理](#poi搜索原理)
- [部署架构](#部署架构)

---

## 项目概述

AI旅行规划助手是一个多平台应用，支持Web、微信小程序、桌面端（Windows/macOS/Linux）。

### 核心功能
| 功能 | 说明 |
|------|------|
| AI行程生成 | 基于智谱AI(GLM-4)自动生成个性化行程 |
| ClawBot | 基于百度AI的深度对话助手 |
| 地图可视化 | 高德地图API显示景点位置 |
| 天气查询 | 实时天气和预报 |
| 汇率转换 | 实时汇率查询 |
| 社区分享 | 用户分享公开行程 |

---

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端                                │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│   Web端     │  微信小程序  │  PyQt桌面版  │  pywebview桌面版│
│  (React)    │  (原生)     │ (Windows/Linux)│   (macOS)      │
└──────┬──────┴──────┬──────┴──────┬──────┴────────┬────────┘
       │             │             │               │
       └─────────────┴─────────────┴───────────────┘
                             │
                       HTTP/HTTPS
                             │
┌────────────────────────────┴────────────────────────────────┐
│                     Nginx 反向代理                           │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                   Node.js 后端服务                           │
│                     (Express + Prisma)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Auth    │  │ Plan    │  │ AI      │  │ Map     │        │
│  │ Module  │  │ Module  │  │ Module  │  │ Module  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└────────────────────────────┬────────────────────────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────┴──────┐    ┌────────┴────────┐    ┌───────┴───────┐
│    MySQL    │    │   外部API服务    │    │   高德地图API │
│   数据库    │    │  智谱AI/百度AI   │    │  天气/POI/导航 │
└─────────────┘    └─────────────────┘    └───────────────┘
```

---

## 技术栈详解

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | 4.x | Web框架 |
| Prisma | 5.x | ORM |
| MySQL | 8.0 | 数据库 |
| JWT | - | 认证 |
| Zod | 3.x | 参数验证 |
| Winston | 3.x | 日志 |
| node-cron | 3.x | 定时任务 |

### 前端技术栈 (Web)

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI框架 |
| Vite | 5.x | 构建工具 |
| TypeScript | 5.x | 类型安全 |
| React Router | 6.x | 路由 |
| Ant Design | 5.x | UI组件 |
| Tailwind CSS | 3.x | 样式 |
| Zustand | 4.x | 状态管理 |
| Axios | 1.x | HTTP请求 |

### 小程序技术栈

| 技术 | 用途 |
|------|------|
| WXML | 页面结构 |
| WXSS | 样式 |
| JavaScript | 逻辑 |
| 微信API | 原生能力 |

### 桌面端技术栈

| 平台 | 技术 | 说明 |
|------|------|------|
| Windows | PyQt5 + QWebEngine | 内嵌Web界面 |
| macOS | pywebview | 轻量级桌面应用 |
| Linux | PyQt5 + QWebEngine | 内嵌Web界面 |

---

## 后端架构

### 目录结构
```
server/
├── src/
│   ├── routes/           # API路由
│   │   ├── auth.js       # 认证路由
│   │   ├── plan.js       # 行程路由
│   │   ├── ai.js         # AI路由
│   │   ├── community.js  # 社区路由
│   │   ├── weather.js    # 天气路由
│   │   └── exchange.js   # 汇率路由
│   ├── services/         # 业务逻辑
│   │   ├── aiService.js        # AI服务
│   │   ├── mapService.js       # 地图服务
│   │   ├── weatherService.js   # 天气服务
│   │   └── exchangeService.js  # 汇率服务
│   ├── middleware/       # 中间件
│   │   └── auth.js       # 认证中间件
│   ├── utils/            # 工具函数
│   │   └── logger.js     # 日志工具
│   ├── db.js             # 数据库连接
│   └── index.js          # 入口文件
├── prisma/
│   └── schema.prisma     # 数据库模型
└── package.json
```

### 数据库模型

```prisma
model User {
  id            Int       @id @default(autoincrement())
  username      String    @unique
  email         String    @unique
  password      String
  nickname      String?
  avatar        String?
  createdAt     DateTime  @default(now())
  
  travelPlans   TravelPlan[]
  likes         Like[]
}

model TravelPlan {
  id            Int       @id @default(autoincrement())
  userId        Int
  title         String
  destination   String
  days          Int
  budget        Int
  travelDate    DateTime?
  preferences   Json
  itinerary     Json      // 完整行程数据
  isPublic      Boolean   @default(false)
  viewCount     Int       @default(0)
  copyCount     Int       @default(0)
  createdAt     DateTime  @default(now())
  
  user          User      @relation(fields: [userId], references: [id])
  likes         Like[]
}

model Like {
  id            Int       @id @default(autoincrement())
  userId        Int
  planId        Int
  createdAt     DateTime  @default(now())
  
  user          User      @relation(fields: [userId], references: [id])
  plan          TravelPlan @relation(fields: [planId], references: [id])
  
  @@unique([userId, planId])
}
```

### API接口

#### 认证接口
```
POST /api/auth/register    # 用户注册
POST /api/auth/login       # 用户登录
GET  /api/auth/me          # 获取当前用户
```

#### 行程接口
```
POST   /api/plans/generate  # AI生成行程
GET    /api/plans/my        # 获取我的行程
GET    /api/plans/:id       # 获取行程详情
PUT    /api/plans/:id       # 更新行程
DELETE /api/plans/:id       # 删除行程
POST   /api/plans/:id/copy  # 复制行程
```

#### 社区接口
```
GET  /api/community/plans        # 获取公开行程
POST /api/community/plans/:id/like # 点赞行程
```

#### 其他接口
```
GET  /api/weather/:city     # 获取天气
GET  /api/exchange/rates/:base  # 获取汇率
POST /api/exchange/convert  # 货币转换
POST /api/ai/chat           # AI对话
POST /api/ai/claw           # ClawBot对话
```

---

## 前端架构

### 目录结构
```
web/
├── src/
│   ├── pages/          # 页面组件
│   │   ├── Home.jsx        # 首页
│   │   ├── Login.jsx       # 登录
│   │   ├── Register.jsx    # 注册
│   │   ├── PlanGenerator.jsx  # 行程生成
│   │   ├── PlanDetail.jsx  # 行程详情
│   │   ├── MyPlans.jsx     # 我的行程
│   │   ├── Community.jsx   # 社区
│   │   ├── AIChat.jsx      # AI助手
│   │   ├── MimoClaw.jsx    # ClawBot
│   │   ├── weather/        # 天气页面
│   │   └── exchange/       # 汇率页面
│   ├── components/     # 通用组件
│   │   ├── Header.jsx      # 头部导航
│   │   └── AMap.jsx        # 地图组件
│   ├── services/       # 服务
│   │   └── store.js        # Zustand状态管理
│   ├── index.css       # 全局样式
│   └── main.jsx        # 入口文件
├── public/
└── package.json
```

### 路由结构
```
/                # 首页
/login           # 登录
/register        # 注册
/generate        # 生成行程
/plan/:id        # 行程详情
/my-plans        # 我的行程
/community       # 社区
/chat            # AI助手
/claw            # ClawBot
/weather         # 天气
/exchange        # 汇率
```

### 状态管理 (Zustand)

```javascript
// store.js
export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: async (data) => { ... },
  logout: () => { ... },
  fetchUser: async () => { ... }
}));

export const usePlanStore = create((set) => ({
  myPlans: [],
  communityPlans: [],
  currentPlan: null,
  generatePlan: async (data) => { ... },
  fetchMyPlans: async () => { ... },
  fetchCommunityPlans: async (params) => { ... }
}));
```

---

## 小程序架构

### 目录结构
```
miniprogram/
├── pages/
│   ├── index/          # 首页
│   ├── generate/       # 生成行程
│   ├── plan/           # 行程详情
│   ├── community/      # 社区
│   ├── chat/           # AI助手
│   ├── claw/           # ClawBot
│   ├── my/             # 我的
│   ├── login/          # 登录
│   ├── weather/        # 天气
│   └── exchange/       # 汇率
├── services/
│   └── aiService.js    # AI服务
├── utils/
│   └── api.js          # API封装
├── data/
│   └── scenic-spots.json  # 景点数据
├── images/             # 图片资源
├── app.js              # 应用入口
├── app.json            # 应用配置
└── app.wxss            # 全局样式
```

### 页面配置
```json
{
  "pages": [
    "pages/index/index",
    "pages/generate/generate",
    "pages/plan/plan",
    "pages/community/community",
    "pages/chat/chat",
    "pages/claw/claw",
    "pages/my/my",
    "pages/login/login",
    "pages/weather/weather",
    "pages/exchange/exchange"
  ],
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/community/community", "text": "社区" },
      { "pagePath": "pages/chat/chat", "text": "AI助手" },
      { "pagePath": "pages/my/my", "text": "我的" }
    ]
  }
}
```

---

## 桌面端架构

### Windows/Linux版 (PyQt)
```
desktop-pyqt/
├── main.py             # 主程序
├── requirements.txt    # 依赖
└── build.bat           # 打包脚本
```

**技术：** PyQt5 + QWebEngineView

### macOS版 (pywebview)
```
desktop-pyqt/
├── main.py             # 主程序 (macOS版本)
├── requirements.txt    # 依赖
└── build.sh            # 打包脚本
```

**技术：** pywebview + Flask/系统浏览器

---

## 数据流详解

### 行程生成流程

```
用户输入 (目的地、天数、预算、偏好)
        │
        ▼
┌─────────────────────────────────────┐
│  1. 获取天气信息                      │
│     weatherService.getWeather(city)  │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  2. 调用AI生成行程                    │
│     aiService.generateTravelPlan()   │
│     → 智谱AI GLM-4-Flash             │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  3. 修正地图坐标                      │
│     mapService.geocodeLocations()    │
│     → 高德POI搜索                    │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  4. 保存到数据库                      │
│     prisma.travelPlan.create()       │
└─────────────────────────────────────┘
        │
        ▼
返回完整行程数据
```

### 地图点位确定流程

```
AI生成: { name: "西湖", ... }
        │
        ▼
┌─────────────────────────────────────┐
│  方式1: POI搜索（优先）               │
│  searchPOI("西湖", "杭州")           │
│  → 高德POI数据库精确匹配              │
└─────────────────────────────────────┘
        │ (失败时)
        ▼
┌─────────────────────────────────────┐
│  方式2: 地理编码（备用）              │
│  geocode("杭州市西湖区")             │
│  → 地址转坐标                        │
└─────────────────────────────────────┘
        │ (失败时)
        ▼
┌─────────────────────────────────────┐
│  方式3: AI坐标（最终备用）            │
│  保留AI返回的坐标                    │
└─────────────────────────────────────┘
        │
        ▼
存储: { name: "西湖", longitude: 120.15, latitude: 30.25 }
```

---

## POI搜索原理

### 什么是POI

**POI = Point of Interest（兴趣点）**

```
POI类型：
├── 景点 (西湖、灵隐寺)
├── 交通枢纽 (杭州东站)
├── 酒店 (西湖国宾馆)
├── 餐厅 (楼外楼)
├── 购物 (银泰百货)
└── 医院、学校、政府机构...
```

### POI搜索 vs 地理编码

| 特性 | POI搜索 | 地理编码 |
|------|---------|----------|
| 输入 | 关键词（"西湖"） | 完整地址（"杭州市西湖区"） |
| 输出 | 精确地点信息 | 坐标点 |
| 精度 | 高（具体景点） | 中（区域级别） |
| 适用场景 | 景点名称 | 完整地址 |

### 高德POI搜索流程

```
输入: "西湖"
        │
        ▼
┌─────────────────────────────────────┐
│  高德POI数据库（全国数亿条）          │
│  ├── 名称匹配                        │
│  ├── 别名匹配                        │
│  ├── 拼音匹配                        │
│  └── 模糊匹配                        │
└─────────────────────────────────────┘
        │
        ▼
返回结果（按相关度排序）
[
  { name: "西湖风景区", location: "120.15,30.25" },
  { name: "西湖公园", location: "116.40,39.90" },
  ...
]
        │
        ▼
取第一条（最相关）
→ { longitude: 120.15, latitude: 30.25 }
```

### API请求示例

```javascript
// 请求URL
https://restapi.amap.com/v3/place/text?
  keywords=西湖           // 搜索关键词
  &city=杭州              // 限定城市
  &key=YOUR_KEY           // API密钥
  &output=JSON            // 返回格式
  &offset=1               // 每页条数
  &page=1                 // 页码
```

### 返回数据结构

```json
{
  "status": "1",
  "pois": [{
    "id": "B0FFKQZJ2C",
    "name": "西湖风景名胜区",
    "address": "杭州市西湖区龙井路1号",
    "location": "120.146282,30.247182",
    "pname": "浙江省",
    "cityname": "杭州市",
    "adname": "西湖区"
  }]
}
```

### 代码实现

```javascript
// 地理编码：地址转坐标
export const geocode = async (address, city = '') => {
  const url = `${AMAP_BASE_URL}/geocode/geo?address=${address}&city=${city}&key=${AMAP_KEY}`;
  const data = await fetch(url).then(r => r.json());
  
  if (data.status === '1' && data.geocodes?.length > 0) {
    const [lng, lat] = data.geocodes[0].location.split(',');
    return { longitude: parseFloat(lng), latitude: parseFloat(lat) };
  }
  return null;
};

// POI搜索：精确地点搜索
export const searchPOI = async (keyword, city = '') => {
  const url = `${AMAP_BASE_URL}/place/text?keywords=${keyword}&city=${city}&key=${AMAP_KEY}&offset=1`;
  const data = await fetch(url).then(r => r.json());
  
  if (data.status === '1' && data.pois?.length > 0) {
    const [lng, lat] = data.pois[0].location.split(',');
    return { longitude: parseFloat(lng), latitude: parseFloat(lat) };
  }
  return null;
};

// 批量修正坐标
export const geocodeLocations = async (itinerary, destination) => {
  for (const day of itinerary.days) {
    for (const act of day.activities) {
      // 优先POI搜索
      let coords = await searchPOI(act.name, destination);
      // 备用地理编码
      if (!coords && act.address) {
        coords = await geocode(act.address, destination);
      }
      // 保留AI坐标作为fallback
      if (coords) {
        act.longitude = coords.longitude;
        act.latitude = coords.latitude;
      }
      // 避免请求太快
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return itinerary;
};
```

---

## 部署架构

### Docker部署

```yaml
# docker-compose.yml
services:
  web:
    build: ../web
    ports:
      - "80:80"
    depends_on:
      - server

  server:
    build: ../server
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:pass@db:3306/ai_travel
      - JWT_SECRET=your-secret
      - AI_API_KEY=your-key
    depends_on:
      - db

  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=ai_travel
```

### 请求流程

```
用户请求 → Nginx (端口80) → Express (端口3000) → MySQL
                              ↓
                         外部API服务
                         ├── 智谱AI
                         ├── 百度AI
                         └── 高德地图
```

---

## 外部服务

| 服务 | 用途 | 说明 |
|------|------|------|
| 智谱AI (GLM-4) | 行程生成、AI聊天 | 主要AI服务 |
| 百度AI (千帆) | ClawBot功能 | 深度对话 |
| 高德地图API | 地图、POI、导航 | 地理服务 |
| 高德天气API | 天气查询 | 天气数据 |
| ExchangeRate-API | 汇率数据 | 货币转换 |
| 微信开放平台 | 小程序、登录 | 微信生态 |

---

## 开发者

- 汪海岩

## 许可证

Apache-2.0 License
