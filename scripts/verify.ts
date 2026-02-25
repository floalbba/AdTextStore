/**
 * Скрипт проверки: создаёт тестового пользователя и промт.
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

  const prompt = await prisma.prompt.create({
    data: {
      title: "Тестовый промт",
      content: "Это тестовый контент промта для проверки схемы.",
      isPublic: true,
      ownerId: user.id,
    },
  });
  console.log("✓ Промт:", prompt.title);

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
