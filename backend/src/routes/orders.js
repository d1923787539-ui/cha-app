const { Router } = require('express');
const prisma = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = Router();

function generateOrderNo() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return 'TEAT' + date + rand;
}

function generatePickupCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { storeId, items, remark, pickupTime } = req.body;
    if (!storeId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Store and items are required' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ error: 'Product ' + item.productId + ' not found' });

      const unitPrice = product.price;
      let addonPrice = 0;
      if (item.customizations) {
        const cust = typeof item.customizations === 'string'
          ? JSON.parse(item.customizations)
          : item.customizations;
        if (cust.toppingId) {
          const choice = await prisma.optionChoice.findUnique({ where: { id: cust.toppingId } });
          if (choice) addonPrice = choice.priceAdjust;
        }
      }
      const finalUnitPrice = unitPrice + addonPrice;
      const subtotal = finalUnitPrice * (item.quantity || 1);
      totalAmount += subtotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity || 1,
        unitPrice: finalUnitPrice,
        subtotal,
        customizations: item.customizations ? JSON.stringify(item.customizations) : null,
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        userId: req.userId,
        storeId,
        status: 'pending',
        totalAmount,
        discount: 0,
        finalAmount: totalAmount,
        remark,
        pickupTime: pickupTime ? new Date(pickupTime) : null,
        pickupCode: generatePickupCode(),
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    const pointsToAdd = Math.floor(totalAmount);
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        points: { increment: pointsToAdd },
        totalSpent: { increment: totalAmount },
      },
    });
    await prisma.pointsLog.create({
      data: {
        userId: req.userId,
        points: pointsToAdd,
        type: 'earn',
        reason: 'Order ' + totalAmount.toFixed(2),
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        store: { select: { name: true, address: true } },
        items: {
          include: { product: { select: { name: true, imageUrl: true } } },
        },
      },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        store: { select: { name: true, address: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel in current status' });
    }
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Cancel failed' });
  }
});

module.exports = router;
