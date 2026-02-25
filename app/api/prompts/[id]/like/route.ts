import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** POST /api/prompts/[id]/like — toggle лайка (идемпотентный по смыслу) */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    const { id: promptId } = await params;
    if (!promptId) {
      return NextResponse.json({ error: "ID промта обязателен" }, { status: 400 });
    }

    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { id: true, isPublic: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Промт не найден" }, { status: 404 });
    }

    if (!prompt.isPublic) {
      return NextResponse.json(
        { error: "Лайкать можно только публичные промты" },
        { status: 403 }
      );
    }

    const existing = await prisma.like.findUnique({
      where: {
        userId_promptId: { userId: session.user.id, promptId },
      },
    });

    if (existing) {
      await prisma.like.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          promptId,
        },
      });
    }

    const likesCount = await prisma.like.count({
      where: { promptId },
    });

    const liked = !existing;
    return NextResponse.json({ liked, likesCount });
  } catch (e) {
    console.error("[like] error:", e);
    return NextResponse.json(
      { error: "Попробуйте позже" },
      { status: 500 }
    );
  }
}
