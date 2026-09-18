# AI旅行规划助手

AI驱动的个性化旅行路线规划助手，支持多平台（Web、桌面端、小程序）。

## 📋 文档目录

| 文档 | 说明 |
|------|------|
| [完整技术架构](./TECHNICAL-ARCHITECTURE.md) | 详细技术栈、架构设计、POI搜索原理等 |
| [部署说明](./deploy-README.md) | 服务器部署指南 |
| [小程序开发](./miniprogram-README.md) | 微信小程序开发说明 |
| [桌面端开发](./desktop-development-notes.md) | 桌面端开发笔记 |
| [ClawBot配置](./claw-whitelist-config.md) | ClawBot白名单配置 |
| [构建说明](./BUILD.md) | 项目构建指南 |

## 功能特性

- 🎯 **AI智能生成**：输入目的地和偏好，AI自动生成详细行程
- 🗺️ **地图可视化**：景点自动标记在地图上，路线一目了然
- ☁️ **天气预报**：实时天气查询，结合天气智能调整行程
- 🚄 **交通查询**：12306火车票、携程机票一键查询
- 🎫 **门票预订**：景点门票快速预订
- 💱 **汇率转换**：实时汇率查询
- 👥 **攻略社区**：分享你的行程，发现更多精彩旅行方案
- 🤖 **AI助手**：随时询问天气、穿衣建议等旅行问题
- 🤖 **ClawBot**：基于百度AI的智能助手，深度分析旅行

## 技术栈

### 前端 (Web)
- **框架**: React 18
- **构建工具**: Vite
- **UI库**: Ant Design 5
- **状态管理**: Zustand
- **路由**: React Router 6
- **样式**: Tailwind CSS
- **地图**: 高德地图 API
- **HTTP**: Axios

### 后端
- **运行时**: Node.js
- **框架**: Express
- **ORM**: Prisma
- **数据库**: MySQL
- **认证**: JWT
- **AI服务**: OpenAI 兼容接口（可填写智谱AI GLM-4-Flash、小米 MiMo 等，详见 `server/.env.example`）、百度AI (ClawBot)
- **地图服务**: 高德地图 API
- **日志**: Winston

### 桌面端
- **Windows/macOS**: PyQt6 + WebEngine (或 pywebview)
- **Linux**: PyQt6 + WebEngine (或 pywebview)

### 小程序
- **框架**: 微信小程序原生

## 项目结构

```
BS/
├── web/                    # Web前端
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   ├── components/     # 通用组件
│   │   ├── services/       # API服务和状态管理
│   │   └── utils/          # 工具函数
│   └── public/             # 静态资源
├── server/                 # 后端服务
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── services/       # 业务逻辑
│   │   ├── middleware/     # 中间件
│   │   ├── config/         # 配置文件
│   │   └── utils/          # 工具函数
│   └── prisma/             # 数据库模型
├── desktop-windows/        # Windows桌面版
├── desktop-mac/            # macOS桌面版
├── desktop-linux/          # Linux桌面版
├── miniprogram/            # 微信小程序
├── docker/                 # Docker配置
└── 项目文档/                # 项目文档
```

## 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
cd web && npm install
cd ../server && npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp server/.env.example server/.env

# 编辑配置
# - DATABASE_URL: MySQL数据库连接
# - JWT_SECRET: JWT密钥
# - AI_API_KEY: AI服务密钥（OpenAI兼容接口，可填智谱AI / 小米 MiMo 等，详见 server/.env.example）
# - BAIDU_APP_ID: 百度AI应用ID
# - BAIDU_SECRET_KEY: 百度AI密钥
# - AMAP_KEY: 高德地图密钥
```

### 3. 初始化数据库

```bash
cd server
npm run db:push
```

### 4. 启动服务

```bash
# 同时启动前端和后端
npm run dev

# 或者分别启动
npm run dev:server
npm run dev:web
```

### 5. 访问应用

- 前端：http://localhost:5173
- 后端：http://localhost:3000（默认端口，见 `server/.env.example` 的 `PORT`）

> 端口说明：后端默认监听 3000（生产环境 nginx 反代与 PM2 均使用 3000）。若本地开发改用 3001，需同时修改 `web/vite.config.js` 中 `/api` 代理的 `target`，保持与后端端口一致。

## API文档

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户

### 行程
- `POST /api/plans/generate` - AI生成行程
- `GET /api/plans/my` - 获取我的行程
- `GET /api/plans/:id` - 获取行程详情
- `PUT /api/plans/:id` - 更新行程
- `DELETE /api/plans/:id` - 删除行程

### 社区
- `GET /api/community/plans` - 获取公开行程列表
- `POST /api/community/plans/:id/like` - 点赞行程
- `POST /api/community/plans/:id/comment` - 评论行程
- `POST /api/community/plans/:id/copy` - 复制行程

### AI助手
- `POST /api/ai/chat` - AI对话
- `POST /api/ai/mimo-claw` - ClawBot对话（白名单限制）

### 其他
- `GET /api/weather/:city` - 获取天气
- `GET /api/exchange/rates` - 获取汇率

## ClawBot白名单

ClawBot功能有白名单限制，只有指定用户可以使用。

白名单配置文件：`server/src/config/clawWhitelist.js`

详见：[ClawBot白名单配置说明](./claw-whitelist-config.md)

## 部署

### Docker部署

```bash
cd docker
docker-compose up -d
```

### 手动部署

详见：[部署说明](./deploy-README.md)

## 多平台客户端

### 桌面端
- **Windows**: 支持x64和ARM64
- **macOS**: 支持Intel和Apple Silicon
- **Linux**: 支持x64和ARM64

详见：
- [PyQt桌面版](./desktop-pyqt-README.md)
- [Linux桌面版](./desktop-linux-README.md)
- [桌面端开发笔记](./desktop-development-notes.md)

### 微信小程序
详见：[小程序版](./miniprogram-README.md)

## 开发者

- 汪海岩

## 许可证

Apache License 2.0 (Apache-2.0)
