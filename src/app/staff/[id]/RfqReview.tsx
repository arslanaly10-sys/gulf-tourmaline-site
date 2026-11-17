"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilePdf, Printer, Sparkle, FloppyDisk, SealCheck } from "@phosphor-icons/react";
import { categories } from "@/lib/catalog";
import type { QuoteLine, RfqRecord } from "@/lib/types";
import { LEVEL, Pill, STATUS } from "../levels";

const VAT = 0.15;
const sar = (n: number, ar: boolean) =>
  new Intl.NumberFormat(ar ? "ar-SA" : "en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 2 }).format(n);

export function RfqReview({ initial }: { initial: RfqRecord }) {
  const [rfq, setRfq] = useState(initial);
  const [lines, setLines] = useState<QuoteLine[]>(initial.quote?.lines ?? []);
  const [cover, setCover] = useState(initial.quote?.coverNote ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const ex = rfq.extraction;
  const ar = rfq.locale === "ar";

  const subtotal = useMemo(() => lines.reduce((s, l) => s + (l.unitPrice ?? 0) * (l.quantity ?? 1), 0), [lines]);
  const priced = lines.length > 0 && lines.every((l) => l.unitPrice !== null);

  async function call(kind: string, url: string, init: RequestInit) {
    setBusy(kind);
    setMsg(null);
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? res.status);
      setRfq(body);
      if (body.quote) {
        setLines(body.quote.lines);
        setCover(body.quote.coverNote);
      }
      return true;
    } catch (e) {
      setMsg(e instanceof Error && e.message === "prices_missing" ? "Add a unit price to every line before approving." : "That did not work. Try again.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  const draft = () => call("draft", `/api/staff/rfqs/${rfq.id}/draft`, { method: "POST" });
  const save = () => call("save", `/api/staff/rfqs/${rfq.id}`, { method: "PATCH", body: JSON.stringify({ lines, coverNote: cover }) });
  const approve = async () => {
    if (await call("save", `/api/staff/rfqs/${rfq.id}`, { method: "PATCH", body: JSON.stringify({ lines, coverNote: cover }) }))
      await call("approve", `/api/staff/rfqs/${rfq.id}`, { method: "PATCH", body: JSON.stringify({ status: "approved", approver: "Sales desk" }) });
  };
  const setLine = (i: number, patch: Partial<QuoteLine>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <main className="wrap space-y-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 no-print">
        <div>
          <Link href="/staff" className="link text-sm">All requests</Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-3 text-3xl font-semibold">
            {rfq.id} <Pill cls={STATUS[rfq.status].cls}>{STATUS[rfq.status].label}</Pill>
          </h1>
          <p className="mt-1 text-muted">
            Received {new Date(rfq.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" })} · website assistant · {ar ? "Arabic" : "English"}
          </p>
        </div>
      </div>

      {rfq.error && <p className="rounded-md bg-warn-bg p-4 text-warn no-print">{rfq.error}</p>}

      {ex && (
        <section className="grid gap-6 lg:grid-cols-3 no-print">
          <div className="rounded-xl border border-line bg-card p-6">
            <h2 className="font-semibold">Customer</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              {[
                ["Organization", ex.customer.organization],
                ["Contact", ex.customer.contactName],
                ["Email", ex.customer.email],
                ["Phone", ex.customer.phone],
                ["City", ex.customer.city],
                ["Sector", ex.customer.sector.replace("_", " ")],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-end" dir="auto">{v ?? "—"}</dd></div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-line bg-card p-6">
            <h2 className="font-semibold">Requirements</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              {[
                ["Installation", ex.requirements.installation === null ? "—" : ex.requirements.installation ? "Yes" : "No"],
                ["Training", ex.requirements.training === null ? "—" : ex.requirements.training ? "Yes" : "No"],
                ["Delivery", ex.requirements.deliveryWeeks ? `${ex.requirements.deliveryWeeks} weeks` : "—"],
                ["Location", ex.requirements.deliveryLocation ?? "—"],
                ["Budget", ex.requirements.budget ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-end" dir="auto">{v}</dd></div>
              ))}
            </dl>
            {rfq.files.length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
                {rfq.files.map((f) => (
                  <li key={f.name} className="flex items-center gap-2"><FilePdf size={16} className="text-brand-red" aria-hidden /><span dir="ltr">{f.name}</span><span className="text-muted">{Math.round(f.size / 1024)} KB</span></li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-line bg-card p-6">
            <h2 className="font-semibold">Summary</h2>
            <p className="mt-3 text-sm leading-relaxed">{ex.summary}</p>
            {ex.missingInfo.length > 0 && (
              <>
                <h3 className="mt-4 text-sm font-semibold text-warn">Still needed from the customer</h3>
                <ul className="mt-1 list-disc space-y-0.5 ps-5 text-sm">{ex.missingInfo.map((m) => <li key={m}>{m}</li>)}</ul>
              </>
            )}
          </div>
        </section>
      )}

      {ex && (
        <section className="no-print">
          <h2 className="text-xl font-semibold">Technical matching</h2>
          <p className="mt-1 text-sm text-muted">Matched against the product lines published on algte.com. Models and specs are confirmed by the team.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-card">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Requested specs</th>
                  <th className="px-4 py-3 font-semibold">Match</th>
                  <th className="px-4 py-3 font-semibold">Catalog line</th>
                  <th className="px-4 py-3 font-semibold">Why / to confirm</th>
                </tr>
              </thead>
              <tbody>
                {ex.items.map((it, i) => {
                  const m = rfq.matches.find((x) => x.itemIndex === i);
                  const cat = categories.find((c) => c.slug === m?.categorySlug);
                  return (
                    <tr key={i} className="border-t border-line align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold" dir="auto">{it.description}</p>
                        <p className="text-muted">Qty {it.quantity ?? "?"} {it.unit ?? ""}{it.sourceRef ? ` · ${it.sourceRef}` : ""}</p>
                      </td>
                      <td className="px-4 py-3" dir="auto">{it.specs.length ? <ul className="list-disc space-y-0.5 ps-4">{it.specs.map((s) => <li key={s}>{s}</li>)}</ul> : <span className="text-muted">None stated</span>}</td>
                      <td className="px-4 py-3">{m ? <Pill cls={LEVEL[m.level].cls}>{LEVEL[m.level].label}</Pill> : <span className="text-muted">—</span>}</td>
                      <td className="px-4 py-3">
                        {m?.productLine ?? "—"}
                        {cat && <a className="link mt-1 block text-xs" href={cat.sourceUrl} target="_blank" rel="noreferrer">{cat.name.en} ↗</a>}
                      </td>
                      <td className="px-4 py-3">
                        <p>{m?.rationale}</p>
                        {m && m.specsToConfirm.length > 0 && <p className="mt-2 text-warn"><strong>Confirm:</strong> {m.specsToConfirm.join("; ")}</p>}
                        {m && m.questionsForCustomer.length > 0 && <p className="mt-2 text-info"><strong>Ask:</strong> {m.questionsForCustomer.join(" ")}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <h2 className="text-xl font-semibold">Quotation</h2>
          {rfq.quote && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={save} disabled={!!busy} className="btn btn-secondary min-h-11 text-sm"><FloppyDisk size={18} aria-hidden />{busy === "save" ? "Saving…" : "Save"}</button>
              <button type="button" onClick={() => window.print()} className="btn btn-secondary min-h-11 text-sm"><Printer size={18} aria-hidden />Print / PDF</button>
              <button type="button" onClick={approve} disabled={!!busy || !priced || rfq.status === "approved"} className="btn btn-primary min-h-11 text-sm disabled:opacity-40"><SealCheck size={18} aria-hidden />{rfq.status === "approved" ? "Approved" : "Approve quotation"}</button>
            </div>
          )}
        </div>
        {msg && <p className="mt-3 text-sm text-brand-red no-print" role="alert">{msg}</p>}

        {!rfq.quote ? (
          <div className="mt-4 rounded-xl border border-dashed border-line bg-card p-8 text-center no-print">
            <p className="text-muted">Create a draft from the matched lines. You add prices and approve it; nothing is sent automatically.</p>
            <button type="button" onClick={draft} disabled={!!busy || !ex} className="btn btn-primary mt-4 disabled:opacity-40"><Sparkle size={18} aria-hidden />{busy === "draft" ? "Drafting…" : "Create quotation draft"}</button>
          </div>
        ) : (
          <article dir={ar ? "rtl" : "ltr"} lang={rfq.locale} className="mt-4 rounded-xl border border-line bg-card p-6 sm:p-10">
            {rfq.status !== "approved" && <p className="mb-6 rounded-md bg-warn-bg px-4 py-2 text-sm text-warn">{ar ? "مسودة غير معتمدة — لا تُرسل قبل اعتماد الفريق" : "Draft, not approved: do not send before team approval"}</p>}
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
              <div>
                <p className="text-sm text-muted">{ar ? "عرض سعر فني وتجاري" : "Technical and commercial quotation"}</p>
                <h3 className="text-2xl font-semibold">{ar ? "تورمالين الخليج للتجارة" : "Gulf Tourmaline Trading Est."}</h3>
                <p className="text-sm text-muted">{ar ? "الدمام، المملكة العربية السعودية · sales@algte.com" : "Dammam, Saudi Arabia · sales@algte.com"}</p>
              </div>
              <div className="text-sm">
                <p><span className="text-muted">{ar ? "المرجع: " : "Ref: "}</span>{rfq.id}</p>
                <p><span className="text-muted">{ar ? "إلى: " : "To: "}</span>{ex?.customer.organization ?? ex?.customer.contactName ?? "—"}</p>
                <p><span className="text-muted">{ar ? "صلاحية العرض: " : "Valid for: "}</span>{rfq.quote.validityDays ?? 30} {ar ? "يومًا" : "days"}</p>
              </div>
            </header>
            <textarea aria-label="Cover note" value={cover} onChange={(e) => setCover(e.target.value)} rows={4} className="mt-6 w-full resize-y rounded-md border border-transparent bg-transparent p-2 leading-relaxed hover:border-line focus:border-accent print:border-0" />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-start text-sm">
                <thead className="border-b-2 border-ink">
                  <tr className="text-start">
                    <th className="py-2 text-start">#</th>
                    <th className="py-2 text-start">{ar ? "الوصف" : "Description"}</th>
                    <th className="py-2 text-start">{ar ? "المورّد / الطراز" : "Supplier / model"}</th>
                    <th className="py-2 text-start">{ar ? "الكمية" : "Qty"}</th>
                    <th className="py-2 text-start">{ar ? "سعر الوحدة (ريال)" : "Unit price (SAR)"}</th>
                    <th className="py-2 text-end">{ar ? "الإجمالي" : "Total"}</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={i} className="border-b border-line align-top">
                      <td className="py-3 pe-2">{i + 1}</td>
                      <td className="py-3 pe-3">
                        {l.description}
                        {rfq.quote?.technicalNotes[i] && <p className="mt-1 text-xs text-muted">{rfq.quote.technicalNotes[i]}</p>}
                      </td>
                      <td className="py-3 pe-3"><input aria-label={`Supplier for line ${i + 1}`} value={l.supplier} onChange={(e) => setLine(i, { supplier: e.target.value })} placeholder={ar ? "يحدده الفريق" : "Set by team"} className="h-10 w-40 rounded border border-line px-2" /></td>
                      <td className="py-3 pe-3">{l.quantity ?? 1} {l.unit ?? ""}</td>
                      <td className="py-3 pe-3"><input aria-label={`Unit price for line ${i + 1}`} type="number" min={0} step="0.01" value={l.unitPrice ?? ""} onChange={(e) => setLine(i, { unitPrice: e.target.value === "" ? null : Number(e.target.value) })} className="h-10 w-32 rounded border border-line px-2" dir="ltr" /></td>
                      <td className="py-3 text-end" dir="ltr">{l.unitPrice === null ? "—" : sar(l.unitPrice * (l.quantity ?? 1), ar)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="text-sm">
                  <tr><td colSpan={5} className="pt-4 text-end text-muted">{ar ? "المجموع قبل الضريبة" : "Subtotal"}</td><td className="pt-4 text-end" dir="ltr">{sar(subtotal, ar)}</td></tr>
                  <tr><td colSpan={5} className="text-end text-muted">{ar ? "ضريبة القيمة المضافة 15%" : "VAT 15%"}</td><td className="text-end" dir="ltr">{sar(subtotal * VAT, ar)}</td></tr>
                  <tr className="font-semibold"><td colSpan={5} className="pt-2 text-end">{ar ? "الإجمالي" : "Total"}</td><td className="pt-2 text-end" dir="ltr">{sar(subtotal * (1 + VAT), ar)}</td></tr>
                </tfoot>
              </table>
            </div>
            <p className="mt-6 text-xs text-muted">{ar ? "الشروط التجارية والتسليم والضمان: تُضاف من القالب المعتمد لدى الشركة." : "Commercial terms, delivery and warranty: added from the company's approved template."}</p>
            {rfq.quote.approvedBy && <p className="mt-4 text-sm text-ok">{ar ? "اعتمده: " : "Approved by: "}{rfq.quote.approvedBy}</p>}
          </article>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2 no-print">
        <details className="rounded-xl border border-line bg-card p-6">
          <summary className="cursor-pointer font-semibold">Conversation ({rfq.transcript.length} messages)</summary>
          <ol className="mt-4 space-y-3 text-sm">
            {rfq.transcript.map((m, i) => (
              <li key={i} dir="auto" className={m.role === "user" ? "rounded-md bg-surface p-3" : "p-3 text-muted"}>
                <strong className="block text-xs uppercase text-muted">{m.role === "user" ? "Customer" : "Assistant"}</strong>
                <span className="whitespace-pre-wrap">{m.text}</span>
              </li>
            ))}
          </ol>
        </details>
        <div className="rounded-xl border border-line bg-card p-6">
          <h2 className="font-semibold">Activity</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {rfq.log.map((l, i) => (
              <li key={i} className="flex justify-between gap-4"><span>{l.text}</span><span className="shrink-0 text-muted">{new Date(l.at).toLocaleTimeString("en-GB", { timeStyle: "short", timeZone: "Asia/Riyadh" })}</span></li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
