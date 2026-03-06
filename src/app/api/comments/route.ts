import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// GET /api/comments?repoOwner=&repoName=&filePath=&commitSha=
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", actionable: "Sign in to continue." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const repoOwner = searchParams.get("repoOwner");
  const repoName = searchParams.get("repoName");
  const filePath = searchParams.get("filePath");
  const commitSha = searchParams.get("commitSha");

  if (!repoOwner || !repoName || !filePath) {
    return NextResponse.json({ error: "Missing parameters", actionable: "Please reload the page." }, { status: 400 });
  }

  const where: Record<string, string> = { repoOwner, repoName, filePath };
  if (commitSha) where.commitSha = commitSha;

  const comments = await prisma.comment.findMany({
    where,
    include: {
      author: {
        select: { id: true, name: true, image: true, githubLogin: true },
      },
      replies: {
        include: {
          author: {
            select: { id: true, name: true, image: true, githubLogin: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ comments });
}

const CreateCommentSchema = z.object({
  repoOwner: z.string(),
  repoName: z.string(),
  filePath: z.string(),
  commitSha: z.string(),
  charStart: z.number().int().min(0),
  charEnd: z.number().int().min(0),
  quotedText: z.string().max(10000).optional(),
  body: z.string().min(1).max(5000),
});

// POST /api/comments
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", actionable: "Sign in to continue." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request", actionable: "Please try again." }, { status: 400 });
  }

  const parsed = CreateCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({
      error: "Invalid comment data",
      actionable: "Fill in all fields and try again.",
    }, { status: 400 });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        ...parsed.data,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, githubLogin: true },
        },
        replies: true,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { error: "Account not found", actionable: "Please sign out and sign back in." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create comment", actionable: "Please try again." },
      { status: 500 }
    );
  }
}
