// backend/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

module.exports = (prisma) => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  console.log('[APP] Mounting routes...');
  const menuRouter = require('./routes/menu')(prisma);
  const ordersRouterFactory = require('./routes/orders');
  const ordersRouter = ordersRouterFactory(prisma);

  console.log('[APP] Routers:',
    'menuRouter=', typeof menuRouter,
    'ordersRouterFactory=', typeof ordersRouterFactory,
    'ordersRouter=', typeof ordersRouter,
    'hasPOST=', !!(ordersRouter && ordersRouter.stack && ordersRouter.stack.find(l => l.route && l.route.methods.post))
  );

  app.use('/menu', menuRouter);
  app.use('/orders', ordersRouter);

  app.get('/__whoami', (_req, res) => res.json({ ok: true, from: 'app.js', ts: Date.now() }));

  app.use(express.static(__dirname));
  return app;
};
