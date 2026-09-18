import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 用法: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=你的密码 node create-admin.mjs
const email = process.env.ADMIN_EMAIL || 'admin@travel.com';
const password = process.env.ADMIN_PASSWORD;

if (!password) {
  console.error('请先设置管理员密码,例如: ADMIN_PASSWORD=你的密码 node create-admin.mjs');
  process.exit(1);
}

async function main() {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username: 'admin',
      email,
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('管理员创建成功:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
