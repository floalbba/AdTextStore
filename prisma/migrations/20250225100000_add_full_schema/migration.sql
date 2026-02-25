-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable Category
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable Tag
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable Prompt
CREATE TABLE "Prompt" (
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

-- CreateTable Vote
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable _PromptToTag (implicit many-to-many)
CREATE TABLE "_PromptToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex User
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex Tag
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex Prompt
CREATE INDEX "Prompt_ownerId_updatedAt_idx" ON "Prompt"("ownerId", "updatedAt");
CREATE INDEX "Prompt_visibility_createdAt_idx" ON "Prompt"("visibility", "createdAt");

-- CreateIndex Vote
CREATE UNIQUE INDEX "Vote_userId_promptId_key" ON "Vote"("userId", "promptId");
CREATE INDEX "Vote_promptId_idx" ON "Vote"("promptId");
CREATE INDEX "Vote_userId_idx" ON "Vote"("userId");

-- CreateIndex _PromptToTag
CREATE UNIQUE INDEX "_PromptToTag_AB_unique" ON "_PromptToTag"("A", "B");
CREATE INDEX "_PromptToTag_B_index" ON "_PromptToTag"("B");

-- Create default user for existing notes
INSERT INTO "User" ("id", "email", "name", "createdAt")
VALUES ('clxx000000000000000000000000000', 'migrated@adtextstore.local', 'Migrated User', CURRENT_TIMESTAMP);

-- AlterTable Note: add ownerId
ALTER TABLE "Note" ADD COLUMN "ownerId" TEXT;

UPDATE "Note" SET "ownerId" = 'clxx000000000000000000000000000' WHERE "ownerId" IS NULL;

ALTER TABLE "Note" ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey Note
ALTER TABLE "Note" ADD CONSTRAINT "Note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Prompt
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Vote
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey _PromptToTag
ALTER TABLE "_PromptToTag" ADD CONSTRAINT "_PromptToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_PromptToTag" ADD CONSTRAINT "_PromptToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
