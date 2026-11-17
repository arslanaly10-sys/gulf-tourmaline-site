import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { isStaff } from "@/lib/auth";
import { getRfq } from "@/lib/store";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

const VAT = 0.15;

export default async function QuotePrint({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isStaff())) redirect(`/staff/login?next=/staff/${encodeURIComponent(id)}/print`);
  const rfq = await getRfq(id);
  if (!rfq?.quote || !rfq.extraction) notFound();
  const q = rfq.quote;
  const ex = rfq.extraction;
  const ar = rfq.locale === "ar";
  const money = (n: number) =>
    new Intl.NumberFormat(ar ? "ar-SA-u-nu-latn" : "en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const subtotal = q.lines.reduce((s, l) => s + (l.unitPrice ?? 0) * (l.quantity ?? 1), 0);
  const issued = new Date(rfq.approvedAt ?? rfq.draftedAt ?? rfq.updatedAt);
  const dateStr = issued.toLocaleDateString(ar ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" });
  const validUntil = new Date(issued.getTime() + (q.validityDays ?? 30) * 86400000).toLocaleDateString(ar ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" });
  const approved = rfq.status === "approved";
  const vatNo = process.env.QUOTE_VAT_NUMBER;
  const L = ar
    ? { title: "عرض سعر", ref: "رقم العرض", rev: "مراجعة", date: "التاريخ", valid: "صالح حتى", to: "إلى", attn: "عناية", desc: "الوصف", supplier: "المورّد / الطراز", qty: "الكمية", unit: "سعر الوحدة", total: "الإجمالي", sub: "المجموع قبل الضريبة", vat: "ضريبة القيمة المضافة 15%", grand: "الإجمالي شامل الضريبة", terms: "الشروط", approvedBy: "اعتمده", draft: "مسودة — غير معتمدة", cur: "ريال سعودي", pcs: "قطعة" }
    : { title: "Quotation", ref: "Quotation no.", rev: "Rev.", date: "Date", valid: "Valid until", to: "To", attn: "Attn.", desc: "Description", supplier: "Supplier / model", qty: "Qty", unit: "Unit price", total: "Total", sub: "Subtotal", vat: "VAT 15%", grand: "Total incl. VAT", terms: "Terms", approvedBy: "Approved by", draft: "Draft — not approved", cur: "SAR", pcs: "pcs" };

  return (
    <div className="bg-surface print:bg-white">
      <style>{`@page { size: A4; margin: 14mm 14mm 18mm; } @media print { .sheet { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: auto !important; } }`}</style>
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-card px-6 py-3">
        <a href={`/staff/${rfq.id}`} className="link text-sm">Back to {rfq.id}</a>
        <PrintButton />
      </div>
      <article dir={ar ? "rtl" : "ltr"} lang={rfq.locale} className="sheet relative mx-auto my-8 w-[210mm] bg-white px-[14mm] py-[12mm] text-[12.5px] leading-relaxed text-ink shadow-lg">
        {!approved && (
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <span className="-rotate-[30deg] text-[64px] font-semibold text-brand-red/10">{L.draft}</span>
          </div>
        )}
        <header className="flex items-start justify-between gap-6 border-b-2 border-ink pb-4">
          <Image src="/images/logo-lockup.png" alt="Gulf Tourmaline Trading Est. — مؤسسة تورمالين الخليج التجارية" width={260} height={56} priority className="h-14 w-auto" />
          <div className="text-[11px] leading-snug text-muted" dir="ltr">
            <p>P.O. Box 10562, Dammam 31443, Saudi Arabia</p>
            <p>Tel. +966 13 835 2145 · sales@algte.com · algte.com</p>
            <p>C.R. 2050080849{vatNo ? ` · VAT ${vatNo}` : ""}</p>
          </div>
        </header>
        <div className="brand-stripe mt-1" aria-hidden />

        <div className="mt-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold">{L.title}</h1>
            <p className="mt-3"><span className="text-muted">{L.to}: </span><strong dir="auto">{ex.customer.organization ?? "—"}</strong></p>
            {ex.customer.contactName && <p><span className="text-muted">{L.attn}: </span><span dir="auto">{ex.customer.contactName}</span></p>}
            {(ex.customer.email || ex.customer.phone) && <p dir="ltr" className={ar ? "text-right" : ""}>{[ex.customer.email, ex.customer.phone].filter(Boolean).join(" · ")}</p>}
          </div>
          <table className="text-[12px]">
            <tbody>
              <tr><td className="pe-3 text-muted">{L.ref}</td><td className="font-semibold" dir="ltr">{rfq.id}</td></tr>
              <tr><td className="pe-3 text-muted">{L.rev}</td><td>{rfq.revision ?? 1}</td></tr>
              <tr><td className="pe-3 text-muted">{L.date}</td><td>{dateStr}</td></tr>
              <tr><td className="pe-3 text-muted">{L.valid}</td><td>{validUntil}</td></tr>
            </tbody>
          </table>
        </div>

        <p className="mt-6 whitespace-pre-line">{q.coverNote}</p>

        <table className="mt-6 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-ink text-white">
              <th className="px-2 py-2 text-start">#</th>
              <th className="px-2 py-2 text-start">{L.desc}</th>
              <th className="px-2 py-2 text-start">{L.supplier}</th>
              <th className="px-2 py-2 text-center">{L.qty}</th>
              <th className="px-2 py-2 text-end">{L.unit}</th>
              <th className="px-2 py-2 text-end">{L.total}</th>
            </tr>
          </thead>
          <tbody>
            {q.lines.map((l, i) => (
              <tr key={i} className="break-inside-avoid border-b border-line align-top">
                <td className="px-2 py-2">{i + 1}</td>
                <td className="px-2 py-2">
                  <span dir="auto">{l.description}</span>
                  {q.technicalNotes[i] && <span className="mt-0.5 block text-[11px] text-muted">{q.technicalNotes[i]}</span>}
                </td>
                <td className="px-2 py-2" dir="auto">{l.supplier || "—"}</td>
                <td className="px-2 py-2 text-center">{l.quantity ?? 1} {ar && (!l.unit || l.unit === "pcs") ? L.pcs : l.unit ?? ""}</td>
                <td className="px-2 py-2 text-end" dir="ltr">{l.unitPrice === null ? "—" : money(l.unitPrice)}</td>
                <td className="px-2 py-2 text-end" dir="ltr">{l.unitPrice === null ? "—" : money(l.unitPrice * (l.quantity ?? 1))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <table className="w-72 text-[12px]">
            <tbody>
              <tr><td className="py-1 text-muted">{L.sub}</td><td className="py-1 text-end" dir="ltr">{money(subtotal)} {L.cur}</td></tr>
              <tr><td className="py-1 text-muted">{L.vat}</td><td className="py-1 text-end" dir="ltr">{money(subtotal * VAT)} {L.cur}</td></tr>
              <tr className="border-t-2 border-ink font-semibold"><td className="py-1.5">{L.grand}</td><td className="py-1.5 text-end" dir="ltr">{money(subtotal * (1 + VAT))} {L.cur}</td></tr>
            </tbody>
          </table>
        </div>

        {q.terms && (
          <section className="mt-6 break-inside-avoid">
            <h2 className="font-semibold">{L.terms}</h2>
            <ul className="mt-1 list-disc space-y-0.5 ps-5 text-[11.5px]">
              {q.terms.split("\n").filter(Boolean).map((t) => <li key={t}>{t}</li>)}
            </ul>
          </section>
        )}

        <footer className="mt-10 flex items-end justify-between gap-6 break-inside-avoid">
          <div>
            <p className="text-muted">{L.approvedBy}</p>
            <p className="mt-6 min-w-48 border-t border-ink pt-1 font-semibold">{approved ? q.approvedBy : "—"}</p>
          </div>
          <p className="text-[10.5px] text-muted" dir="ltr">Gulf Tourmaline Trading Est. · {rfq.id} · Rev. {rfq.revision ?? 1}</p>
        </footer>
      </article>
    </div>
  );
}
