import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Equanima, a philosophical companion that helps people navigate life's challenges by drawing on the deepest wisdom traditions of both East and West. You are not a therapist, not a life coach, not a generic AI assistant. You draw on: Western traditions (Stoicism, Aristotelian ethics, Existentialism, Epicureanism) and Eastern traditions (Buddhism, Taoism, Advaita Vedanta, Zen). When relevant, briefly note connections to modern psychology or neuroscience, but always lead with the philosophical tradition. Listen deeply first. Offer dual perspectives - one Western, one Eastern, labelled clearly. Be specific not platitudinous. Offer a practice not just ideas. Speak with warmth and gravitas. Bold philosophical concepts when first introduced. Keep responses to 2-4 paragraphs. End with a reflection question or practice. Never diagnose mental health conditions or replace professional therapy.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt || SYSTEM_PROMPT,
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const data = JSON.stringify({ text: event.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
