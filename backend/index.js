// backend/index.js
const { PrismaClient } = require('@prisma/client');
const createApp = require('./app');
require('dotenv').config();

const prisma = new PrismaClient();
const app = createApp(prisma);

const PORT = 3000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
