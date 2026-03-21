import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [
        ...messages,
        {
          role: "user",
          content:
            "Now present the counterpoint. Argue the opposite perspective from what you just offered. Challenge the assumptions embedded in your previous response. Be philosophical, specific, and thought-provoking. End with a question that holds the tension between both views.",
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return Response.json({ text });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
