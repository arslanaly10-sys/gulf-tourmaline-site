import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories } from "@/lib/catalog";
import { isLocale, t } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).lines.h1, description: t(locale).lines.lead } : {};
}

export default async function Products({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale).lines;
  return (
    <>
      <section className="border-b border-line">
        <div data-enter className="wrap py-14 lg:py-20">
          <h1 className="h1 !text-[clamp(2rem,1.2rem+2.6vw,3.5rem)]">{d.h1}</h1>
          <p className="lead mt-5 max-w-[46rem]">{d.lead}</p>
        </div>
      </section>
      <section className="section !pt-12">
        <ul className="wrap space-y-5">
          {categories.map((c, i) => (
            <li key={c.slug}>
              <Link href={`/${locale}/products/${c.slug}`} className="card-link group grid overflow-hidden rounded-card border border-line bg-card md:grid-cols-12">
                <div className={`zoom relative aspect-[16/10] md:col-span-5 md:aspect-auto md:min-h-64 ${i % 2 ? "md:order-2" : ""}`}>
                  <Image src={c.image} alt="" fill sizes="(min-width:768px) 520px, 100vw" className="object-cover" />
                </div>
                <div className="p-6 md:col-span-7 md:p-10">
                  <h2 className="text-2xl font-semibold">{c.name[locale]}</h2>
                  <p className="mt-3 leading-relaxed text-muted">{c.intro[locale]}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {c.lines.slice(0, 6).map((l) => (
                      <li key={l.en} className="rounded-full bg-surface px-3 py-1 text-sm">{l[locale]}</li>
                    ))}
                    {c.lines.length > 6 && <li className="px-1 py-1 text-sm text-muted">+{c.lines.length - 6}</li>}
                  </ul>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
