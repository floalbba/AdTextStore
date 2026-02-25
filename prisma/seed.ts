import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "seed@adtextstore.local" },
    create: {
      email: "seed@adtextstore.local",
      name: "Seed User",
    },
    update: {},
  });

  await prisma.note.createMany({
    data: [
      { title: "Первая заметка", ownerId: user.id },
      { title: "Вторая заметка", ownerId: user.id },
      { title: "Третья заметка", ownerId: user.id },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
