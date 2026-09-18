import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';
import { chatWithAI, chatWithHistory, mimoClawChat } from '../services/aiService.js';
import { checkClawPermission } from '../config/clawWhitelist.js';
import { z } from 'zod';
import prisma from '../db.js';

const router = Router();

// AI 接口限流(挂载在路由内,不受外层路径前缀影响)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 20, // 每分钟最多 20 次 AI 请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI请求过于频繁，请稍后再试' }
});
router.use(aiLimiter);

const chatMessage = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000)
});

const chatSchema = z.object({
  messages: z.array(chatMessage).min(1).max(30),
  context: z.object({
    destination: z.string(),
    days: z.number()
  }).optional(),
  planId: z.number().optional(),
  plansHistory: z.array(z.any()).optional()
});

// 检查ClawBot权限
router.get('/claw/permission', authenticate, async (req, res, next) => {
  try {
    const hasPermission = checkClawPermission(req.user);
    res.json({ 
      hasPermission,
      message: hasPermission ? '您有权限使用ClawBot' : '您暂无权限使用ClawBot'
    });
  } catch (error) {
    next(error);
  }
});

// AI对话
router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const data = chatSchema.parse(req.body);
    
    // 如果有plansHistory，使用历史分析模式
    if (data.plansHistory && data.plansHistory.length > 0) {
      const response = await chatWithHistory(data.messages, data.plansHistory);
      return res.json({ message: response });
    }

    // 如果提供了planId，获取行程数据
    let planData = null;
    if (data.planId) {
      planData = await prisma.travelPlan.findFirst({
        where: {
          id: data.planId,
          userId: req.user.id
        }
      });
    }

    const response = await chatWithAI(data.messages, data.context, planData);
    res.json({ message: response });
  } catch (error) {
    next(error);
  }
});

// Mimo Claw 对话
router.post('/mimo-claw', authenticate, async (req, res, next) => {
  try {
    // 检查白名单权限
    if (!checkClawPermission(req.user)) {
      return res.status(403).json({ 
        error: '您暂无权限使用此功能，请联系管理员开通',
        code: 'CLAW_PERMISSION_DENIED'
      });
    }

    const data = z.object({
      messages: z.array(chatMessage).min(1).max(30),
      mode: z.enum(['chat', 'analyze']).optional().default('chat')
    }).parse(req.body);

    // 获取用户的行程历史
    const userPlans = await prisma.travelPlan.findMany({
      where: { userId: req.user.id },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const response = await mimoClawChat(data.messages, data.mode, userPlans);
    res.json({ message: response });
  } catch (error) {
    next(error);
  }
});

export default router;
