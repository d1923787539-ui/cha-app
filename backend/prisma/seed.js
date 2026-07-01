const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 清空旧数据
  await prisma.pointsLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.userCoupon.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.optionChoice.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.storeProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // 门店
  const store = await prisma.store.create({
    data: {
      name: '喜茶·灵感店',
      address: '上海市静安区南京西路1515号',
      latitude: 31.2304,
      longitude: 121.4737,
      phone: '021-62888888',
      openTime: '10:00',
      closeTime: '22:00',
    },
  });

  // 分类
  const categories = await Promise.all([
    prisma.category.create({ data: { name: '人气推荐', sortOrder: 0 } }),
    prisma.category.create({ data: { name: '经典奶茶', sortOrder: 1 } }),
    prisma.category.create({ data: { name: '鲜果茶', sortOrder: 2 } }),
    prisma.category.create({ data: { name: '纯茶', sortOrder: 3 } }),
    prisma.category.create({ data: { name: '咖啡系列', sortOrder: 4 } }),
  ]);

  // 商品定义：名称, 价格, 分类索引, 描述
  const productDefs = [
    ['芝芝莓莓', 32, 0, '草莓与芝士奶盖的经典搭配'],
    ['多肉葡萄', 29, 0, '手剥葡萄肉搭配绿妍茶底'],
    ['烤黑糖波波牛乳', 28, 1, '黑糖挂壁搭配鲜牛乳'],
    ['芋泥波波牛乳', 26, 1, '手捣芋泥搭配波波与鲜奶'],
    ['满杯红柚', 25, 2, '红柚果肉搭配茉莉花茶'],
    ['超燃杨梅', 27, 2, '当季杨梅搭配绿妍'],
    ['绿妍', 15, 3, '茉莉花绿茶，清新回甘'],
    ['纯牛乳茶', 19, 3, '简单纯粹的一杯好茶'],
    ['芝芝美式', 22, 4, '芝士奶盖与美式咖啡的碰撞'],
    ['椰椰拿铁', 25, 4, '椰乳搭配浓缩咖啡'],
  ];

  const products = await Promise.all(
    productDefs.map(([name, price, catIdx, description], i) =>
      prisma.product.create({
        data: {
          name,
          price,
          description,
          categoryId: categories[catIdx].id,
          isNew: i < 3,
          salesCount: Math.floor(Math.random() * 5000) + 500,
        },
      })
    )
  );

  // 商品选项：糖度、冰量、加料
  const sugarOpt = await prisma.productOption.create({
    data: {
      productId: products[0].id,
      type: 'sugar',
      name: '糖度',
      sortOrder: 0,
      choices: {
        create: [
          { label: '全糖', priceAdjust: 0, sortOrder: 0, isDefault: false },
          { label: '少糖', priceAdjust: 0, sortOrder: 1, isDefault: true },
          { label: '半糖', priceAdjust: 0, sortOrder: 2 },
          { label: '微糖', priceAdjust: 0, sortOrder: 3 },
          { label: '不另外加糖', priceAdjust: 0, sortOrder: 4 },
        ],
      },
    },
  });

  const iceOpt = await prisma.productOption.create({
    data: {
      productId: products[0].id,
      type: 'ice',
      name: '冰量',
      sortOrder: 1,
      choices: {
        create: [
          { label: '正常冰', priceAdjust: 0, sortOrder: 0, isDefault: true },
          { label: '少冰', priceAdjust: 0, sortOrder: 1 },
          { label: '去冰', priceAdjust: 0, sortOrder: 2 },
          { label: '温', priceAdjust: 0, sortOrder: 3 },
          { label: '热', priceAdjust: 0, sortOrder: 4 },
        ],
      },
    },
  });

  const toppingOpt = await prisma.productOption.create({
    data: {
      productId: products[0].id,
      type: 'topping',
      name: '加料',
      sortOrder: 2,
      choices: {
        create: [
          { label: '波波', priceAdjust: 2, sortOrder: 0 },
          { label: '椰果', priceAdjust: 2, sortOrder: 1 },
          { label: '芋泥', priceAdjust: 3, sortOrder: 2 },
          { label: '芝士奶盖', priceAdjust: 4, sortOrder: 3 },
          { label: '脆波波', priceAdjust: 2, sortOrder: 4 },
          { label: '不加料', priceAdjust: 0, sortOrder: 5, isDefault: true },
        ],
      },
    },
  });

  // 为所有商品添加相同的选项模板（简化：实际应该按商品设置）
  for (let i = 1; i < products.length; i++) {
    await prisma.productOption.create({
      data: {
        productId: products[i].id,
        type: 'sugar',
        name: '糖度',
        sortOrder: 0,
        choices: {
          create: [
            { label: '全糖', sortOrder: 0 },
            { label: '少糖', sortOrder: 1, isDefault: true },
            { label: '半糖', sortOrder: 2 },
            { label: '微糖', sortOrder: 3 },
            { label: '不另外加糖', sortOrder: 4 },
          ],
        },
      },
    });
    await prisma.productOption.create({
      data: {
        productId: products[i].id,
        type: 'ice',
        name: '冰量',
        sortOrder: 1,
        choices: {
          create: [
            { label: '正常冰', sortOrder: 0, isDefault: true },
            { label: '少冰', sortOrder: 1 },
            { label: '去冰', sortOrder: 2 },
            { label: '温', sortOrder: 3 },
            { label: '热', sortOrder: 4 },
          ],
        },
      },
    });
    await prisma.productOption.create({
      data: {
        productId: products[i].id,
        type: 'topping',
        name: '加料',
        sortOrder: 2,
        choices: {
          create: [
            { label: '波波', priceAdjust: 2, sortOrder: 0 },
            { label: '椰果', priceAdjust: 2, sortOrder: 1 },
            { label: '芋泥', priceAdjust: 3, sortOrder: 2 },
            { label: '芝士奶盖', priceAdjust: 4, sortOrder: 3 },
            { label: '脆波波', priceAdjust: 2, sortOrder: 4 },
            { label: '不加料', sortOrder: 5, isDefault: true },
          ],
        },
      },
    });
  }

  // 门店-商品关联
  for (const product of products) {
    await prisma.storeProduct.create({
      data: { storeId: store.id, productId: product.id, inStock: true },
    });
  }

  // 优惠券
  await prisma.coupon.createMany({
    data: [
      { name: '新人立减券', type: 'cash', value: 5, minSpend: 0, validFrom: new Date(), validTo: new Date('2026-12-31') },
      { name: '满减券', type: 'cash', value: 10, minSpend: 30, validFrom: new Date(), validTo: new Date('2026-12-31') },
      { name: '九折券', type: 'discount', value: 0.9, minSpend: 20, validFrom: new Date(), validTo: new Date('2026-12-31') },
    ],
  });

  console.log('Seed data created successfully!');
  console.log(`  ${categories.length} categories`);
  console.log(`  ${products.length} products`);
  console.log(`  1 store`);
  console.log(`  3 coupons`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
