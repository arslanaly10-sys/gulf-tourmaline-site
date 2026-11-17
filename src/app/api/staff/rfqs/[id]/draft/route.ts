import { draftQuoteNotes } from "@/lib/ai";
import { isStaff } from "@/lib/auth";
import { demoQuoteNotes, isDemo } from "@/lib/demo";
import { getRfq, saveRfq } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isStaff())) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const rfq = await getRfq(id);
  if (!rfq?.extraction) return Response.json({ error: "not_found" }, { status: 404 });

  try {
    const notes = isDemo() ? demoQuoteNotes(rfq.extraction, rfq.matches, rfq.locale) : await draftQuoteNotes(rfq.extraction, rfq.matches, rfq.locale);
    rfq.quote = {
      lines: rfq.extraction.items.map((it, i) => ({
        itemIndex: i,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: null,
        supplier: "",
      })),
      coverNote: notes.coverNote,
      technicalNotes: notes.technicalNotes,
      validityDays: 30,
      approvedBy: null,
      terms:
        rfq.locale === "ar"
          ? "الأسعار بالريال السعودي ولا تشمل ضريبة القيمة المضافة.\nمدة التسليم: حسب ما هو موضح لكل بند من تاريخ أمر الشراء.\nشروط الدفع: تُحدد عند تأكيد الطلب.\nالضمان: حسب ضمان المصنّع لكل منتج."
          : "Prices are in Saudi riyals and exclude VAT.\nDelivery: as stated per line from the purchase order date.\nPayment terms: agreed on order confirmation.\nWarranty: as per each manufacturer's warranty.",
    };
    rfq.status = "in_review";
    rfq.draftedAt = new Date().toISOString();
    rfq.revision = 1;
    rfq.log.push({ at: new Date().toISOString(), text: "Quotation draft created for review" });
    await saveRfq(rfq);
    return Response.json(rfq);
  } catch (err) {
    console.error("draft error", err);
    return Response.json({ error: "draft_failed" }, { status: 502 });
  }
}
