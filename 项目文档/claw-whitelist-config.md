# ClawBot 白名单配置说明

## 功能说明

ClawBot 是基于百度AI的智能旅行助手，支持联网搜索。由于该功能消耗较多API资源，启用了白名单限制。

## 白名单相关说明

ClawBot 功能的白名单在服务端配置文件 `server/src/config/clawWhitelist.js` 中配置，通过两个常量控制：

- `WHITELIST_USERS`：白名单用户邮箱列表（下面的邮箱仅为示例占位，请替换为你自己的账号）
- `ENABLE_WHITELIST`：是否启用白名单；设为 `false` 即**关闭白名单限制，所有登录用户都可使用**

仓库中默认示例：

- `admin` 角色的所有用户始终拥有权限
- `admin@example.com`（示例，请替换）
- `user@example.com`（示例，请替换）

## 权限检查机制

### 前端检查

用户点击 ClawBot 按钮或菜单时，前端会先调用权限检查API：

- **有权限**：正常进入 ClawBot 页面
- **无权限**：弹出错误提示 "您暂无权限使用ClawBot，请联系管理员开通"，无法进入

### 后端检查

- `GET /api/ai/claw/permission` - 检查当前用户是否有权限
- `POST /api/ai/mimo-claw` - 使用ClawBot时再次验证权限

## 配置文件

配置文件位置：`server/src/config/clawWhitelist.js`

```javascript
// 白名单用户列表（邮箱）——示例占位，请替换为你自己的账号
const WHITELIST_USERS = [
  'admin@example.com',
  'user@example.com',
];

// 是否启用白名单（设为 false 即关闭限制，所有登录用户可用）
const ENABLE_WHITELIST = true;
```

> 修改后需重启服务生效，详见下文「重启服务」。

## 修改白名单

### 方法一：禁用白名单（所有人可用）

编辑 `server/src/config/clawWhitelist.js`：

```javascript
const ENABLE_WHITELIST = false;
```

### 方法二：添加用户到白名单

编辑 `server/src/config/clawWhitelist.js`：

```javascript
const WHITELIST_USERS = [
  'admin@example.com',
  'user@example.com',
  'newuser@example.com',  // 添加新用户
];
```

### 方法三：只允许admin角色

删除所有白名单用户，只保留admin角色判断：

```javascript
const WHITELIST_USERS = [];
const ENABLE_WHITELIST = true;
// admin角色会自动拥有权限
```

## 重启服务

修改配置后必须重启服务才能生效：

### 本地开发

```bash
cd server
npm run dev
```

### 云服务器

```bash
pm2 restart travel-server
```

## 云服务器更新方法

### 方法一：SSH直接修改

```bash
# 连接服务器
ssh root@your-server-ip

# 编辑配置文件
nano /opt/travel-planner/server/src/config/clawWhitelist.js

# 修改配置

# 重启服务
pm2 restart travel-server
```

### 方法二：FileZilla上传

1. 修改本地文件 `server/src/config/clawWhitelist.js`
2. 使用FileZilla上传到服务器
3. SSH连接服务器，执行 `pm2 restart travel-server`

### 方法三：Git部署

```bash
# 本地修改并提交
git add server/src/config/clawWhitelist.js
git commit -m "update claw whitelist"
git push

# 服务器拉取
ssh root@your-server-ip
cd /opt/travel-planner
git pull
pm2 restart travel-server
```

## API响应

### 检查权限 API

**请求：**
```
GET /api/ai/claw/permission
Authorization: Bearer <token>
```

**响应（有权限）：**
```json
{
  "hasPermission": true,
  "message": "您有权限使用ClawBot"
}
```

**响应（无权限）：**
```json
{
  "hasPermission": false,
  "message": "您暂无权限使用ClawBot"
}
```

### 使用 ClawBot API

**无权限用户：**
```json
{
  "error": "您暂无权限使用此功能，请联系管理员开通",
  "code": "CLAW_PERMISSION_DENIED"
}
```

## 配置说明

| 配置项 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| `ENABLE_WHITELIST` | Boolean | 是否启用白名单 | `true` |
| `WHITELIST_USERS` | Array | 白名单用户邮箱列表 | 见上文 |
| admin角色 | - | 自动拥有权限，无需配置 | - |

## 用户体验

| 用户类型 | 点击ClawBot | 提示信息 |
|----------|-------------|----------|
| 白名单用户 | ✅ 正常进入 | 无 |
| admin角色 | ✅ 正常进入 | 无 |
| 其他用户 | ❌ 无法进入 | "您暂无权限使用ClawBot，请联系管理员开通" |
| 未登录用户 | ❌ 无法进入 | "请先登录后再使用此功能" |

## 注意事项

1. **修改后必须重启服务**才能生效
2. **admin角色始终拥有权限**，不受白名单限制
3. 生产环境建议**保持白名单开启**，避免API滥用
4. 白名单只检查邮箱，不区分大小写
5. 前端和后端都会进行权限检查，双重保护
