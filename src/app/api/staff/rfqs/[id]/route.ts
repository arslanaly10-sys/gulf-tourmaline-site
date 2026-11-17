import { isStaff } from "@/lib/auth";
import { getRfq, saveRfq } from "@/lib/store";
import type { QuoteLine, RfqStatus } from "@/lib/types";

const STATUSES: RfqStatus[] = ["new", "matched", "in_review", "approved"];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isStaff())) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const rfq = await getRfq(id);
  if (!rfq) return Response.json({ error: "not_found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));

  if (rfq.quote && Array.isArray(body.lines) && rfq.status === "approved") {
    // Editing an approved quotation opens a new revision that needs approval again.
    rfq.revision = (rfq.revision ?? 1) + 1;
    rfq.status = "in_review";
    rfq.quote.approvedBy = null;
    rfq.log.push({ at: new Date().toISOString(), text: `Revision ${rfq.revision} opened` });
  }
  if (rfq.quote && Array.isArray(body.lines)) {
    rfq.quote.lines = (body.lines as QuoteLine[]).map((l, i) => ({
      itemIndex: Number(l.itemIndex ?? i),
      description: String(l.description ?? "").slice(0, 400),
      quantity: typeof l.quantity === "number" ? l.quantity : null,
      unit: l.unit ? String(l.unit).slice(0, 30) : null,
      unitPrice: typeof l.unitPrice === "number" && l.unitPrice >= 0 ? l.unitPrice : null,
      supplier: String(l.supplier ?? "").slice(0, 120),
    }));
  }
  if (rfq.quote && typeof body.coverNote === "string") rfq.quote.coverNote = body.coverNote.slice(0, 4000);
  if (rfq.quote && typeof body.terms === "string") rfq.quote.terms = body.terms.slice(0, 4000);
  if (rfq.quote && typeof body.validityDays === "number") rfq.quote.validityDays = body.validityDays;
  if (typeof body.status === "string" && STATUSES.includes(body.status as RfqStatus)) {
    const status = body.status as RfqStatus;
    if (status === "approved") {
      const ready = rfq.quote && rfq.quote.lines.every((l) => l.unitPrice !== null);
      if (!ready) return Response.json({ error: "prices_missing" }, { status: 400 });
      rfq.quote!.approvedBy = typeof body.approver === "string" ? body.approver.slice(0, 80) : "Staff";
      rfq.approvedAt = new Date().toISOString();
    }
    rfq.status = status;
    rfq.log.push({ at: new Date().toISOString(), text: `Status changed to ${status}` });
  }
  await saveRfq(rfq);
  return Response.json(rfq);
}
