import jwt from 'jsonwebtoken';
import prisma from '../db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '请先登录' });
    }

    const token = authHeader.substring(7);
    
    if (!token || token.length < 10) {
      return res.status(401).json({ error: '无效的访问令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, avatar: true, nickname: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '登录已过期，请重新登录' });
    }
    return res.status(401).json({ error: '无效的访问令牌' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token && token.length >= 10) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, username: true, email: true, avatar: true, nickname: true, role: true }
        });
      }
    }
  } catch (error) {
    // 静默失败，不阻止请求
  }
  next();
};

// 管理员权限中间件
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};
