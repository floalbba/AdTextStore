-- Упрощение модели Prompt: isPublic, isFavorite вместо visibility, category, tags, votes

-- 1. Удаляем Vote (зависит от Prompt)
DROP TABLE IF EXISTS "Vote";

-- 2. Удаляем связь Prompt-Tag
DROP TABLE IF EXISTS "_PromptToTag";

-- 3. Удаляем Tag
DROP TABLE IF EXISTS "Tag";

-- 4. Добавляем новые колонки в Prompt
ALTER TABLE "Prompt" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Prompt" ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- 5. Миграция visibility -> isPublic (если колонка visibility ещё есть)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Prompt' AND column_name = 'visibility'
  ) THEN
    UPDATE "Prompt" SET "isPublic" = ("visibility" = 'PUBLIC');
  END IF;
END $$;

-- 6. Удаляем FK на Category
ALTER TABLE "Prompt" DROP CONSTRAINT IF EXISTS "Prompt_categoryId_fkey";

-- 7. Удаляем старые колонки
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "categoryId";
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "description";
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "visibility";
ALTER TABLE "Prompt" DROP COLUMN IF EXISTS "publishedAt";

-- 8. Удаляем enum Visibility
DROP TYPE IF EXISTS "Visibility";

-- 9. Удаляем Category
DROP TABLE IF EXISTS "Category";

-- 10. Индексы (удаляем старый, добавляем новые)
DROP INDEX IF EXISTS "Prompt_visibility_createdAt_idx";
CREATE INDEX IF NOT EXISTS "Prompt_isPublic_createdAt_idx" ON "Prompt"("isPublic", "createdAt");
CREATE INDEX IF NOT EXISTS "Prompt_ownerId_isFavorite_idx" ON "Prompt"("ownerId", "isFavorite");
