import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateCollectionSchema = z.object({
  repoOwner: z.string().min(1),
  repoName: z.string().min(1),
  label: z.string().min(1),
  folderPath: z.string().min(1),
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

// POST /api/collections — create a collection
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized", actionable: "Sign in to continue." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request", actionable: "Please try again." },
      { status: 400 }
    );
  }

  const parsed = CreateCollectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid collection data", actionable: "Check all fields and try again." },
      { status: 400 }
    );
  }

  try {
    const collection = await prisma.collection.create({
      data: {
        repoOwner: parsed.data.repoOwner,
        repoName: parsed.data.repoName,
        label: parsed.data.label,
        folderPath: parsed.data.folderPath,
        schema: parsed.data.schema ?? [],
        position: parsed.data.position ?? 0,
      },
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    // Unique constraint violation — duplicate folderPath for this repo
    if (
      error instanceof Error &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "Collection already exists",
          actionable: "A collection for this folder path already exists in this repo.",
        },
        { status: 409 }
      );
    }
    console.error("Failed to create collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection", actionable: "Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/collections?owner=X&repo=Y — list collections for a repo
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized", actionable: "Sign in to continue." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing parameters", actionable: "Provide owner and repo query parameters." },
      { status: 400 }
    );
  }

  try {
    const collections = await prisma.collection.findMany({
      where: { repoOwner: owner, repoName: repo },
      orderBy: { position: "asc" },
    });
    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections", actionable: "Please try again.", collections: [] },
      { status: 500 }
    );
  }
}
