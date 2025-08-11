const express = require('express');
const router = express.Router();

module.exports = (prisma) => {
  router.get('/', async (_req, res) => {
    try {
      const menu = await prisma.menuItem.findMany({ orderBy: { name: 'asc' } });
      res.json(menu);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'menu failed' });
    }
  });
  return router;
};
