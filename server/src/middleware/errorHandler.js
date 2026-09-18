import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // 响应已发出(如超时已回 408),无法再返回错误响应
  if (res.headersSent) {
    return next(err);
  }

  // Zod 验证错误
  if (err.name === 'ZodError') {
    return res.status(400).json({ 
      error: '数据验证失败',
      details: err.errors?.map(e => e.message).join(', ')
    });
  }

  // Prisma 错误
  if (err.code?.startsWith('P')) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: '数据已存在' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: '资源不存在' });
    }
    return res.status(400).json({ error: '数据库操作失败' });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: '无效的访问令牌' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: '数据验证失败' });
  }

  // 未授权错误
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: '未授权访问' });
  }

  // 生产环境不暴露详细错误信息
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(err.status || 500).json({
    error: isProduction ? '服务器内部错误' : (err.message || '服务器内部错误'),
    ...(isProduction ? {} : { stack: err.stack })
  });
};
