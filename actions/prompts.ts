"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPromptSchema, updatePromptSchema } from "@/lib/validations/prompt";

/** Проверка: пользователь авторизован и возврат userId */
async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Необходима авторизация");
  }
  return session.user.id;
}

/** Проверка: пользователь — владелец промта */
async function requireOwnership(promptId: string, userId: string) {
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: { ownerId: true },
  });
  if (!prompt || prompt.ownerId !== userId) {
    throw new Error("Нет прав на изменение этого промта");
  }
}

export async function createPrompt(formData: FormData) {
  const userId = await requireUserId();
  const parsed = createPromptSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    isPublic: formData.get("isPublic") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.prompt.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      isPublic: parsed.data.isPublic,
      ownerId: userId,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  revalidatePath("/dashboard/favorites");
  return { success: true };
}

export async function updatePrompt(formData: FormData) {
  const userId = await requireUserId();
  const id = formData.get("id") as string;
  if (!id) return { error: { id: ["ID обязателен"] } };
  await requireOwnership(id, userId);
  const parsed = updatePromptSchema.safeParse({
    id,
    title: formData.get("title"),
    content: formData.get("content"),
    isPublic: formData.get("isPublic") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  await prisma.prompt.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      isPublic: parsed.data.isPublic,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  revalidatePath("/dashboard/favorites");
  return { success: true };
}

export async function deletePrompt(promptId: string) {
  const userId = await requireUserId();
  await requireOwnership(promptId, userId);
  await prisma.prompt.delete({ where: { id: promptId } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  revalidatePath("/dashboard/favorites");
  return { success: true };
}

export async function togglePublic(promptId: string) {
  const userId = await requireUserId();
  await requireOwnership(promptId, userId);
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: { isPublic: true },
  });
  if (!prompt) throw new Error("Промт не найден");
  await prisma.prompt.update({
    where: { id: promptId },
    data: { isPublic: !prompt.isPublic },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  revalidatePath("/dashboard/favorites");
  return { success: true };
}

export async function toggleFavorite(promptId: string) {
  const userId = await requireUserId();
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    select: { ownerId: true, isFavorite: true },
  });
  if (!prompt) throw new Error("Промт не найден");
  // Избранное может переключать только владелец
  if (prompt.ownerId !== userId) {
    throw new Error("Только владелец может добавлять в избранное");
  }
  await prisma.prompt.update({
    where: { id: promptId },
    data: { isFavorite: !prompt.isFavorite },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  revalidatePath("/dashboard/favorites");
  return { success: true };
}
