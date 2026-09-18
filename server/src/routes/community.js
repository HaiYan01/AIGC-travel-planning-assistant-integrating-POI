import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import prisma from '../db.js';

const router = Router();

// 获取社区公开行程列表
router.get('/plans', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, destination, sort = 'newest' } = req.query;

    const where = { isPublic: true };
    if (destination) where.destination = { contains: destination };

    let orderBy = { createdAt: 'desc' };
    if (sort === 'popular') orderBy = { viewCount: 'desc' };
    if (sort === 'mostLiked') orderBy = { likes: { _count: 'desc' } };

    const plans = await prisma.travelPlan.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy,
      select: {
        id: true,
        title: true,
        destination: true,
        days: true,
        budget: true,
        preferences: true,
        viewCount: true,
        copyCount: true,
        createdAt: true,
        user: { select: { id: true, username: true, avatar: true, nickname: true } },
        _count: { select: { likes: true } }
      }
    });

    const total = await prisma.travelPlan.count({ where });

    res.json({
      data: plans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// 点赞行程
router.post('/plans/:id/like', authenticate, async (req, res, next) => {
  try {
    const planId = parseInt(req.params.id);

    // 检查行程是否存在且公开
    const plan = await prisma.travelPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({ error: '行程不存在' });
    }

    if (!plan.isPublic) {
      return res.status(403).json({ error: '该行程未公开，无法点赞' });
    }

    const existing = await prisma.like.findUnique({
      where: { userId_planId: { userId: req.user.id, planId } }
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      res.json({ liked: false, message: '取消点赞' });
    } else {
      await prisma.like.create({
        data: { userId: req.user.id, planId }
      });
      res.json({ liked: true, message: '点赞成功' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
