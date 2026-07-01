const { Router } = require('express');
const prisma = require('../db');
const { authMiddleware, generateToken } = require('../middleware/auth');

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { phone, nickname } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(409).json({ error: 'Phone already registered' });
    }

    const user = await prisma.user.create({
      data: { phone, nickname: nickname || 'TeaFriend-' + phone.slice(-4) },
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, phone: user.phone, nickname: user.nickname, points: user.points, level: user.level },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'Phone not registered' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, phone: user.phone, nickname: user.nickname, points: user.points, level: user.level },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        _count: { select: { orders: true } },
        coupons: {
          where: { usedAt: null },
          include: { coupon: true },
        },
        pointsLog: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { coupons, pointsLog, ...userData } = user;
    res.json({ ...userData, coupons, pointsLog });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { nickname, gender, birthday } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { nickname, gender, birthday: birthday ? new Date(birthday) : undefined },
    });
    res.json({ id: user.id, phone: user.phone, nickname: user.nickname, gender: user.gender, birthday: user.birthday });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
