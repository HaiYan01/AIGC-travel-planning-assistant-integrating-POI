# 微信小程序 - AI旅行规划助手

基于微信小程序的AI旅行规划助手，功能与Web版本同步。

## 功能特性

- 🎯 AI智能行程生成
- 🗺️ 地图可视化（高德地图）
- ☁️ 天气查询与预报
- 🚄 交通查询（12306、携程）
- 🎫 景点门票预订
- 💱 汇率转换
- 👥 攻略社区
- 🤖 AI助手
- 🔒 隐私保护

## 使用说明

### 1. 配置服务器地址

打开 `app.js`，修改 `baseUrl` 为你的服务器地址：

```javascript
globalData: {
  baseUrl: 'https://yourdomain.com/api'
}
```

### 2. 添加TabBar图标

在 `images` 目录下添加以下图标文件（建议81x81px PNG）：

| 文件名 | 说明 |
|--------|------|
| `home.png` | 首页图标 |
| `home-active.png` | 首页选中图标 |
| `community.png` | 社区图标 |
| `community-active.png` | 社区选中图标 |
| `chat.png` | AI助手图标 |
| `chat-active.png` | AI助手选中图标 |
| `my.png` | 我的图标 |
| `my-active.png` | 我的选中图标 |

### 3. 导入项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 项目目录选择 `miniprogram` 文件夹
4. 填入你的小程序 AppID
5. 点击「导入」

### 4. 配置合法域名

在微信公众平台配置服务器域名：

- request合法域名：你的API服务器地址（如 `https://yourdomain.com`）

## 页面说明

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | pages/index/index | 功能入口、热门目的地 |
| 生成行程 | pages/generate/generate | AI生成行程表单 |
| 行程详情 | pages/plan/plan | 查看行程、地图导航 |
| 社区 | pages/community/community | 浏览公开行程 |
| AI助手 | pages/chat/chat | 智能问答 |
| 我的 | pages/my/my | 个人中心、我的行程 |
| 登录 | pages/login/login | 登录/注册 |

## 功能说明

### 行程生成

- 输入目的地
- 选择出行日期（必填）
- 选择旅行天数
- 设置预算
- 选择偏好（美食、历史、自然等）
- AI自动生成详细行程

### 行程详情

- 查看每日行程安排
- 地图可视化展示
- 点击景点可导航
- 门票预订链接
- 交通查询链接

### 社区

- 浏览公开行程
- 点赞、评论
- 复制行程

### AI助手

- 智能问答
- 行程分析
- 个性化推荐

## 目录结构

```
miniprogram/
├── app.js                 # 应用入口
├── app.json               # 应用配置
├── app.wxss               # 全局样式
├── pages/                 # 页面目录
│   ├── index/             # 首页
│   ├── generate/          # 生成行程
│   ├── plan/              # 行程详情
│   ├── community/         # 社区
│   ├── chat/              # AI助手
│   ├── my/                # 我的
│   └── login/             # 登录
├── components/            # 组件
├── services/              # API服务
├── utils/                 # 工具函数
├── images/                # 图标
└── i18n/                  # 国际化
```

## 与Web版差异

| 功能 | Web | 小程序 |
|------|-----|--------|
| 行程生成 | ✅ | ✅ |
| 地图可视化 | ✅ 高德JS API | ✅ 小程序地图组件 |
| 天气查询 | ✅ | ✅ |
| 交通查询 | ✅ 浏览器跳转 | ✅ 复制链接 |
| 门票预订 | ✅ 浏览器跳转 | ✅ 复制链接 |
| ClawBot | ✅ | ❌ |
| 汇率转换 | ✅ | ✅ |

## 许可证

MIT License
