import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const StarSchema = z.object({
  repoOwner: z.string(),
  repoName: z.string(),
  filePath: z.string(),
});

// GET /api/stars — list starred files for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", actionable: "Sign in to continue." }, { status: 401 });
  }

  const stars = await prisma.starredFile.findMany({
    where: { userId: session.user.id },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({ stars });
}

// POST /api/stars — star a file
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

  const parsed = StarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", actionable: "Missing required fields." }, { status: 400 });
  }

  const star = await prisma.starredFile.upsert({
    where: {
      userId_repoOwner_repoName_filePath: {
        userId: session.user.id,
        ...parsed.data,
      },
    },
    create: {
      userId: session.user.id,
      ...parsed.data,
    },
    update: {}, // Already exists — no-op
  });

  return NextResponse.json({ star }, { status: 201 });
}

// DELETE /api/stars — unstar a file
export async function DELETE(request: NextRequest) {
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

  const parsed = StarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", actionable: "Missing required fields." }, { status: 400 });
  }

  try {
    await prisma.starredFile.delete({
      where: {
        userId_repoOwner_repoName_filePath: {
          userId: session.user.id,
          ...parsed.data,
        },
      },
    });
  } catch {
    // Already deleted — no-op
  }

  return NextResponse.json({ success: true });
}
