import Image from "next/image";
import Link from "next/link";

export function StaffBar() {
  return (
    <header className="border-b border-line bg-card no-print">
      <div className="wrap flex h-16 items-center justify-between">
        <Link href="/staff" className="flex items-center gap-3 font-semibold">
          <Image src="/images/mark.png" alt="" width={32} height={32} />
          Sales desk
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/staff" className="inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-ink">Requests</Link>
          <Link href="/staff/metrics" className="inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-ink">Metrics</Link>
          <Link href="/en" className="inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-ink">Website</Link>
          <form method="post" action="/api/staff/logout">
            <button className="inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-ink">Sign out</button>
          </form>
        </div>
      </div>
      <div className="brand-stripe" aria-hidden />
    </header>
  );
}
