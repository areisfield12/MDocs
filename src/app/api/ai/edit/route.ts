import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { anthropic } from "@/lib/anthropic";
import { z } from "zod";

const EditSchema = z.object({
  selectedText: z.string().min(1).max(10000),
  instruction: z.string().min(1).max(1000),
  context: z.string().optional(), // Surrounding text for better context
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

  const parsed = EditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", actionable: "Select some text and provide an instruction." },
      { status: 400 }
    );
  }

  const { selectedText, instruction, context } = parsed.data;

  const systemPrompt = `You are a professional writing assistant helping to edit markdown documents.
Your task is to edit the provided text according to the user's instruction.
Return ONLY the edited text — no explanation, no preamble, no surrounding markdown code blocks.
Preserve the original markdown formatting (headers, bold, lists, links, etc.) unless the instruction says otherwise.
Match the tone and style of the surrounding document context when provided.`;

  const userPrompt = context
    ? `Document context (do not edit this):\n${context.slice(0, 500)}\n\n---\nSelected text to edit:\n${selectedText}\n\nInstruction: ${instruction}`
    : `Selected text to edit:\n${selectedText}\n\nInstruction: ${instruction}`;

  try {
    // Stream the response
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    // Create a ReadableStream to pipe to the response
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("AI edit error:", error);
    return NextResponse.json(
      {
        error: "AI editing failed",
        actionable: "Check your ANTHROPIC_API_KEY configuration and try again.",
      },
      { status: 500 }
    );
  }
}
