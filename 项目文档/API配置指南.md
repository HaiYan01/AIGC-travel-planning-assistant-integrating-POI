# API 配置指南

本项目所有第三方服务都通过**环境变量**配置。仓库中只提供 `*.env.example` 模板,真实密钥请写入对应的 `.env` 文件,**切勿提交到 Git**。

模板中的值统一用 `API_KEY` 占位,按下文申请到真实值后替换即可。

## 0. 快速对照表

| 变量 | 是否必填 | 用途 | 申请 / 获取方式 |
| --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | MySQL 连接串(含密码) | 自建 MySQL 或 Docker 容器 |
| `JWT_SECRET` | ✅ | 登录令牌签名密钥 | 本地生成:`openssl rand -hex 32` |
| `AI_API_KEY` / `AI_API_BASE_URL` / `AI_MODEL` | ✅(生成行程) | 大模型(OpenAI 兼容) | 智谱 / 小米 MiMo / OpenAI 等 |
| `BAIDU_APP_ID` / `BAIDU_SECRET_KEY` | ⭕ 可选 | ClawBot 百度 AI 问答 | 百度智能体平台 |
| `BAIDU_API_URL` | ⭕ 可选 | ClawBot 接口地址 | 默认已填,一般无需修改 |
| `AMAP_KEY` | ✅(POI/地图) | 高德 Web 服务 Key(地理编码 / POI 检索) | 高德开放平台 |
| `AMAP_SECURITY_CODE` | ✅ | 高德 JS API 安全密钥 | 高德开放平台 |
| `VITE_AMAP_KEY` | ✅(地图展示) | 高德 Web 端(JS API)Key | 高德开放平台 |
| `VITE_API_BASE_URL` | ✅ | 前端访问后端的地址 | 本地:`http://localhost:3001/api`;生产:`/api` |
| `DB_PASSWORD` | Docker 部署 | MySQL root 密码 | 自行设置 |
| `AI_API_KEY` / `JWT_SECRET` | Docker 部署 | 同服务端 | 同上 |

## 1. 配置文件放在哪

| 文件 | 从哪里复制 | 什么时候用 |
| --- | --- | --- |
| `server/.env` | `server/.env.example` | 后端运行(本地开发 / 服务器 / PM2) |
| `web/.env.development` | `web/.env.example` | 前端本地开发(Vite) |
| `web/.env.production` | `web/.env.example` | 前端生产构建;同源部署时 `VITE_API_BASE_URL=/api` |
| `docker/.env` | `docker/.env.example` | 使用 Docker Compose 部署时 |

## 2. 数据库(必填)

```ini
DATABASE_URL="mysql://root:你的密码@localhost:3306/travel_planner"
```

- 先在 MySQL 中创建数据库(名称任意,默认 `travel_planner`),Prisma 会自动建表:

```bash
cd server
npx prisma generate
npm run db:push        # 将 schema 同步到数据库
```

- 首次部署后创建管理员(密码通过环境变量传入,不要使用弱密码):

```bash
cd server
ADMIN_PASSWORD=你的管理员密码 node create-admin.mjs
```

## 3. JWT 签名密钥(必填)

```bash
openssl rand -hex 32
```

将输出填入 `JWT_SECRET`。修改后已签发的登录令牌会全部失效,需要重新登录。

## 4. AI 大模型(生成行程,必填)

后端使用 **OpenAI 兼容接口**,任选一家服务商即可,只需改三个变量:

```ini
AI_API_KEY="服务商给你的 API Key"
AI_API_BASE_URL="服务商接口地址"
AI_MODEL="模型名称"
```

常见组合:

| 服务商 | `AI_API_BASE_URL` | `AI_MODEL` | 申请地址 |
| --- | --- | --- | --- |
| 智谱 AI(GLM) | `https://open.bigmodel.cn/api/paas/v4` | `glm-4-flash` | https://open.bigmodel.cn → API Keys |
| 小米 MiMo | `https://api.xiaomi.com/v1` | `MiMo` | 以小米开放平台文档为准 |
| OpenAI | `https://api.openai.com/v1` | `gpt-3.5-turbo` | https://platform.openai.com |

> 提示:行程生成会要求模型输出严格 JSON,建议选择支持 JSON 输出、上下文较长的模型;`glm-4-flash` 免费额度即可跑通。

## 5. 百度 AI(ClawBot,可选)

ClawBot 使用百度智能体平台接口:

```ini
BAIDU_APP_ID="你的 AppID"
BAIDU_SECRET_KEY="你的 SecretKey"
BAIDU_API_URL="https://agentapi.baidu.com/assistant/getAnswer"
```

- AppID / SecretKey 在**百度智能体平台**创建应用后获取(入口以百度官方页面为准);
- 不填写时 ClawBot 功能不可用,其余功能不受影响;
- ClawBot 有独立白名单机制(默认仅管理员可用),配置方法见 [claw-whitelist-config.md](claw-whitelist-config.md)。

## 6. 高德开放平台(地图 / POI,必填)

到 [高德开放平台控制台](https://console.amap.com/dev/key/app) 创建应用并添加 Key,注意申请**两种类型**:

| 变量 | Key 类型 | 用途 | 放置位置 |
| --- | --- | --- | --- |
| `AMAP_KEY` | Web 服务 | 后端地理编码、POI 检索(修正景点坐标) | `server/.env` |
| `AMAP_SECURITY_CODE` | 配合 JS API 的安全密钥 | JS API 2.0 安全校验 | `server/.env` |
| `VITE_AMAP_KEY` | Web 端(JS API) | 前端地图展示 | `web/.env.development` / `.env.production` |

> 只申请一种会分别导致:行程生成后坐标不准(缺 `AMAP_KEY`),或地图空白 / 报 `INVALID_USER_SCODE`(缺安全密钥)。

## 7. 前端变量

```ini
# web/.env.development(本地开发)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_AMAP_KEY=你的高德 Web 端 Key

# web/.env.production(生产构建,与后端同域部署)
VITE_API_BASE_URL=/api
VITE_AMAP_KEY=你的高德 Web 端 Key
```

## 8. Docker 部署变量

```ini
# docker/.env
DB_PASSWORD=自行设置
JWT_SECRET=openssl rand -hex 32 的结果
AI_API_KEY=你的大模型 Key
AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_MODEL=glm-4-flash
```

然后 `cd docker && docker compose up -d`。

## 9. 配置是否生效?自测清单

1. 后端健康检查:`curl http://localhost:3001/api/health` 返回 `"database":"connected"`;
2. 天气接口:`curl "http://localhost:3001/api/weather/北京"` 返回天气 JSON(验证高德 `AMAP_KEY`);
3. 登录后生成一次行程:能出方案且地图上有标记(验证 `AI_*` 与 `AMAP_KEY` / `VITE_AMAP_KEY`);
4. ClawBot:白名单用户可对话;非白名单提示无权限(验证百度配置与白名单)。

## 10. 安全提醒

- `.env` 已被 `.gitignore` 忽略,**不要把真实密钥写进任何会被提交的文件 / 文档 / 截图**;
- 密钥一旦泄露(如误提交),请立即到对应平台**轮换 / 删除重建**;
- 生产环境请使用独立的强密码,并定期检查各平台用量异常。
