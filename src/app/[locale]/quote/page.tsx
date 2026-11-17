import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, t } from "@/lib/i18n";
import { AssistantChat } from "@/components/AssistantChat";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).assistant.pageH1, description: t(locale).assistant.pageLead } : {};
}

export default async function Quote({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale);
  return (
    <section className="section !pt-10 lg:!pt-14">
      <div className="wrap grid gap-10 lg:grid-cols-12">
        <div data-enter className="lg:col-span-4">
          <h1 className="h1 !text-[clamp(2rem,1.2rem+2.6vw,3.25rem)]">{d.assistant.pageH1}</h1>
          <p className="lead mt-5">{d.assistant.pageLead}</p>
          <ol className="mt-8 space-y-4">
            {d.home.steps.map((s, i) => (
              <li key={s.t} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{i + 1}</span>
                <span><strong className="block">{s.t}</strong><span className="text-sm text-muted">{s.d}</span></span>
              </li>
            ))}
          </ol>
        </div>
        <div className="h-[min(760px,calc(100svh-8rem))] overflow-hidden rounded-xl border border-line bg-card shadow-sm lg:col-span-8">
          <AssistantChat locale={locale} />
        </div>
      </div>
    </section>
  );
}
