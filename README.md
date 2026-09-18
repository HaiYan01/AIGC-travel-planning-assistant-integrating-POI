# AI 旅行规划助手

**AIGC Travel Planning Assistant** —— 基于大模型与高德 POI 的多端 AI 旅行规划助手。

输入目的地、天数、预算和偏好,AI 自动生成包含景点、美食、交通与预算的完整行程,并将景点自动标记在地图上。项目同时提供 **Web 端、微信小程序、Windows / Linux / macOS 桌面客户端** 四种形态,以及行程社区、AI 对话、天气 / 汇率等实用工具。

> 开源协议:[Apache License 2.0](LICENSE)

## 📚 文档导航

| 想做什么 | 直接跳转 |
| --- | --- |
| 申请 API Key(大模型 / 高德 / 百度 / JWT…) | [项目文档/API配置指南.md](项目文档/API配置指南.md) |
| 本地跑起来 · 开发环境说明 | [项目文档/DEVELOPMENT.md](项目文档/DEVELOPMENT.md) · 本 README 下方《快速开始》 |
| 部署到服务器(Nginx + PM2 + HTTPS) | [项目文档/deploy-README.md](项目文档/deploy-README.md) |
| 系统架构 · 接口 · 数据库设计 | [项目文档/TECHNICAL-ARCHITECTURE.md](项目文档/TECHNICAL-ARCHITECTURE.md) |
| POI 检索与坐标修正原理 | [项目文档/POI原理与实现.md](项目文档/POI原理与实现.md) |
| 桌面客户端(运行 / 打包 / 笔记) | [desktop-pyqt-README.md](项目文档/desktop-pyqt-README.md) · [desktop-linux-README.md](项目文档/desktop-linux-README.md) · [BUILD.md](项目文档/BUILD.md) · [desktop-development-notes.md](项目文档/desktop-development-notes.md) |
| 微信小程序 | [项目文档/miniprogram-README.md](项目文档/miniprogram-README.md) |
| ClawBot 白名单与权限 | [项目文档/claw-whitelist-config.md](项目文档/claw-whitelist-config.md) |
| 全部文档与阅读顺序 | [项目文档/README.md](项目文档/README.md)(文档索引) |

## ✨ 功能特性

| 功能 | 说明 |
| --- | --- |
| 🤖 AI 行程生成 | 输入目的地 / 天数 / 预算 / 偏好,大模型生成结构化行程(逐日安排、餐饮推荐、预算、贴士) |
| 🗺️ 地图可视化 | 行程景点经高德 POI 检索修正坐标后,在页面地图上自动标记并规划路线 |
| 📋 行程管理 | 我的行程、公开 / 私密设置、复制、编辑、分享 |
| 👥 攻略社区 | 公开行程浏览、点赞、评论、关注、私信 |
| 💬 ClawBot | 基于百度 AI 的联网问答助手(白名单可配置) |
| 🌤️ 实用工具 | 天气预报、汇率换算、交通与门票信息 |
| 📱 多端支持 | Web、微信小程序、Windows / Linux / macOS 桌面客户端 |

## 🧱 技术栈

| 层 | 技术 |
| --- | --- |
| Web 前端 | React 18 · Vite · Ant Design 5 · Tailwind CSS · Zustand · Axios · React Router |
| 后端 | Node.js · Express · Prisma ORM · Zod · JWT · Winston · express-rate-limit |
| 数据库 | MySQL 8 |
| AI 服务 | OpenAI 兼容接口(智谱 GLM-4-Flash / 小米 MiMo 等可切换)、百度 AI(ClawBot) |
| 地图服务 | 高德开放平台(Web 服务 Key + JS API) |
| 微信小程序 | 原生小程序框架 |
| 桌面客户端 | Windows: PyQt + QWebEngine · Linux: pywebview(GTK) · macOS: pywebview |
| 部署 | Nginx 反向代理 · PM2 进程守护 · Docker Compose(可选)· certbot HTTPS |

## 🏗️ 系统架构

```
┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐
│  Web 前端     │  │  微信小程序   │  │  桌面客户端 (Win/Linux/mac) │
│  React+Vite  │  │              │  │  内嵌 WebView 访问 Web 端   │
└──────┬───────┘  └──────┬───────┘  └─────────────┬─────────────┘
       │                 │                        │
       └────────────┬────┴────────────────────────┘
                    ▼
             ┌─────────────┐
             │    Nginx    │  静态资源(web/dist)+ /api 反向代理
             └──────┬──────┘
                    ▼
             ┌─────────────┐     ┌──────────────┐
             │  Express    │────▶│    MySQL 8    │
             │  REST API   │     │  (Prisma ORM) │
             └──────┬──────┘     └──────────────┘
                    ▼
   ┌────────────┬──────────┬──────────────┬─────────────┐
   │ 大模型 API  │ 高德开放平台 │ 百度 AI(ClawBot) │ 汇率/天气 API │
   └────────────┴──────────┴──────────────┴─────────────┘
```

**行程生成链路**:提交需求 → 查询天气 → 大模型生成 JSON 行程(景点名称)→ 高德 POI 检索修正坐标(失败则地理编码兜底)→ 写入数据库 → 前端地图可视化。

**数据库模型**(Prisma,见 `server/prisma/schema.prisma`):`User`、`TravelPlan`、`Attraction`、`Comment`、`Like`、`Follow`、`Message`。

## 📂 目录结构

```
.
├── web/                 # Web 前端(React + Vite)
├── server/              # 后端 API(Node + Express + Prisma)
│   ├── prisma/          # 数据库 Schema 与种子脚本
│   └── src/routes/      # auth / plan / ai / community / admin / weather ...
├── miniprogram/         # 微信小程序
├── desktop-windows/     # Windows 桌面客户端(PyQt)
├── desktop-linux/       # Linux 桌面客户端(pywebview)
├── desktop-mac/         # macOS 桌面客户端(pywebview)
├── deploy/              # 服务器部署脚本(nginx / pm2 / HTTPS)
├── docker/              # Docker Compose 一键部署
├── 项目文档/             # 开发、架构、部署、API 配置等文档
└── .github/workflows/   # 多平台桌面端自动打包
```

## 🚀 快速开始

### 0. 准备 API Key

所有密钥都通过环境变量配置,**不要提交真实密钥**。各密钥的申请方式见 **[项目文档/API配置指南.md](项目文档/API配置指南.md)**。

### 1. 启动后端

```bash
cd server
npm install

# 配置环境变量(把 API_KEY 换成真实值)
cp .env.example .env

# 初始化数据库(需本地已有 MySQL,并先在 .env 中配置 DATABASE_URL)
npx prisma generate
npm run db:push

# 创建管理员账号(自行设置密码)
ADMIN_PASSWORD=你的密码 node create-admin.mjs

npm run dev        # 开发模式(nodemon),默认端口见 .env
```

### 2. 启动 Web 前端

```bash
cd web
npm install

cp .env.example .env.development   # 填写 VITE_AMAP_KEY
npm run dev                        # http://localhost:5173

npm run build                      # 生产构建,产物在 web/dist
```

### 3. Docker 一键部署(可选)

```bash
cd docker
cp .env.example .env      # 填写 DB_PASSWORD / JWT_SECRET / AI_API_KEY
docker compose up -d      # MySQL + 后端 + Nginx
```

### 4. 微信小程序 / 桌面客户端

- 小程序:微信开发者工具导入 `miniprogram/`,修改 `app.js` 中的接口地址为你的域名(见 [项目文档/miniprogram-README.md](项目文档/miniprogram-README.md))
- 桌面端:见 [项目文档/desktop-linux-README.md](项目文档/desktop-linux-README.md)、[项目文档/desktop-pyqt-README.md](项目文档/desktop-pyqt-README.md)、[项目文档/BUILD.md](项目文档/BUILD.md)

## 🔑 环境变量一览

| 变量 | 用途 | 位置 |
| --- | --- | --- |
| `DATABASE_URL` | MySQL 连接串 | `server/.env` |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | 登录令牌签名 | `server/.env` |
| `AI_API_KEY` / `AI_API_BASE_URL` / `AI_MODEL` | 大模型(OpenAI 兼容) | `server/.env` |
| `BAIDU_APP_ID` / `BAIDU_SECRET_KEY` | ClawBot 百度 AI(可选) | `server/.env` |
| `AMAP_KEY` / `AMAP_SECURITY_CODE` | 高德地图服务 | `server/.env` |
| `VITE_API_BASE_URL` / `VITE_AMAP_KEY` | 前端接口地址 / 地图 Key | `web/.env.development` |
| `DB_PASSWORD` / `AI_API_KEY` / `JWT_SECRET` | Docker 部署 | `docker/.env` |

👉 完整的申请地址与填写说明:**[项目文档/API配置指南.md](项目文档/API配置指南.md)**

## 📦 服务器部署

Nginx(静态资源 + `/api` 反代)+ PM2 + MySQL 的标准部署流程、HTTPS 证书配置与常见问题,见 **[项目文档/deploy-README.md](项目文档/deploy-README.md)**。

## 📖 文档总览

全部文档及推荐阅读顺序见 **[项目文档/README.md](项目文档/README.md)**(文档索引);常用入口已在上方《文档导航》列出。

## 📄 开源协议

本项目采用 [Apache License 2.0](LICENSE) 开源,Copyright © 2026 HaiYan01。
