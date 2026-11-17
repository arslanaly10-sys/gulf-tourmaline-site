import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isLocale, t } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: t(locale).nav.gallery, description: t(locale).gallery.lead } : {};
}

export default async function Gallery({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale).gallery;
  const files = (await fs.readdir(path.join(process.cwd(), "public/images/gallery"))).filter((f) => /\.jpe?g$/i.test(f)).sort();
  return (
    <>
      <section className="border-b border-line">
        <div data-enter className="wrap py-14 lg:py-20">
          <h1 className="h1 !text-[clamp(2rem,1.2rem+2.6vw,3.5rem)]">{d.h1}</h1>
          <p className="lead mt-5 max-w-[46rem]">{d.lead}</p>
        </div>
      </section>
      <section className="section !pt-12">
        <ul className="wrap columns-1 gap-4 sm:columns-2 lg:columns-3">
          {files.map((f, i) => (
            <li key={f} className="zoom mb-4 break-inside-avoid overflow-hidden rounded-card bg-surface">
              <Image
                src={`/images/gallery/${f}`}
                alt={locale === "ar" ? `صورة من أعمال تورمالين الخليج ${i + 1}` : `Gulf Tourmaline project photograph ${i + 1}`}
                width={800}
                height={560}
                sizes="(min-width:1024px) 420px, (min-width:640px) 50vw, 100vw"
                className="h-auto w-full"
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
