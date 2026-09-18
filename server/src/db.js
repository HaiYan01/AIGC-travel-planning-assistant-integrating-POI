import { PrismaClient } from '@prisma/client';

// PrismaClient 单例模式，避免多次实例化
const globalForPrisma = globalThis;

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // 开发环境使用全局变量避免热重载时创建多个实例
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
