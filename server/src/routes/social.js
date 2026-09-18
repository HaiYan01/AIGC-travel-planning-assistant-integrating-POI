import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../db.js';

const router = Router();

// 关注用户
router.post('/follow/:userId', authenticate, async (req, res, next) => {
  try {
    const followingId = parseInt(req.params.userId);
    
    if (followingId === req.user.id) {
      return res.status(400).json({ error: '不能关注自己' });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId
        }
      }
    });

    if (existing) {
      // 取消关注
      await prisma.follow.delete({ where: { id: existing.id } });
      res.json({ followed: false, message: '取消关注' });
    } else {
      // 关注
      await prisma.follow.create({
        data: {
          followerId: req.user.id,
          followingId
        }
      });
      res.json({ followed: true, message: '关注成功' });
    }
  } catch (error) {
    next(error);
  }
});

// 获取用户的关注列表
router.get('/following/:userId', async (req, res, next) => {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: parseInt(req.params.userId) },
      include: {
        following: {
          select: { id: true, username: true, nickname: true, avatar: true, bio: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(following.map(f => f.following));
  } catch (error) {
    next(error);
  }
});

// 获取用户的粉丝列表
router.get('/followers/:userId', async (req, res, next) => {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: parseInt(req.params.userId) },
      include: {
        follower: {
          select: { id: true, username: true, nickname: true, avatar: true, bio: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(followers.map(f => f.follower));
  } catch (error) {
    next(error);
  }
});

// 检查是否关注
router.get('/check/:userId', authenticate, async (req, res, next) => {
  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: parseInt(req.params.userId)
        }
      }
    });

    res.json({ isFollowing: !!follow });
  } catch (error) {
    next(error);
  }
});

// 获取聊天列表（有消息往来的用户）
router.get('/chats', authenticate, async (req, res, next) => {
  try {
    // 获取最近的消息
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        sender: { select: { id: true, username: true, nickname: true, avatar: true } },
        receiver: { select: { id: true, username: true, nickname: true, avatar: true } }
      }
    });

    // 去重，只保留每个用户最近的一条消息
    const chatMap = new Map();
    for (const msg of messages) {
      const otherUser = msg.senderId === req.user.id ? msg.receiver : msg.sender;
      if (!chatMap.has(otherUser.id)) {
        chatMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg.content,
          lastTime: msg.createdAt,
          isRead: msg.isRead || msg.senderId === req.user.id
        });
      }
    }

    res.json(Array.from(chatMap.values()));
  } catch (error) {
    next(error);
  }
});

// 获取与某用户的聊天记录
router.get('/messages/:userId', authenticate, async (req, res, next) => {
  try {
    const otherId = parseInt(req.params.userId);
    
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: otherId },
          { senderId: otherId, receiverId: req.user.id }
        ]
      },
      orderBy: { createdAt: 'asc' },
      take: 100
    });

    // 标记对方发的消息为已读
    await prisma.message.updateMany({
      where: {
        senderId: otherId,
        receiverId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// 发送消息
router.post('/messages/:userId', authenticate, async (req, res, next) => {
  try {
    const { content } = req.body;
    const receiverId = parseInt(req.params.userId);

    if (!content?.trim()) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({ error: '不能给自己发消息' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId,
        content: content.trim()
      },
      include: {
        sender: { select: { id: true, username: true, nickname: true, avatar: true } }
      }
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

// 获取未读消息数
router.get('/unread', authenticate, async (req, res, next) => {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

export default router;
