import Image from "next/image";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  const configured = Boolean(process.env.STAFF_PASSWORD);
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form method="post" action="/api/staff/login" className="w-full max-w-sm rounded-xl border border-line bg-card p-8 shadow-sm">
        <Image src="/images/mark.png" alt="Gulf Tourmaline" width={48} height={48} />
        <h1 className="mt-4 text-2xl font-semibold">Sales desk</h1>
        <p className="mt-1 text-sm text-muted">Review requests from the website assistant.</p>
        <input type="hidden" name="next" value={next ?? "/staff"} />
        <label htmlFor="password" className="mt-6 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="mt-1.5 h-12 w-full rounded-md border border-line px-3" />
        {error && <p className="mt-2 text-sm text-brand-red" role="alert">That password is not right.</p>}
        {!configured && <p className="mt-2 text-sm text-warn">STAFF_PASSWORD is not set on the server.</p>}
        <button type="submit" className="btn btn-primary mt-6 w-full">Sign in</button>
      </form>
    </main>
  );
}
