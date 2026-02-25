-- Ручная миграция для Neon (при P1017 / advisory lock timeout)
-- 1. Открой Neon Console → SQL Editor: https://console.neon.tech
-- 2. ВАЖНО: отключи режим "Explain" / "Analyze" — используй обычный Run
-- 3. Выполняй по блокам (разделены пустыми строками). Ошибки "already exists" — пропускай.
-- 4. После успеха: npx prisma migrate resolve --applied 20250225100000_add_full_schema

-- Блок 1: Enum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- Блок 2: Таблицы
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Tag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Prompt" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "description" TEXT,
  "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ownerId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Vote" (
  "id" TEXT NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  "promptId" TEXT NOT NULL,
  CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "_PromptToTag" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

-- Блок 3: Индексы
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name");
CREATE INDEX IF NOT EXISTS "Prompt_ownerId_updatedAt_idx" ON "Prompt"("ownerId", "updatedAt");
CREATE INDEX IF NOT EXISTS "Prompt_visibility_createdAt_idx" ON "Prompt"("visibility", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Vote_userId_promptId_key" ON "Vote"("userId", "promptId");
CREATE INDEX IF NOT EXISTS "Vote_promptId_idx" ON "Vote"("promptId");
CREATE INDEX IF NOT EXISTS "Vote_userId_idx" ON "Vote"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "_PromptToTag_AB_unique" ON "_PromptToTag"("A", "B");
CREATE INDEX IF NOT EXISTS "_PromptToTag_B_index" ON "_PromptToTag"("B");

-- Блок 4: Пользователь и категория по умолчанию
INSERT INTO "User" ("id", "email", "name", "createdAt")
VALUES ('clxx000000000000000000000000000', 'migrated@adtextstore.local', 'Migrated User', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Category" ("id", "category")
VALUES ('clxx000000000000000000000000001', 'Default')
ON CONFLICT ("id") DO NOTHING;

-- Блок 5: Note.ownerId
ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

UPDATE "Note" SET "ownerId" = 'clxx000000000000000000000000000' WHERE "ownerId" IS NULL;

ALTER TABLE "Note" ALTER COLUMN "ownerId" SET NOT NULL;

-- Блок 6: Foreign keys (если ошибка "already exists" — пропусти этот блок)
ALTER TABLE "Note" ADD CONSTRAINT "Note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Vote" ADD CONSTRAINT "Vote_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_PromptToTag" ADD CONSTRAINT "_PromptToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_PromptToTag" ADD CONSTRAINT "_PromptToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
