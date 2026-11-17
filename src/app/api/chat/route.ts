import Anthropic from "@anthropic-ai/sdk";
import { streamChat } from "@/lib/ai";
import { parseConversation } from "@/lib/limits";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const conv = body ? parseConversation(body) : null;
  if (!conv) return Response.json({ error: "invalid_request" }, { status: 400 });

  const stream = streamChat(conv.turns, conv.pdfs);
  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\n[[refusal]]"));
        }
      } catch (err) {
        const code = err instanceof Anthropic.RateLimitError ? "busy" : "error";
        console.error("chat error", err);
        controller.enqueue(encoder.encode(`\n\n[[${code}]]`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
