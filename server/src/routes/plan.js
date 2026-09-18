import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { generateTravelPlan } from '../services/aiService.js';
import { geocodeLocations } from '../services/mapService.js';
import { getWeather } from '../services/weatherService.js';
import { z } from 'zod';
import prisma from '../db.js';

const router = Router();

const generateSchema = z.object({
  destination: z.string().min(1),
  days: z.number().int().min(1).max(30),
  budget: z.number().int().min(100),
  preferences: z.array(z.string()).min(1),
  requirements: z.string().optional(),
  travelDate: z.string(), // 出行日期必填
  isPublic: z.boolean().optional().default(false) // 是否公开，默认私密
});

// 生成行程（需要登录）
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const data = generateSchema.parse(req.body);

    // 获取天气预报信息（如果出行日期在预报范围内）
    let weatherInfo = null;
    try {
      const weather = await getWeather(data.destination);
      if (weather && weather.forecast && weather.forecast.length > 0) {
        // 检查出行日期是否在天气预报范围内（通常4天）
        const travelDate = data.travelDate;
        const forecastForDate = weather.forecast.find(f => f.date === travelDate);
        
        if (forecastForDate) {
          weatherInfo = {
            date: travelDate,
            weather: forecastForDate.dayweather,
            dayTemp: forecastForDate.daytemp,
            nightTemp: forecastForDate.nighttemp,
            wind: forecastForDate.daywind,
            advice: weather.advice
          };
        } else if (weather.realtime) {
          // 如果日期不在预报范围内，使用实时天气作为参考
          weatherInfo = {
            currentWeather: weather.realtime.weather,
            currentTemp: weather.realtime.temperature,
            humidity: weather.realtime.humidity,
            advice: weather.advice
          };
        }
      }
    } catch (weatherError) {
      console.log('获取天气失败，继续生成行程:', weatherError.message);
    }

    // 调用AI生成行程（传入天气信息）
    const itinerary = await generateTravelPlan({
      ...data,
      weatherInfo
    });

    // 用高德API修正坐标
    const correctedItinerary = await geocodeLocations(itinerary, data.destination);

    // 保存到数据库
    const plan = await prisma.travelPlan.create({
      data: {
        userId: req.user.id,
        title: correctedItinerary.title || `${data.destination}${data.days}日游`,
        destination: data.destination,
        days: data.days,
        budget: data.budget,
        travelDate: new Date(data.travelDate),
        preferences: data.preferences,
        itinerary: correctedItinerary,
        isPublic: data.isPublic || false
      }
    });

    res.status(201).json({
      id: plan.id,
      ...correctedItinerary,
      planId: plan.id
    });
  } catch (error) {
    next(error);
  }
});

// 获取用户的行程列表
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const plans = await prisma.travelPlan.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        destination: true,
        days: true,
        budget: true,
        isPublic: true,
        viewCount: true,
        copyCount: true,
        createdAt: true,
        _count: { select: { likes: true } }
      }
    });

    res.json(plans);
  } catch (error) {
    next(error);
  }
});

// 获取行程详情
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const plan = await prisma.travelPlan.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, username: true, avatar: true, nickname: true } },
        _count: { select: { likes: true } }
      }
    });

    if (!plan) {
      return res.status(404).json({ error: '行程不存在' });
    }

    // 私密行程：非作者完全不可见
    if (!plan.isPublic) {
      if (!req.user || req.user.id !== plan.userId) {
        return res.status(403).json({ error: '该行程未公开，无法查看' });
      }
    }

    // 增加浏览次数
    await prisma.travelPlan.update({
      where: { id: plan.id },
      data: { viewCount: { increment: 1 } }
    });

    // 检查是否点赞
    let isLiked = false;
    if (req.user) {
      const like = await prisma.like.findUnique({
        where: { userId_planId: { userId: req.user.id, planId: plan.id } }
      });
      isLiked = !!like;
    }

    // 判断是否为作者
    const isOwner = req.user && req.user.id === plan.userId;
    
    // 公开行程：所有人可见完整信息
    // 私密行程：只有作者可见（已在上面判断）
    const { travelDate, ...planData } = plan;
    res.json({ 
      ...planData, 
      isLiked, 
      isOwner,
      // 出行日期只对作者显示
      travelDate: isOwner ? travelDate : null
    });
  } catch (error) {
    next(error);
  }
});

// 更新行程
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const plan = await prisma.travelPlan.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!plan || plan.userId !== req.user.id) {
      return res.status(404).json({ error: '行程不存在或无权修改' });
    }

    const updated = await prisma.travelPlan.update({
      where: { id: plan.id },
      data: {
        title: req.body.title,
        isPublic: req.body.isPublic,
        itinerary: req.body.itinerary
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// 删除行程
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const plan = await prisma.travelPlan.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!plan || plan.userId !== req.user.id) {
      return res.status(404).json({ error: '行程不存在或无权删除' });
    }

    await prisma.travelPlan.delete({ where: { id: plan.id } });
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

// 复制行程
router.post('/:id/copy', authenticate, async (req, res, next) => {
  try {
    const original = await prisma.travelPlan.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!original || (!original.isPublic && original.userId !== req.user.id)) {
      return res.status(404).json({ error: '行程不存在或无法复制' });
    }

    const copied = await prisma.travelPlan.create({
      data: {
        userId: req.user.id,
        title: `${original.title} (副本)`,
        destination: original.destination,
        days: original.days,
        budget: original.budget,
        preferences: original.preferences,
        itinerary: original.itinerary,
        isPublic: false
      }
    });

    await prisma.travelPlan.update({
      where: { id: original.id },
      data: { copyCount: { increment: 1 } }
    });

    res.status(201).json(copied);
  } catch (error) {
    next(error);
  }
});

export default router;
