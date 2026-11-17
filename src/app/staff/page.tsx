import Link from "next/link";
import { redirect } from "next/navigation";
import { isStaff } from "@/lib/auth";
import { listRfqs } from "@/lib/store";
import { StaffBar } from "./StaffBar";
import { LEVEL, Pill, STATUS } from "./levels";

export const dynamic = "force-dynamic";

export default async function StaffHome() {
  if (!(await isStaff())) redirect("/staff/login");
  const rfqs = await listRfqs();
  const count = (lvl: keyof typeof LEVEL) => rfqs.reduce((n, r) => n + r.matches.filter((m) => m.level === lvl).length, 0);
  return (
    <>
      <StaffBar />
      <main className="wrap py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Requests for quotation</h1>
            <p className="mt-1 text-muted">From the website assistant. Nothing reaches a customer until you approve it.</p>
          </div>
          <dl className="flex gap-6 text-sm">
            <div><dt className="text-muted">Requests</dt><dd className="text-2xl font-semibold">{rfqs.length}</dd></div>
            <div><dt className="text-muted">Lines in catalog</dt><dd className="text-2xl font-semibold">{count("offered")}</dd></div>
            <div><dt className="text-muted">For a specialist</dt><dd className="text-2xl font-semibold">{count("specialist")}</dd></div>
          </dl>
        </div>
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Request</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Match</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Received</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No requests yet. They appear here when a visitor presses “Send request”.</td></tr>
              )}
              {rfqs.map((r) => (
                <tr key={r.id} className="border-t border-line hover:bg-bg">
                  <td className="px-4 py-3"><Link href={`/staff/${r.id}`} className="link font-semibold">{r.id}</Link></td>
                  <td className="px-4 py-3">{r.extraction?.customer.organization ?? r.extraction?.customer.contactName ?? "—"}</td>
                  <td className="px-4 py-3">{r.extraction?.items.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {(Object.keys(LEVEL) as (keyof typeof LEVEL)[]).map((lvl) => {
                        const n = r.matches.filter((m) => m.level === lvl).length;
                        return n ? <Pill key={lvl} cls={LEVEL[lvl].cls}>{n} {LEVEL[lvl].label.toLowerCase()}</Pill> : null;
                      })}
                      {r.error && <Pill cls="bg-warn-bg text-warn">Manual review</Pill>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Pill cls={STATUS[r.status].cls}>{STATUS[r.status].label}</Pill></td>
                  <td className="px-4 py-3 text-muted">{new Date(r.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
