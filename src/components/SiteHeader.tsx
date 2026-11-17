"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X, Translate } from "@phosphor-icons/react";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function SiteHeader({ locale }: { locale: Locale }) {
  const d = t(locale).nav;
  const pathname = usePathname() ?? `/${locale}`;
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const other: Locale = locale === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${other}`);
  const links = [
    { href: `/${locale}/products`, label: d.lines },
    { href: `/${locale}/about`, label: d.about },
    { href: `/${locale}/training`, label: d.training },
    { href: `/${locale}/gallery`, label: d.gallery },
    { href: `/${locale}/contact`, label: d.contact },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur no-print">
      <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href={`/${locale}`} className="flex items-center gap-3" aria-label={d.home}>
          <Image src="/images/mark.png" alt="" width={40} height={40} priority className="h-10 w-10" />
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold">{locale === "ar" ? "تورمالين الخليج" : "Gulf Tourmaline"}</span>
            <span className="block text-xs text-muted">{locale === "ar" ? "للتجارة" : "Trading Est."}</span>
          </span>
        </Link>

        <nav aria-label={d.menu} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-md px-3 text-[15px] transition-colors hover:bg-surface ${
                    isActive(l.href) ? "font-semibold text-ink" : "text-muted"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={switchHref}
            hrefLang={other}
            lang={other}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm text-muted hover:bg-surface"
          >
            <Translate size={18} aria-hidden />
            {d.switchTo}
          </Link>
          <Link href={`/${locale}/quote`} className="btn btn-primary hidden sm:inline-flex">
            {d.cta}
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? d.close : d.menu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} aria-hidden /> : <List size={24} aria-hidden />}
          </button>
        </div>
      </div>
      <div className="brand-stripe" aria-hidden />

      {open && (
        <nav
          id="mobile-menu"
          aria-label={d.menu}
          className="fixed inset-x-0 bottom-0 top-[calc(var(--header-h)+4px)] z-40 overflow-y-auto bg-bg lg:hidden"
        >
          <ul className="wrap flex flex-col py-6">
            {[{ href: `/${locale}`, label: d.home }, ...links, { href: `/${locale}/careers`, label: d.careers }].map((l) => (
              <li key={l.href} className="border-b border-line">
                <Link href={l.href} className="flex min-h-14 items-center text-xl">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="wrap">
            <Link href={`/${locale}/quote`} className="btn btn-primary w-full">
              {d.cta}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
