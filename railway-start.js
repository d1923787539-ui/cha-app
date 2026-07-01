const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
process.chdir(backendDir);

console.log('========================================');
console.log('[Railway] Setting up database...');
console.log('========================================');

// 1. Generate Prisma client
console.log('[Railway] Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

// 2. Push schema
console.log('[Railway] Pushing database schema...');
execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

// 3. Check if data exists, seed if empty
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      console.log('[Railway] Seeding initial data...');
      execSync('node prisma/seed.js', { stdio: 'inherit', cwd: backendDir });
    } else {
      console.log('[Railway] Database already has data, skipping seed.');
    }
  } catch (err) {
    console.error('[Railway] Seed check failed:', err.message);
  } finally {
    await prisma['$disconnect']();
  }

  // 4. Start server
  console.log('========================================');
  console.log('[Railway] Starting server...');
  console.log('========================================');
  require('./src/index.js');
})();
