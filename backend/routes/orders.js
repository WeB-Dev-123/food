// backend/routes/orders.js
const express = require('express');

module.exports = (prisma) => {
  const router = express.Router();

  // POST /orders
  router.post('/', async (req, res) => {
    try {
      const { lines, total } = req.body || {};
      if (!Array.isArray(lines) || !lines.length) {
        return res.status(400).json({ error: 'lines required' });
      }

      const ids = lines.map(l => String(l.id));
      const items = await prisma.menuItem.findMany({
        where: { OR: [{ code: { in: ids } }, { id: { in: ids } }] },
      });

      const missing = lines.filter(l => !items.find(i => i.code === l.id || i.id === l.id));
      if (missing.length) return res.status(400).json({ error: 'unknown items', missing });

      const orderId = Math.random().toString(36).slice(2, 8).toUpperCase();

      const created = await prisma.order.create({
        data: {
          orderId,
          total: Number(total) || 0,
          status: 'NEW',
          lines: {
            create: lines.map(l => {
              const item = items.find(i => i.code === l.id || i.id === l.id);
              return { qty: l.qty, item: { connect: { id: item.id } } };
            }),
          },
        },
      });

      res.json({ orderId: created.orderId });
    } catch (e) {
      console.error('[POST /orders] ERROR', e);
      res.status(500).json({ error: 'order failed' });
    }
  });

  // GET /orders
  router.get('/', async (_req, res) => {
    try {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { lines: true },
      });
      res.json(orders);
    } catch (e) {
      console.error('[GET /orders] ERROR', e);
      res.status(500).json({ error: 'orders failed' });
    }
  });

  // GET /orders/:id
  router.get('/:id', async (req, res) => {
    try {
      const o = await prisma.order.findUnique({
        where: { orderId: req.params.id },
        include: { lines: { include: { item: true } } },
      });
      if (!o) return res.sendStatus(404);
      res.json(o);
    } catch (e) {
      console.error('[GET /orders/:id] ERROR', e);
      res.status(500).json({ error: 'order lookup failed' });
    }
  });

  // PATCH /orders/:id
  router.patch('/:id', async (req, res) => {
    try {
      const allowed = ['NEW', 'ACCEPTED', 'REJECTED', 'READY', 'COMPLETED'];
      const { status } = req.body || {};
      if (!allowed.includes(status)) return res.status(400).json({ error: 'bad status', allowed });

      const updated = await prisma.order.update({
        where: { orderId: req.params.id },
        data: { status },
      }).catch(() => null);

      if (!updated) return res.sendStatus(404);
      res.json(updated);
    } catch (e) {
      console.error('[PATCH /orders/:id] ERROR', e);
      res.status(500).json({ error: 'order update failed' });
    }
  });

  return router;
};
