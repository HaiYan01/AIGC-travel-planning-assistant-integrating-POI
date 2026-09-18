import { Router } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import prisma from '../db.js';
import bcrypt from 'bcryptjs';

const router = Router();

// 登录/注册防暴力破解(挂载在路由内,不受外层路径前缀影响)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 20, // 每 IP 每 15 分钟最多 20 次登录+注册尝试
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '尝试过于频繁，请15分钟后再试' }
});

// 注册验证 - 限制输入长度
const registerSchema = z.object({
  username: z.string().min(2).max(20),
  email: z.string().email().max(100),
  password: z.string().min(6).max(50)
});

// 登录验证
const loginSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().max(50)
});

// 注册
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] }
    });

    if (existing) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword
      },
      select: { id: true, username: true, email: true, avatar: true, role: true }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

// 登录
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const valid = await bcrypt.compare(data.password, user.password);

    if (!valid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, role: user.role },
      token
    });
  } catch (error) {
    next(error);
  }
});

// 获取当前用户信息
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: '未登录' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        nickname: true,
        role: true,
        createdAt: true,
        _count: { select: { travelPlans: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
