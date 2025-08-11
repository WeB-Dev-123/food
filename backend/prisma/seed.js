const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = [
    { code: 'b1', name: 'Cheeseburger', price: 65 },
    { code: 'p1', name: 'Pepperoni Pizza', price: 95 },
    { code: 's1', name: 'Kyllingesalat', price: 79 },
  ];
  for (const it of items) {
    await prisma.menuItem.upsert({
      where: { code: it.code },
      update: it,
      create: it,
    });
  }
  console.log('Seeded menu items');
}

main().finally(() => prisma.$disconnect());
