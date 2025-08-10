// backend/index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ----- Simpel "DB" i fil (kan skiftes til rigtig DB senere)
const ORDERS_FILE = path.join(__dirname, 'orders.json');

function loadOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}
function saveOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

let orders = loadOrders();

// ----- Menu (fake data nu)
const menu = [
  { id: 'b1', name: 'Cheeseburger', price: 65 },
  { id: 'p1', name: 'Pepperoni Pizza', price: 95 },
  { id: 's1', name: 'Kyllingesalat', price: 79 },
];

// GET /menu
app.get('/menu', (_req, res) => {
  res.json(menu);
});

// POST /orders  (opret ordre)
app.post('/orders', (req, res) => {
  const { lines, total } = req.body || {};
  if (!Array.isArray(lines)) {
    return res.status(400).json({ error: 'lines required' });
  }
  const orderId = Math.random().toString(36).slice(2, 8).toUpperCase();
  const order = {
    orderId,
    lines,
    total: Number(total) || 0,
    status: 'NEW',
    createdAt: Date.now(),
  };
  orders.push(order);
  saveOrders(orders);
  console.log('NEW ORDER:', order);
  res.json({ orderId });
});

// GET /orders  (alle ordrer)
app.get('/orders', (_req, res) => {
  res.json(orders);
});

// GET /orders/:id  (én ordre)
app.get('/orders/:id', (req, res) => {
  const o = orders.find(x => x.orderId === req.params.id);
  if (!o) return res.sendStatus(404);
  res.json(o);
});

// PATCH /orders/:id  (opdatér status)
app.patch('/orders/:id', (req, res) => {
  const o = orders.find(x => x.orderId === req.params.id);
  if (!o) return res.sendStatus(404);
  const { status } = req.body || {};
  const allowed = ['NEW', 'ACCEPTED', 'REJECTED', 'READY', 'COMPLETED'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'bad status', allowed });
  }
  o.status = status;
  saveOrders(orders);
  res.json(o);
});

// Tjener /admin.html (meget simpel “restaurant-konsol”)
app.use(express.static(__dirname));

const PORT = 3000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
