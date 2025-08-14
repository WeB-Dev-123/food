// backend/routes/menu.js
const express = require('express');
const router = express.Router();

module.exports = (prisma) => {
  router.get('/', async (req, res) => {
    try {
      const r = String(req.query.r || '');
      if (!r) return res.status(400).json({ error: 'restaurant id required (?r=...)' });

      const menu = await prisma.menuItem.findMany({
        where: { restaurantId: r },
        orderBy: { name: 'asc' },
      });
      res.json(menu);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'menu failed' });
    }
  });

  return router;
};
