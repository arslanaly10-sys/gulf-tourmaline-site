import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, t } from "@/lib/i18n";
import { PageHead } from "@/components/PageHead";

const PHOTOS = ["/images/gallery/17.jpg", "/images/gallery/47.jpg", "/images/gallery/5.jpg", "/images/gallery/20.jpg"];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).nav.training, description: t(locale).training.lead } : {};
}

export default async function Training({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale).training;
  return (
    <>
      <PageHead title={d.h1} lead={d.lead} image="/images/gallery/14.jpg" alt={locale === "ar" ? "منصة تدريب على الصيانة الميكانيكية" : "Mechanical maintenance training rig"}>
        <Link href={`/${locale}/quote`} className="btn btn-primary mt-8">{t(locale).nav.cta}</Link>
      </PageHead>
      <section className="section">
        <ul className="wrap grid gap-5 md:grid-cols-2">
          {d.items.map((it, i) => (
            <li key={it.t} className="overflow-hidden rounded-card border border-line bg-card">
              <div className="zoom relative aspect-[16/9]">
                <Image src={PHOTOS[i]} alt="" fill sizes="(min-width:768px) 620px, 100vw" className="object-cover" />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold">{it.t}</h2>
                <p className="mt-2 leading-relaxed text-muted">{it.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
