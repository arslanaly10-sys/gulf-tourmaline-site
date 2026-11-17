import type { ChatTurn, UploadedPdf } from "./ai";

export const MAX_PDF_BYTES = 8 * 1024 * 1024;
export const MAX_PDFS = 3;
export const MAX_TURNS = 40;
export const MAX_TURN_CHARS = 4000;

type Body = { turns?: unknown; pdfs?: unknown };

/** Validates and trims a chat/RFQ request body. Returns null when invalid. */
export function parseConversation(body: Body): { turns: ChatTurn[]; pdfs: UploadedPdf[] } | null {
  if (!Array.isArray(body.turns) || body.turns.length === 0) return null;
  const turns: ChatTurn[] = [];
  for (const t of body.turns.slice(-MAX_TURNS)) {
    if (!t || typeof t !== "object") return null;
    const { role, text } = t as { role?: unknown; text?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof text !== "string") return null;
    turns.push({ role, text: text.slice(0, MAX_TURN_CHARS) });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;

  const pdfs: UploadedPdf[] = [];
  if (Array.isArray(body.pdfs)) {
    for (const p of body.pdfs.slice(0, MAX_PDFS)) {
      const { name, base64 } = (p ?? {}) as { name?: unknown; base64?: unknown };
      if (typeof name !== "string" || typeof base64 !== "string") return null;
      if ((base64.length * 3) / 4 > MAX_PDF_BYTES) return null;
      if (!/^[A-Za-z0-9+/=]+$/.test(base64.slice(0, 200))) return null;
      pdfs.push({ name: name.slice(0, 120), base64 });
    }
  }
  return { turns, pdfs };
}
