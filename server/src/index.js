import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import prisma from './db.js';
import authRoutes from './routes/auth.js';
import planRoutes from './routes/plan.js';
import attractionRoutes from './routes/attraction.js';
import aiRoutes from './routes/ai.js';
import communityRoutes from './routes/community.js';
import adminRoutes from './routes/admin.js';
import weatherRoutes from './routes/weather.js';
import socialRoutes from './routes/social.js';
import exchangeRoutes from './routes/exchange.js';

const app = express();
// 位于 nginx 反代之后:信任最近一跳代理,rate-limit 才能正确识别客户端 IP,并避免 XFF 校验报错
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting - 通用限制(全局生效,不依赖 /api 前缀)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100,
  message: { error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// AI / 登录的专用限流定义在对应路由内(routes/ai.js、routes/auth.js),
// 避免受外层路径前缀影响导致限流不生效。

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 请求总时长控制(AI 接口放宽到 3 分钟,其余 30 秒)
app.use((req, res, next) => {
  const isAi = req.path.startsWith('/api/ai') || req.path.includes('/generate');
  const timeoutMs = isAi ? 180000 : 30000;
  const timer = setTimeout(() => {
    // 业务可能仍在后台执行,但响应未发出时才允许补 408,避免与正常完成竞态
    if (!res.headersSent) {
      res.status(408).json({ error: '请求超时，请重试' });
    }
  }, timeoutMs);
  res.on('finish', () => clearTimeout(timer));
  next();
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/exchange', exchangeRoutes);

// Enhanced health check
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };

  // 检查数据库连接
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (error) {
    health.status = 'degraded';
    health.database = 'disconnected';
    health.databaseError = error.message;
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  // 停止接受新连接
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // 关闭数据库连接
    try {
      await prisma.$disconnect();
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting database:', error);
    }
    
    process.exit(0);
  });

  // 强制关闭超时（10秒）
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

// 监听退出信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
