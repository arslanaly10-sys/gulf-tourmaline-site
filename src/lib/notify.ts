import "server-only";
import type { RfqRecord } from "./types";

// Transactional email through Resend's HTTP API. Inactive (and logged as skipped) until
// RESEND_API_KEY is set. NOTIFY_TO is a comma-separated list of sales addresses; MAIL_FROM must be
// a sender on a domain verified in Resend (e.g. "GTT Quotations <quotes@algte.com>").

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function siteUrl() {
  const raw = process.env.SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "localhost:3000";
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

async function send(to: string[], subject: string, html: string, replyTo?: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM ?? "GTT Quotations <onboarding@resend.dev>", to, subject, html, reply_to: replyTo }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

const LEVEL = { offered: "In catalog", partial: "Partial match", specialist: "Needs specialist" } as const;

function staffEmail(rfq: RfqRecord) {
  const ex = rfq.extraction;
  const c = ex?.customer;
  const rows = (ex?.items ?? [])
    .map((it, i) => {
      const m = rfq.matches.find((x) => x.itemIndex === i);
      return `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb" dir="auto">${esc(it.description)}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${it.quantity ?? "?"}</td><td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${m ? LEVEL[m.level] : "-"}</td></tr>`;
    })
    .join("");
  return `<div style="font-family:Arial,sans-serif;color:#0e1b2a;max-width:640px">
  <h2 style="margin:0 0 4px">New request ${esc(rfq.id)}</h2>
  <p style="margin:0 0 16px;color:#4a5765">${esc(c?.organization ?? "Unknown organization")} · ${esc(c?.contactName ?? "")} · ${esc(c?.email ?? c?.phone ?? "no contact given")}</p>
  <p>${esc(ex?.summary ?? rfq.error ?? "")}</p>
  <table style="border-collapse:collapse;width:100%;font-size:14px"><thead><tr style="background:#ebeff3;text-align:left"><th style="padding:6px 10px">Item</th><th style="padding:6px 10px">Qty</th><th style="padding:6px 10px">Match</th></tr></thead><tbody>${rows}</tbody></table>
  ${ex?.missingInfo.length ? `<p style="color:#7a4a00"><strong>Still needed:</strong> ${esc(ex.missingInfo.join("; "))}</p>` : ""}
  <p><a href="${siteUrl()}/staff/${encodeURIComponent(rfq.id)}" style="display:inline-block;background:#0868a6;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Review in the sales desk</a></p>
</div>`;
}

function customerEmail(rfq: RfqRecord) {
  const ar = rfq.locale === "ar";
  const items = (rfq.extraction?.items ?? []).map((it) => `<li dir="auto">${it.quantity ? `${it.quantity} × ` : ""}${esc(it.description)}</li>`).join("");
  const body = ar
    ? `<p>شكرًا لتواصلكم مع تورمالين الخليج.</p><p>استلمنا طلبكم رقم <strong>${esc(rfq.id)}</strong>، ويراجع فريقنا الفني البنود التالية قبل إرسال عرض السعر:</p><ul>${items}</ul><p>للاستفسار، ردّوا على هذه الرسالة أو راسلونا على sales@algte.com.</p><p>تورمالين الخليج للتجارة، الدمام</p>`
    : `<p>Thank you for contacting Gulf Tourmaline.</p><p>We received your request <strong>${esc(rfq.id)}</strong>. Our technical team is reviewing these items before we send your quotation:</p><ul>${items}</ul><p>For questions, reply to this email or write to sales@algte.com.</p><p>Gulf Tourmaline Trading, Dammam</p>`;
  return {
    subject: ar ? `استلمنا طلبكم ${rfq.id} — تورمالين الخليج` : `We received your request ${rfq.id} — Gulf Tourmaline`,
    html: `<div dir="${ar ? "rtl" : "ltr"}" style="font-family:Arial,sans-serif;color:#0e1b2a;max-width:600px;line-height:1.6">${body}</div>`,
  };
}

/** Sends the staff alert and the customer confirmation. Returns log lines for the request. */
export async function notifyNewRfq(rfq: RfqRecord): Promise<string[]> {
  if (!process.env.RESEND_API_KEY) return ["Email skipped: RESEND_API_KEY is not set"];
  const log: string[] = [];
  const staff = (process.env.NOTIFY_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (staff.length) {
    const org = rfq.extraction?.customer.organization ?? "website visitor";
    await send(staff, `New RFQ ${rfq.id} — ${org} — ${rfq.extraction?.items.length ?? 0} item(s)`, staffEmail(rfq), rfq.extraction?.customer.email ?? undefined);
    log.push(`Sales team notified by email (${staff.length} recipient${staff.length > 1 ? "s" : ""})`);
  } else log.push("Staff email skipped: NOTIFY_TO is not set");
  const to = rfq.extraction?.customer.email;
  if (to && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    const { subject, html } = customerEmail(rfq);
    await send([to], subject, html, staff[0]);
    log.push(`Confirmation emailed to ${to}`);
  }
  return log;
}
