import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const ReplySchema = z.object({
  body: z.string().min(1).max(5000),
});

// POST /api/comments/[commentId]/replies
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", actionable: "Sign in to continue." }, { status: 401 });
  }

  const { commentId } = await params;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found", actionable: "The comment may have been deleted." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request", actionable: "Please try again." }, { status: 400 });
  }

  const parsed = ReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Reply cannot be empty", actionable: "Write something before submitting." }, { status: 400 });
  }

  try {
    const reply = await prisma.reply.create({
      data: {
        commentId,
        body: parsed.data.body,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, githubLogin: true },
        },
      },
    });

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error("Failed to create reply:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { error: "Account not found", actionable: "Please sign out and sign back in." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create reply", actionable: "Please try again." },
      { status: 500 }
    );
  }
}
