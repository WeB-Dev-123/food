// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Ryd ALT (rækkefølge er vigtig pga. relationer)
  await prisma.orderLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();

  // Opret restaurant
  const r = await prisma.restaurant.create({
    data: {
      name: 'Test Kebab',
      adminKey: 'resto_dev_123', // enkel “admin-nøgle” til test
    },
  });

  // Seed menu TIL DENNE restaurant
  await prisma.menuItem.createMany({
    data: [
      { code: 'b1', name: 'Cheeseburger',     price: 65, restaurantId: r.id },
      { code: 'p1', name: 'Pepperoni Pizza',  price: 95, restaurantId: r.id },
      { code: 's1', name: 'Kyllingesalat',    price: 79, restaurantId: r.id },
    ],
  });

  console.log('Seed done ✅ Restaurant ID:', r.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
