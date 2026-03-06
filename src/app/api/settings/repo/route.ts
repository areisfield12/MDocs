import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SettingsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  defaultBranch: z.string().default("main"),
  requirePR: z.boolean().default(false),
  protectedBranches: z.array(z.string()).default([]),
});

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

  const parsed = SettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings", actionable: "Check your input and try again." }, { status: 400 });
  }

  const { owner, repo, defaultBranch, requirePR, protectedBranches } = parsed.data;

  const settings = await prisma.repoSettings.upsert({
    where: { repoOwner_repoName: { repoOwner: owner, repoName: repo } },
    create: {
      repoOwner: owner,
      repoName: repo,
      defaultBranch,
      requirePR,
      protectedBranches,
    },
    update: { defaultBranch, requirePR, protectedBranches },
  });

  return NextResponse.json({ settings });
}
