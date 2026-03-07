import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateCollectionSchema = z.object({
  label: z.string().min(1).optional(),
  schema: z.array(z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(["text", "textarea", "date", "tags", "toggle", "select"]),
    required: z.boolean().optional(),
    default: z.union([z.string(), z.boolean(), z.number()]).optional(),
    options: z.array(z.string()).optional(),
  })).optional(),
  position: z.number().int().min(0).optional(),
});

// PATCH /api/collections/[id] — update label, schema, or position
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized", actionable: "Sign in to continue." },
      { status: 401 }
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request", actionable: "Please try again." },
      { status: 400 }
    );
  }

  const parsed = UpdateCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update data", actionable: "Check the fields and try again." },
      { status: 400 }
    );
  }

  // Build update payload with only provided fields
  const updateData: Record<string, unknown> = {};
  if (parsed.data.label !== undefined) updateData.label = parsed.data.label;
  if (parsed.data.schema !== undefined) updateData.schema = parsed.data.schema;
  if (parsed.data.position !== undefined) updateData.position = parsed.data.position;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No fields to update", actionable: "Provide at least one field to update." },
      { status: 400 }
    );
  }

  try {
    const collection = await prisma.collection.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ collection });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Collection not found", actionable: "This collection may have been deleted." },
        { status: 404 }
      );
    }
    console.error("Failed to update collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection", actionable: "Please try again." },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id] — delete a collection
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized", actionable: "Sign in to continue." },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Collection not found", actionable: "This collection may have been deleted." },
        { status: 404 }
      );
    }
    console.error("Failed to delete collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection", actionable: "Please try again." },
      { status: 500 }
    );
  }
}
