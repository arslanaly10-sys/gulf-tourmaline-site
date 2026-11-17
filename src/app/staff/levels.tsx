export const LEVEL = {
  offered: { label: "In catalog", cls: "bg-ok-bg text-ok" },
  partial: { label: "Partial match", cls: "bg-warn-bg text-warn" },
  specialist: { label: "Needs specialist", cls: "bg-info-bg text-info" },
} as const;

export const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-surface text-ink" },
  matched: { label: "Matched", cls: "bg-info-bg text-info" },
  in_review: { label: "Draft in review", cls: "bg-warn-bg text-warn" },
  approved: { label: "Approved", cls: "bg-ok-bg text-ok" },
};

export function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}
