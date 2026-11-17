import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { plex, plexArabic } from "@/lib/fonts";
import { dir, isLocale, locales, t } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AssistantLauncher } from "@/components/AssistantLauncher";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = t(locale);
  return {
    title: { default: d.meta.title, template: `%s | ${locale === "ar" ? "تورمالين الخليج" : "Gulf Tourmaline"}` },
    description: d.meta.description,
    icons: { icon: "/images/mark.png" },
    openGraph: {
      title: d.meta.title,
      description: d.meta.description,
      images: ["/images/banner/machines.jpg"],
      locale: locale === "ar" ? "ar_SA" : "en_US",
      type: "website",
    },
    alternates: { languages: { ar: "/ar", en: "/en" } },
  };
}

export const viewport: Viewport = { themeColor: "#0e1b2a" };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale);
  return (
    <html lang={locale} dir={dir(locale)} className={`${plex.variable} ${plexArabic.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:text-white"
        >
          {d.nav.skip}
        </a>
        <SiteHeader locale={locale} />
        <main id="main">{children}</main>
        <SiteFooter locale={locale} />
        <AssistantLauncher locale={locale} demo={!process.env.ANTHROPIC_API_KEY} uploads={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} />
      </body>
    </html>
  );
}
