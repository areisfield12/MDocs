import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { anthropic } from "@/lib/anthropic";
import { z } from "zod";

const PRDescSchema = z.object({
  originalContent: z.string().max(50000),
  newContent: z.string().max(50000),
  filePath: z.string(),
});

/**
 * Compute a simple line-level diff between two strings.
 * Returns a human-readable diff string.
 */
function computeDiff(original: string, updated: string): string {
  const originalLines = original.split("\n");
  const updatedLines = updated.split("\n");

  const added: string[] = [];
  const removed: string[] = [];

  // Simple diff: find lines that changed
  const originalSet = new Set(originalLines);
  const updatedSet = new Set(updatedLines);

  for (const line of updatedLines) {
    if (!originalSet.has(line) && line.trim()) {
      added.push(line.trim().slice(0, 100));
    }
  }
  for (const line of originalLines) {
    if (!updatedSet.has(line) && line.trim()) {
      removed.push(line.trim().slice(0, 100));
    }
  }

  const parts: string[] = [];
  if (removed.length > 0) {
    parts.push(`Removed lines:\n${removed.slice(0, 10).map((l) => `- ${l}`).join("\n")}`);
  }
  if (added.length > 0) {
    parts.push(`Added lines:\n${added.slice(0, 10).map((l) => `+ ${l}`).join("\n")}`);
  }
  if (parts.length === 0) {
    parts.push("Minor formatting or whitespace changes");
  }

  return parts.join("\n\n");
}

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

  const parsed = PRDescSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", actionable: "Content is required." },
      { status: 400 }
    );
  }

  const { originalContent, newContent, filePath } = parsed.data;
  const filename = filePath.split("/").pop() ?? filePath;
  const diff = computeDiff(originalContent, newContent);

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `You are a technical writer summarizing changes to a markdown file for a pull request.

File: ${filename}
Path: ${filePath}

Changes summary:
${diff}

Generate a pull request title and description in JSON format with these exact keys:
- "title": A concise PR title (under 70 chars) starting with "Update ${filename}:"
- "body": A brief plain-English description of what changed and why (2-3 sentences).
  Write it as if explaining to a non-technical teammate.
  Do not mention git, branches, or code — just describe what the content change means.

Return ONLY valid JSON, no other text.`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback if Claude doesn't return JSON
      return NextResponse.json({
        title: `Update ${filename}`,
        body: "Updated content via Commit.",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      title: parsed.title ?? `Update ${filename}`,
      body: parsed.body ?? "Updated content via Commit.",
    });
  } catch (error) {
    console.error("PR description generation error:", error);
    // Non-fatal — return a fallback
    return NextResponse.json({
      title: `Update ${filename}`,
      body: "Updated content via Commit.",
    });
  }
}
