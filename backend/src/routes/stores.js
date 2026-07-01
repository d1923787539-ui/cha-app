const { Router } = require('express');
const prisma = require('../db');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { orders: true } },
      },
    });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
    });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

module.exports = router;
