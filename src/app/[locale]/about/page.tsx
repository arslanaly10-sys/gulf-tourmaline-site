import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { clients, suppliers } from "@/lib/catalog";
import { isLocale, t } from "@/lib/i18n";
import { PageHead } from "@/components/PageHead";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).nav.about, description: t(locale).about.lead } : {};
}

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale).about;
  return (
    <>
      <PageHead title={d.h1} lead={d.lead} image="/images/gallery/38.jpg" alt={locale === "ar" ? "اجتماع فريق تورمالين الخليج مع عميل" : "GTT team meeting a customer"} />
      <section className="section">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="space-y-5 text-lg leading-relaxed lg:col-span-6">
            <p>{d.p1}</p>
            <p>{d.p2}</p>
            <p className="rounded-card border border-line bg-card p-5">
              <strong className="block text-base text-accent">{d.vendorH}</strong>
              {d.vendor}
            </p>
          </div>
          <dl className="grid gap-6 lg:col-span-6">
            {[[d.missionH, d.mission], [d.visionH, d.vision], [d.valuesH, d.values]].map(([h, p]) => (
              <div key={h} className="border-t-2 border-ink pt-4">
                <dt className="text-xl font-semibold">{h}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{p}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="section bg-surface">
        <div className="wrap">
          <h2 className="h2">{d.suppliersH2}</h2>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {suppliers.map((s) => (
              <li key={s.name} className="flex flex-col items-center justify-center gap-3 rounded-card border border-line bg-white p-4 text-center">
                {s.logo ? (
                  <Image src={s.logo} alt={s.name} width={140} height={56} className="h-12 w-auto object-contain" />
                ) : (
                  <span className="flex h-12 items-center font-semibold" lang="en">{s.name}</span>
                )}
                <span className="text-xs text-muted">{s.country[locale]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <h2 className="h2">{d.clientsH2}</h2>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {clients.map((c) => (
              <li key={c.name.en} className="flex items-center gap-3 rounded-card border border-line bg-card p-4">
                {c.logo && <Image src={c.logo} alt="" width={48} height={48} className="h-12 w-12 object-contain" />}
                <span className="font-medium">{c.name[locale]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
