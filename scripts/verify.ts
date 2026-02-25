/**
 * Скрипт проверки: создаёт тестового пользователя, промт и голос (Vote).
 * Запуск: npx tsx scripts/verify.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Создание тестовых данных...");

  const user = await prisma.user.upsert({
    where: { email: "test@adtextstore.local" },
    create: {
      email: "test@adtextstore.local",
      name: "Тестовый пользователь",
    },
    update: {},
  });
  console.log("✓ Пользователь:", user.email);

  let category = await prisma.category.findFirst({
    where: { category: "Тестовая категория" },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { category: "Тестовая категория" },
    });
  }
  console.log("✓ Категория:", category.category);

  const prompt = await prisma.prompt.create({
    data: {
      title: "Тестовый промт",
      content: "Это тестовый контент промта для проверки схемы.",
      description: "Описание тестового промта",
      visibility: "PUBLIC",
      ownerId: user.id,
      categoryId: category.id,
    },
  });
  console.log("✓ Промт:", prompt.title);

  const vote = await prisma.vote.create({
    data: {
      userId: user.id,
      promptId: prompt.id,
      value: 1,
    },
  });
  console.log("✓ Голос (Vote):", vote.id);

  console.log("\nПроверка завершена успешно.");
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
