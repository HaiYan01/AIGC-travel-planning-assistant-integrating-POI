# 项目文档索引

AI旅行规划助手（多平台：Web / 微信小程序 / Windows·macOS·Linux 桌面端）的文档导航。

> 最后更新：2026-09

## 全局约定

| 项目 | 值 |
|------|-----|
| 后端端口 | 默认 `3000`（生产 nginx 反代 + PM2）；本地开发若改用 `3001`，需与 `web/vite.config.js` 的代理 `target` 保持一致 |
| 部署目录 | `/opt/travel-planner` |
| PM2 进程名 | `travel-server` |
| 管理员账号 | 不预置，首次部署后运行 `node server/create-admin.mjs` 自行创建（见 `server/create-admin.mjs`） |
| AI 服务 | OpenAI 兼容接口，可填智谱 GLM-4-Flash、小米 MiMo 等，详见 `server/.env.example` |
| 许可证 | Apache License 2.0 (Apache-2.0) |

文档中的 `<你的域名>`、`<服务器地址>`、`<你的邮箱>` 等均为占位符，使用前请替换为自己的真实值；密钥类内容请写入 `.env`，不要提交到 Git。

## 文档一览

| 文档 | 定位（一句话） |
|------|----------------|
| [DEVELOPMENT.md](./DEVELOPMENT.md) | 开发者主入口：项目简介、技术栈、目录结构、环境变量与本地启动步骤 |
| [API配置指南.md](./API配置指南.md) | 各第三方服务（数据库 / JWT / AI / 高德 / 百度 / 前端变量）的环境变量申请与填写说明 |
| [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md) | 完整技术架构：整体分层、前后端模块、数据库模型、关键流程与 Docker 部署 |
| [POI原理与实现.md](./POI原理与实现.md) | 景点 POI 搜索与坐标修正的原理讲解与代码级实现细节 |
| [deploy-README.md](./deploy-README.md) | 部署指南：云服务器环境安装、MySQL/Nginx 配置、PM2 启动与故障排查 |
| [BUILD.md](./BUILD.md) | 三个桌面端目录（desktop-windows / desktop-linux / desktop-mac）的打包命令与产物说明 |
| [desktop-pyqt-README.md](./desktop-pyqt-README.md) | 桌面端总览（PyQt6 WebView 方案）：运行方式、打包与快捷键、按平台拆分的目录对照 |
| [desktop-linux-README.md](./desktop-linux-README.md) | Linux 桌面端：发行版支持范围、依赖安装、打包与安装脚本、常见问题 |
| [desktop-development-notes.md](./desktop-development-notes.md) | 桌面端开发笔记：技术选型原因、外部链接处理方案与踩坑记录 |
| [miniprogram-README.md](./miniprogram-README.md) | 微信小程序：baseUrl 配置、request 合法域名设置、页面结构与功能对照 |
| [claw-whitelist-config.md](./claw-whitelist-config.md) | ClawBot 白名单机制：配置文件位置、`ENABLE_WHITELIST` 开关与权限检查流程 |

## 推荐阅读顺序

**使用者 / 快速体验**
1. [DEVELOPMENT.md](./DEVELOPMENT.md) —— 先把项目跑起来
2. [API配置指南.md](./API配置指南.md) —— 补全各服务密钥
3. [deploy-README.md](./deploy-README.md) —— 部署到服务器对外提供服务

**二次开发 / 贡献代码**
1. [DEVELOPMENT.md](./DEVELOPMENT.md) → 2. [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md) → 3. [POI原理与实现.md](./POI原理与实现.md)（涉及景点搜索与坐标修正时）→ 4. [claw-whitelist-config.md](./claw-whitelist-config.md)（涉及 AI 助手权限时）

**客户端开发**
1. [desktop-pyqt-README.md](./desktop-pyqt-README.md) + [desktop-development-notes.md](./desktop-development-notes.md) → [BUILD.md](./BUILD.md)（打包）
2. [desktop-linux-README.md](./desktop-linux-README.md)（Linux 专项）
3. [miniprogram-README.md](./miniprogram-README.md)（小程序）

**技术细节回查**

涉及架构与实现细节时,回查 [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md) 与 [POI原理与实现.md](./POI原理与实现.md)。
