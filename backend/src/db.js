const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'file:' + path.join(__dirname, '..', 'dev.db') }
  }
});

module.exports = prisma;
