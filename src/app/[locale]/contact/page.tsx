import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EnvelopeSimple, Phone, WhatsappLogo, MapPin } from "@phosphor-icons/react/dist/ssr";
import { isLocale, t } from "@/lib/i18n";
import { PageHead } from "@/components/PageHead";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).nav.contact, description: t(locale).contact.lead } : {};
}

export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale).contact;
  const fmt = (p: string) => p.replace(/^\+966(\d{2})(\d{3})(\d{4})$/, "+966 $1 $2 $3");
  return (
    <>
      <PageHead title={d.h1} lead={d.lead} image="/images/gallery/19.jpg" alt={locale === "ar" ? "فريق تورمالين الخليج في الموقع" : "The Gulf Tourmaline team on site"}>
        <Link href={`/${locale}/quote`} className="btn btn-primary mt-8">{t(locale).nav.cta}</Link>
      </PageHead>
      <section className="section">
        <div className="wrap grid gap-6 md:grid-cols-3">
          {d.people.map((p) => (
            <div key={p.email} className="rounded-card border border-line bg-card p-6">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-muted">{p.role}</p>
              <ul className="mt-5 space-y-1">
                <li><a href={`tel:${p.phone}`} className="inline-flex min-h-11 items-center gap-2 hover:text-accent" dir="ltr"><Phone size={18} aria-hidden />{fmt(p.phone)}</a></li>
                <li><a href={`mailto:${p.email}`} className="inline-flex min-h-11 items-center gap-2 hover:text-accent"><EnvelopeSimple size={18} aria-hidden />{p.email}</a></li>
              </ul>
            </div>
          ))}
          <div className="rounded-card border border-line bg-card p-6">
            <h2 className="text-xl font-semibold">{d.sales}</h2>
            <p className="mt-1 flex items-center gap-2 text-muted"><MapPin size={18} aria-hidden />{d.address}</p>
            <ul className="mt-5 space-y-1">
              <li><a href="mailto:sales@algte.com" className="inline-flex min-h-11 items-center gap-2 hover:text-accent"><EnvelopeSimple size={18} aria-hidden />sales@algte.com</a></li>
              <li><a href="https://wa.me/966504943211" className="inline-flex min-h-11 items-center gap-2 hover:text-accent"><WhatsappLogo size={18} weight="fill" className="text-[#1f8f4e]" aria-hidden />{d.whatsapp}</a></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
