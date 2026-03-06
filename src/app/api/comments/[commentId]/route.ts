import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/comments/[commentId] — resolve/unresolve
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", actionable: "Sign in to continue." }, { status: 401 });
  }

  const { commentId } = await params;
  const body = await request.json();

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found", actionable: "The comment may have been deleted." }, { status: 404 });
  }

  // Only author can resolve (or anyone with access — product decision: allow anyone)
  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: {
      resolved: body.resolved ?? !comment.resolved,
    },
  });

  return NextResponse.json({ comment: updated });
}

// DELETE /api/comments/[commentId]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", actionable: "Sign in to continue." }, { status: 401 });
  }

  const { commentId } = await params;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: "Not found", actionable: "Comment may have already been deleted." }, { status: 404 });
  }

  if (comment.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden", actionable: "You can only delete your own comments." }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
