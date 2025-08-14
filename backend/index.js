// backend/index.js
require('dotenv').config();
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const createApp = require('./app');
const { Server } = require('socket.io');

const prisma = new PrismaClient();
const app = createApp(prisma);

// Lav HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || '*', methods: ['GET','POST','PATCH'] }
});

// gør io tilgængelig i routes
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('order:join', ({ orderId }) => {
    if (typeof orderId === 'string' && orderId) socket.join(`order:${orderId}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
