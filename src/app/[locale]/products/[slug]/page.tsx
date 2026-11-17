import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { categories, getCategory } from "@/lib/catalog";
import { isLocale, locales, t } from "@/lib/i18n";
import { PageHead } from "@/components/PageHead";

export function generateStaticParams() {
  return locales.flatMap((locale) => categories.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = getCategory(slug);
  return isLocale(locale) && c ? { title: c.name[locale], description: c.short[locale] } : {};
}

export default async function Line({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const c = getCategory(slug);
  if (!isLocale(locale) || !c) notFound();
  const d = t(locale).lines;
  const others = categories.filter((x) => x.slug !== slug).slice(0, 3);
  return (
    <>
      <PageHead title={c.name[locale]} lead={c.intro[locale]} image={c.image} alt="">
        <Link href={`/${locale}/quote`} className="btn btn-primary mt-8">{d.askAbout}</Link>
      </PageHead>
      <section className="section">
        <div className="wrap">
          <h2 className="h2">{d.productLines}</h2>
          <ul className="mt-10 grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {c.lines.map((l) => (
              <li key={l.en} className="flex items-center gap-3 border-b border-line py-4 text-lg">
                <CheckCircle size={22} weight="fill" className="shrink-0 text-brand-green" aria-hidden />
                {l[locale]}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section bg-surface">
        <div className="wrap">
          <h2 className="h2">{d.otherLines}</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/${locale}/products/${o.slug}`} className="card-link overflow-hidden rounded-card border border-line bg-card">
                  <div className="zoom relative aspect-[16/10]">
                    <Image src={o.image} alt="" fill sizes="(min-width:768px) 400px, 100vw" className="object-cover" />
                  </div>
                  <h3 className="p-5 text-lg font-semibold">{o.name[locale]}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
