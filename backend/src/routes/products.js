const { Router } = require('express');
const prisma = require('../db');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { categoryId, search, storeId } = req.query;
    const where = { status: 'active' };
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search };

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ salesCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { name: true } },
        productOptions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            choices: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    if (storeId) {
      const storeProducts = await prisma.storeProduct.findMany({
        where: { storeId, productId: { in: products.map(p => p.id) } },
      });
      const spMap = Object.fromEntries(storeProducts.map(sp => [sp.productId, sp]));
      products.forEach(p => {
        const sp = spMap[p.id];
        if (sp) {
          p.storePrice = sp.price;
          p.inStock = sp.inStock;
        }
      });
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: { select: { name: true } },
        productOptions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            choices: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
