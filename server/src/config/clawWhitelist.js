// ClawBot 白名单配置
// 只有白名单中的用户才能使用 ClawBot 功能

// 白名单用户列表（邮箱）
const WHITELIST_USERS = [
  // 示例:请替换为你的用户邮箱
  'admin@example.com',
  'user@example.com',
];

// 是否启用白名单（true=启用，false=禁用白名单，所有人可用）
const ENABLE_WHITELIST = true;

// 检查用户是否有权限使用 ClawBot
export const checkClawPermission = (user) => {
  // 如果未启用白名单，所有人可用
  if (!ENABLE_WHITELIST) {
    return true;
  }

  // 如果用户未登录，无权限
  if (!user) {
    return false;
  }

  // admin 角色自动拥有权限
  if (user.role === 'admin') {
    return true;
  }

  // 检查邮箱是否在白名单中
  if (WHITELIST_USERS.includes(user.email)) {
    return true;
  }

  return false;
};

export { ENABLE_WHITELIST, WHITELIST_USERS };
