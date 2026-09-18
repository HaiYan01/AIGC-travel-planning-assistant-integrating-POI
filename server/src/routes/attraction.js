import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// 搜索景点
router.get('/search', async (req, res, next) => {
  try {
    const { city, category, keyword, page = 1, limit = 20 } = req.query;

    const where = {};
    if (city) where.city = { contains: city };
    if (category) where.category = category;
    if (keyword) where.name = { contains: keyword };

    const attractions = await prisma.attraction.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { rating: 'desc' }
    });

    const total = await prisma.attraction.count({ where });

    res.json({
      data: attractions,
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

// 获取景点详情
router.get('/:id', async (req, res, next) => {
  try {
    const attraction = await prisma.attraction.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!attraction) {
      return res.status(404).json({ error: '景点不存在' });
    }

    res.json(attraction);
  } catch (error) {
    next(error);
  }
});

// 按城市获取景点（用于地图展示）
router.get('/city/:cityName', async (req, res, next) => {
  try {
    const attractions = await prisma.attraction.findMany({
      where: { city: { contains: req.params.cityName } },
      select: {
        id: true,
        name: true,
        category: true,
        longitude: true,
        latitude: true,
        rating: true,
        address: true
      }
    });

    res.json(attractions);
  } catch (error) {
    next(error);
  }
});

export default router;
