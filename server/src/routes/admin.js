import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import prisma from '../db.js';

const router = Router();

// 管理员权限检查中间件
const adminOnly = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

// 获取统计数据
router.get('/stats', authenticate, adminOnly, async (req, res, next) => {
  try {
    const [totalUsers, totalPlans, publicPlans, totalAttractions] = await Promise.all([
      prisma.user.count(),
      prisma.travelPlan.count(),
      prisma.travelPlan.count({ where: { isPublic: true } }),
      prisma.attraction.count()
    ]);

    res.json({ totalUsers, totalPlans, publicPlans, totalAttractions });
  } catch (error) {
    next(error);
  }
});

// 获取所有用户
router.get('/users', authenticate, adminOnly, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { travelPlans: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// 删除用户
router.delete('/users/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === req.user.id) {
      return res.status(400).json({ error: '不能删除自己' });
    }
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

// 获取所有行程
router.get('/plans', authenticate, adminOnly, async (req, res, next) => {
  try {
    const plans = await prisma.travelPlan.findMany({
      include: {
        user: { select: { id: true, username: true } },
        _count: { select: { likes: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// 更新行程（管理员可修改任何行程）
router.put('/plans/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const plan = await prisma.travelPlan.update({
      where: { id: parseInt(req.params.id) },
      data: { isPublic: req.body.isPublic }
    });
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// 删除行程
router.delete('/plans/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    await prisma.travelPlan.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
