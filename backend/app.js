const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

module.exports = (prisma) => {
  const app = express();

  // Sikkerhed + rate limiting
  app.use(helmet());
  const limiter = rateLimit({ windowMs: 60_000, max: 60 }); // 60/min på /orders
  app.use('/orders', limiter);

  // CORS og adminKey
  app.use(require('./middleware/cors')(process.env.CORS_ORIGIN || '*'));

  app.use(express.json());
  app.use(morgan('dev'));

  // Health check route
  app.get('/health', (_req, res) => res.json({ ok: true, time: Date.now() }));

  // API routes
  app.use('/menu', require('./routes/menu')(prisma));
  app.use('/orders', require('./routes/orders')(prisma));

  // Statiske filer
  app.use(express.static(__dirname));

  // Global error handler
  app.use((err, _req, res, _next) => {
    console.error('[UNHANDLED]', err);
    res.status(500).json({ error: 'internal' });
  });

  return app;
};
