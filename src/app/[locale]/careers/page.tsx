import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, t } from "@/lib/i18n";
import { PageHead } from "@/components/PageHead";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).nav.careers, description: t(locale).careers.lead } : {};
}

export default async function Careers({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale).careers;
  return (
    <PageHead title={d.h1} lead={d.lead} image="/images/gallery/13.jpg" alt={locale === "ar" ? "فريق العمل في اجتماع تخطيط" : "The team in a planning meeting"}>
      <a href="mailto:sales@algte.com?subject=CV" className="btn btn-primary mt-8">{d.email}</a>
    </PageHead>
  );
}
