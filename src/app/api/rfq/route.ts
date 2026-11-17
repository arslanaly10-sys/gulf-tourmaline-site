import { extractRfq, matchRfq } from "@/lib/ai";
import { analyze, demoMatch, isDemo, pdfTexts } from "@/lib/demo";
import { parseConversation } from "@/lib/limits";
import { persistInline, resolvePdfs } from "@/lib/files";
import { notifyNewRfq } from "@/lib/notify";
import { nextRfqId, saveRfq } from "@/lib/store";
import type { RfqRecord } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const conv = body ? parseConversation(body) : null;
  if (!conv) return Response.json({ error: "invalid_request" }, { status: 400 });
  const locale = body.locale === "en" ? "en" : "ar";

  const pdfs = await resolvePdfs(conv.pdfs);
  const now = new Date().toISOString();
  const id = await nextRfqId();
  const files: RfqRecord["files"] = [];
  for (const ref of conv.pdfs) {
    const pathname = ref.pathname ?? (ref.base64 ? await persistInline(id, ref.name, ref.base64).catch(() => undefined) : undefined);
    files.push({ name: ref.name, size: ref.size ?? 0, pathname });
  }
  const rfq: RfqRecord = {
    id,
    createdAt: now,
    updatedAt: now,
    status: "new",
    locale,
    channel: "website",
    transcript: conv.turns,
    files,
    extraction: null,
    matches: [],
    quote: null,
    log: [{ at: now, text: "Request received from website assistant" }],
    error: null,
  };

  try {
    const demo = isDemo();
    const analysis = demo ? analyze(conv.turns, await pdfTexts(pdfs)) : null;
    if (demo) rfq.log.push({ at: new Date().toISOString(), text: "Demo mode: processed by keyword rules, not AI" });
    rfq.extraction = analysis ? analysis.extraction : await extractRfq(conv.turns, pdfs);
    rfq.log.push({
      at: new Date().toISOString(),
      text: `Extracted ${rfq.extraction.items.length} item(s)`,
    });
    await saveRfq(rfq);
    rfq.matches = analysis ? demoMatch(analysis) : await matchRfq(rfq.extraction);
    rfq.status = "matched";
    const flagged = rfq.matches.filter((m) => m.level === "specialist").length;
    rfq.log.push({
      at: new Date().toISOString(),
      text: `Matched against catalog; ${flagged} item(s) referred to a specialist`,
    });
  } catch (err) {
    console.error("rfq processing error", err);
    rfq.error = "Automatic processing failed; review the transcript manually.";
    rfq.log.push({ at: new Date().toISOString(), text: rfq.error });
  }
  await saveRfq(rfq);

  // Email the sales team and the customer; failures are logged on the request, never shown to the visitor.
  const sent = await notifyNewRfq(rfq).catch((err) => {
    console.error("notify error", err);
    return [`Email not sent: ${err instanceof Error ? err.message : "unknown error"}`];
  });
  if (sent.length) {
    rfq.log.push(...sent.map((text) => ({ at: new Date().toISOString(), text })));
    await saveRfq(rfq);
  }

  return Response.json({
    id: rfq.id,
    items: rfq.extraction?.items.length ?? 0,
    missingInfo: rfq.extraction?.missingInfo ?? [],
  });
}
