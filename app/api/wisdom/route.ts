import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      ...messages,
      {
        role: "user",
        content: `Based on our conversation, distill the core wisdom into a card. Return ONLY valid JSON (no markdown, no code fences) with exactly these fields:
{
  "insight": "A single, memorable sentence capturing the deepest truth from our exchange",
  "traditions": ["Array", "of", "philosophical", "tradition", "names"],
  "practice": "A specific, concrete practice the person can try today",
  "reflection": "A deep reflection question to sit with"
}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const card = JSON.parse(cleaned);
    return Response.json(card);
  } catch {
    return Response.json(
      { error: "Failed to parse wisdom card" },
      { status: 500 }
    );
  }
}
