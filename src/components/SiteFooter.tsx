import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function SiteFooter({ locale }: { locale: Locale }) {
  const d = t(locale);
  const c = d.contact;
  return (
    <footer id="contact" className="bg-ink text-white no-print">
      <div className="brand-stripe" aria-hidden />
      <div className="wrap grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-white p-1.5">
              <Image src="/images/mark.png" alt="" width={36} height={36} className="h-9 w-9" />
            </span>
            <span className="text-lg font-semibold">{locale === "ar" ? "تورمالين الخليج للتجارة" : "Gulf Tourmaline Trading"}</span>
          </div>
          <p className="mt-4 max-w-sm leading-relaxed text-white/75">{d.footer.about}</p>
        </div>

        <div className="md:col-span-3">
          <h2 className="text-sm font-semibold text-white/60">{d.footer.visit}</h2>
          <address className="mt-4 space-y-2 not-italic leading-relaxed">
            <p>{c.address}</p>
            <p>
              <a className="inline-flex min-h-11 items-center hover:underline" href="mailto:sales@algte.com">
                sales@algte.com
              </a>
            </p>
            <p>
              <a className="inline-flex min-h-11 items-center hover:underline" href="tel:+966532713882" dir="ltr">
                +966 53 271 3882
              </a>
            </p>
          </address>
        </div>

        <div className="md:col-span-3">
          <h2 className="text-sm font-semibold text-white/60">{d.footer.lines}</h2>
          <ul className="mt-4 space-y-1">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.slug}>
                <Link className="inline-flex min-h-11 items-center text-white/85 hover:text-white hover:underline" href={`/${locale}/products/${cat.slug}`}>
                  {cat.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-sm font-semibold text-white/60">{d.footer.links}</h2>
          <ul className="mt-4 space-y-1">
            {[
              [`/${locale}/about`, d.nav.about],
              [`/${locale}/training`, d.nav.training],
              [`/${locale}/gallery`, d.nav.gallery],
              [`/${locale}/careers`, d.nav.careers],
              [`/${locale}/contact`, d.nav.contact],
            ].map(([href, label]) => (
              <li key={href}>
                <Link className="inline-flex min-h-11 items-center text-white/85 hover:text-white hover:underline" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-6 text-sm text-white/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {d.footer.rights}</p>
          <p className="flex flex-wrap gap-x-4">
            <span>{d.footer.built}</span>
            <Link href={`/${locale}/privacy`} className="underline hover:text-white">{d.assistant.privacyLink}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
