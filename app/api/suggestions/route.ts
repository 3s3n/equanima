import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [
        ...messages,
        {
          role: "user",
          content: `Based on our conversation so far, suggest exactly 3 short follow-up questions the person might want to ask next. Return ONLY a JSON array of 3 strings. Each question should be under 10 words, conversational, and go deeper into the themes we've discussed. No explanations, just the JSON array.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "[]";
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const suggestions = JSON.parse(cleaned);
    return Response.json({ suggestions });
  } catch {
    return Response.json({ suggestions: [] });
  }
}
