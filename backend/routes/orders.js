// backend/routes/orders.js
const express = require('express');
const { z } = require('zod');
const adminKey = require('../middleware/adminKey')(process.env.ADMIN_KEY || 'dev_super_secret');


const OrderSchema = z.object({
  lines: z.array(z.object({
    id: z.string().min(1),   // kan være code ELLER item.id
    qty: z.number().int().positive(),
  })).min(1),
  total: z.number().int().nonnegative(),
});

module.exports = (prisma) => {
  const router = express.Router();

  // Hjælp: find restaurant (via ?r eller ?restaurantId, ellers første)
  async function resolveRestaurant(req) {
    const r = String(req.query.r || req.query.restaurantId || '');
    if (r) {
      const found = await prisma.restaurant.findUnique({ where: { id: r } });
      if (found) return found;
    }
    return prisma.restaurant.findFirst();
  }

  // POST /orders — opret ordre for den givne restaurant
  router.post('/', async (req, res, next) => {
    console.log('[POST /orders] body =', JSON.stringify(req.body));
    try {
      const parsed = OrderSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log(parsed, "virker ikke!")
        return res.status(400).json({ error: 'invalid', issues: parsed.error.issues });
      }
      const { lines, total } = parsed.data;

      const restaurant = await resolveRestaurant(req);
      if (!restaurant) return res.status(500).json({ error: 'no restaurant found' });

      // slå varer op KUN inden for samme restaurant
      const ids = lines.map(l => String(l.id));
      const items = await prisma.menuItem.findMany({
        where: {
          restaurantId: restaurant.id,
          OR: [{ code: { in: ids } }, { id: { in: ids } }],
        },
      });

      const missing = lines.filter(l => !items.find(i => i.code === l.id || i.id === l.id));
      if (missing.length) return res.status(400).json({ error: 'unknown items', missing });

      const orderId = Math.random().toString(36).slice(2, 8).toUpperCase();

      const created = await prisma.order.create({
        data: {
          orderId,
          total,
          status: 'NEW',
          restaurantId: restaurant.id,          // ← VIGTIGT
          lines: {
            create: lines.map(l => {
              const item = items.find(i => i.code === l.id || i.id === l.id);
              return { qty: l.qty, item: { connect: { id: item.id } } };
            }),
          },
        },
      });

      // Realtime: ny ordre
      const io = req.app.get('io');
      io.emit('order:new', {
        orderId: created.orderId,
        total: created.total,
        status: created.status,
      });

      res.json({ orderId: created.orderId });
    } catch (e) { next(e); }
  });

  // GET /orders — liste ordrer for restaurant
  router.get('/', adminKey, async (req, res) => {
    try {
      const restaurant = await resolveRestaurant(req);
      if (!restaurant) return res.status(500).json({ error: 'no restaurant found' });

      const orders = await prisma.order.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { createdAt: 'desc' },
        include: { lines: { include: { item: true } } },
      });

      res.json(orders);
    } catch (e) {
      console.error('[GET /orders] ERROR', e);
      res.status(500).json({ error: 'orders failed' });
    }
  });

  // GET /orders/:id — én ordre
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

  // PATCH /orders/:id — ændr status
  router.patch('/:id', adminKey, async (req, res) => {
    try {
      const allowed = ['NEW', 'ACCEPTED', 'REJECTED', 'READY', 'COMPLETED'];
      const { status } = (req.body || {});
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'bad status', allowed });
      }
      const updated = await prisma.order.update({
        where: { orderId: req.params.id },
        data: { status },
      }).catch(() => null);

      if (!updated) return res.sendStatus(404);

      const io = req.app.get('io');
      io.to(`order:${req.params.id}`).emit('order:update', {
        orderId: req.params.id,
        status: updated.status,
      });

      res.json(updated);
    } catch (e) {
      console.error('[PATCH /orders/:id] ERROR', e);
      res.status(500).json({ error: 'order update failed' });
    }
  });

  return router;
};
