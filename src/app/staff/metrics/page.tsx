import { redirect } from "next/navigation";
import { isStaff } from "@/lib/auth";
import { listRfqs } from "@/lib/store";
import type { RfqRecord } from "@/lib/types";
import { StaffBar } from "../StaffBar";

export const dynamic = "force-dynamic";

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const minutes = (a: string, b?: string | null) => (b ? (Date.parse(b) - Date.parse(a)) / 60000 : null);
const fmtDuration = (m: number | null) =>
  m === null ? "—" : m < 60 ? `${Math.round(m)} min` : m < 60 * 48 ? `${(m / 60).toFixed(1)} h` : `${(m / 1440).toFixed(1)} days`;
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");

function weekKey(iso: string) {
  const d = new Date(iso);
  const day = (d.getUTCDay() + 6) % 7; // Monday start
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export default async function Metrics() {
  if (!(await isStaff())) redirect("/staff/login?next=/staff/metrics");
  const rfqs: RfqRecord[] = await listRfqs();
  const toDraft = rfqs.map((r) => minutes(r.createdAt, r.draftedAt)).filter((x): x is number => x !== null);
  const toApproval = rfqs.map((r) => minutes(r.createdAt, r.approvedAt)).filter((x): x is number => x !== null);
  const lines = rfqs.flatMap((r) => r.matches);
  const offered = lines.filter((m) => m.level === "offered").length;
  const partial = lines.filter((m) => m.level === "partial").length;
  const specialist = lines.filter((m) => m.level === "specialist").length;
  const complete = rfqs.filter((r) => r.extraction && r.extraction.missingInfo.length === 0).length;
  const withFiles = rfqs.filter((r) => r.files.length > 0).length;
  const arabic = rfqs.filter((r) => r.locale === "ar").length;
  const approved = rfqs.filter((r) => r.status === "approved").length;
  const failed = rfqs.filter((r) => r.error).length;

  // Requests per week for the last 8 weeks.
  const weeks: { key: string; n: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const k = weekKey(new Date(Date.now() - i * 7 * 86400000).toISOString());
    weeks.push({ key: k, n: rfqs.filter((r) => weekKey(r.createdAt) === k).length });
  }
  const maxWeek = Math.max(1, ...weeks.map((w) => w.n));

  const tiles = [
    { label: "Requests received", value: String(rfqs.length), note: `${approved} quotations approved` },
    { label: "Median time to quote draft", value: fmtDuration(median(toDraft)), note: `${toDraft.length} drafted` },
    { label: "Median time to approved quote", value: fmtDuration(median(toApproval)), note: "from request to approval" },
    { label: "Requests complete on arrival", value: pct(complete, rfqs.length), note: "no missing information" },
  ];

  return (
    <>
      <StaffBar />
      <main className="wrap space-y-8 py-10">
        <div>
          <h1 className="text-3xl font-semibold">Pilot metrics</h1>
          <p className="mt-1 text-muted">The measures agreed for the pilot, calculated from every request in the sales desk.</p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl border border-line bg-card p-5">
              <dt className="text-sm text-muted">{t.label}</dt>
              <dd className="mt-2 text-3xl font-semibold">{t.value}</dd>
              <dd className="mt-1 text-xs text-muted">{t.note}</dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-line bg-card p-6">
            <h2 className="font-semibold">Catalog match across {lines.length} lines</h2>
            <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-surface" role="img" aria-label={`In catalog ${pct(offered, lines.length)}, partial ${pct(partial, lines.length)}, specialist ${pct(specialist, lines.length)}`}>
              <span className="bg-ok" style={{ width: pct(offered, lines.length) === "—" ? "0" : pct(offered, lines.length) }} />
              <span className="bg-[#c9891a]" style={{ width: pct(partial, lines.length) === "—" ? "0" : pct(partial, lines.length) }} />
              <span className="bg-info" style={{ width: pct(specialist, lines.length) === "—" ? "0" : pct(specialist, lines.length) }} />
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-ok" />In catalog</span><span>{offered} · {pct(offered, lines.length)}</span></li>
              <li className="flex justify-between"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#c9891a]" />Partial match</span><span>{partial} · {pct(partial, lines.length)}</span></li>
              <li className="flex justify-between"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-info" />Needs specialist</span><span>{specialist} · {pct(specialist, lines.length)}</span></li>
            </ul>
          </section>

          <section className="rounded-xl border border-line bg-card p-6">
            <h2 className="font-semibold">Requests per week</h2>
            <ol className="mt-4 flex h-40 items-end gap-2" aria-label="Requests per week, last 8 weeks">
              {weeks.map((w) => (
                <li key={w.key} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs">{w.n || ""}</span>
                  <span className="w-full rounded-t bg-accent" style={{ height: `${(w.n / maxWeek) * 110}px`, minHeight: w.n ? 4 : 1 }} />
                  <span className="text-[11px] text-muted">{w.key.slice(5)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="rounded-xl border border-line bg-card p-6">
          <h2 className="font-semibold">Channel and content</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-4">
            <div><dt className="text-muted">Arabic requests</dt><dd className="text-xl font-semibold">{pct(arabic, rfqs.length)}</dd></div>
            <div><dt className="text-muted">With a spec file</dt><dd className="text-xl font-semibold">{pct(withFiles, rfqs.length)}</dd></div>
            <div><dt className="text-muted">Processing failures</dt><dd className="text-xl font-semibold">{failed}</dd></div>
            <div><dt className="text-muted">Average lines per request</dt><dd className="text-xl font-semibold">{rfqs.length ? (lines.length / rfqs.length).toFixed(1) : "—"}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted">Compare these with the baseline measured on past requests at the start of the pilot.</p>
        </section>
      </main>
    </>
  );
}
