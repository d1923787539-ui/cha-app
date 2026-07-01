const { Router } = require('express');
const prisma = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = Router();

// 获取所有订单（含用户信息、商品详情）
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: {
          user: { select: { id: true, phone: true, nickname: true } },
          store: { select: { id: true, name: true } },
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 更新订单状态
router.put('/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'making', 'completed', 'picked_up', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// 获取概览数据（订单总数、今日订单、各状态数量）
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalOrders, todayOrders, pendingOrders, makingOrders, completedOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'making' } }),
      prisma.order.count({ where: { status: 'completed' } }),
    ]);

    // 计算今日营收
    const todayRevenue = await prisma.order.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow }, status: { not: 'cancelled' } },
      _sum: { finalAmount: true },
    });

    res.json({
      totalOrders,
      todayOrders,
      pendingOrders,
      makingOrders,
      completedOrders,
      todayRevenue: todayRevenue._sum.finalAmount || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
