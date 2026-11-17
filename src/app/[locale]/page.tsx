import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { categories, clients, suppliers } from "@/lib/catalog";
import { isLocale, t } from "@/lib/i18n";
import { WordHighlight } from "@/components/WordHighlight";

const WORK = [
  { src: "/images/gallery/46.jpg", alt: { ar: "فنيون يركّبون آلة ثني صاج في ورشة", en: "Technicians installing a sheet-metal folding machine" } },
  { src: "/images/gallery/45.jpg", alt: { ar: "تركيب آلة تفريز في ورشة تدريب", en: "Installing a milling machine in a training workshop" } },
  { src: "/images/gallery/25.jpg", alt: { ar: "مختبر تدريب على العمليات في طابقين", en: "Two-level process training lab" } },
  { src: "/images/gallery/40.jpg", alt: { ar: "صف من المخارط بعد التركيب", en: "A row of lathes after installation" } },
  { src: "/images/gallery/img_9891.jpg", alt: { ar: "روبوت تفتيش رباعي الأرجل في موقع صناعي", en: "Four-legged inspection robot at an industrial site" } },
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = t(locale).home;
  const nav = t(locale).nav;

  return (
    <>
      {/* Hero: full-bleed photograph, words in a solid box on the calm side. */}
      <section className="relative isolate flex min-h-[calc(100svh-var(--header-h)-4px)] items-end overflow-hidden lg:items-center">
        <Image
          src="/images/banner/machines.jpg"
          alt={locale === "ar" ? "صف من آلات الورش الصناعية الجديدة في صالة العرض" : "A row of new workshop machines on the floor"}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[70%_center]"
        />
        <div className="wrap py-10 lg:py-16">
          <div data-enter className="max-w-[40rem] rounded-xl bg-bg p-7 shadow-xl sm:p-10 lg:p-12">
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">
              <span className="h-2 w-2 rounded-full bg-brand-green" aria-hidden />
              {d.fact}
            </p>
            <h1 className="h1">{d.h1}</h1>
            <p className="lead mt-5">{d.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/quote`} className="btn btn-primary">
                {nav.cta}
              </Link>
              <Link href={`/${locale}/products`} className="btn btn-secondary">
                {d.seeLines}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product lines: a peek list, each with its own photograph. */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2 className="h2">
              {d.linesH2}
              <span className="muted">{d.linesH2Muted}</span>
            </h2>
            <p className="lead mt-4">{d.linesLead}</p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${locale}/products/${c.slug}`} className="card-link group h-full overflow-hidden rounded-card border border-line bg-card">
                  <div className="zoom relative aspect-[16/10] bg-surface">
                    <Image src={c.image} alt="" fill sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <h3 className="text-lg font-semibold">{c.name[locale]}</h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{c.short[locale]}</p>
                    </div>
                    <ArrowUpRight size={20} className="mt-1 shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 rtl:-scale-x-100" aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Work: photographs from customers' sites. */}
      <section className="section bg-surface">
        <div className="wrap">
          <div className="section-head flex flex-col gap-6 lg:max-w-none lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[46rem]">
              <h2 className="h2">{d.workH2}</h2>
              <p className="lead mt-4">{d.workLead}</p>
            </div>
            <Link href={`/${locale}/gallery`} className="link shrink-0 text-lg font-semibold">
              {d.seeWork}
            </Link>
          </div>
          <ul className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-4 lg:auto-rows-[240px] lg:grid-cols-4">
            {WORK.map((w, i) => (
              <li key={w.src} className={`zoom relative overflow-hidden rounded-card ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <Image src={w.src} alt={w.alt[locale]} fill sizes={i === 0 ? "(min-width:1024px) 640px, 100vw" : "(min-width:1024px) 320px, 50vw"} className="object-cover" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Moment: word-highlight statement. */}
      <section className="section">
        <div className="wrap">
          <div className="max-w-[60rem]">
            <WordHighlight text={d.statement} strong={d.statementStrong} />
          </div>
        </div>
      </section>

      {/* Steps: how a quotation comes together, beside the training photograph. */}
      <section className="section bg-surface">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="h2">{d.stepsH2}</h2>
            <p className="lead mt-4">{d.stepsLead}</p>
            <ol className="mt-10 space-y-6">
              {d.steps.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-white">{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{s.t}</h3>
                    <p className="mt-1 leading-relaxed text-muted">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href={`/${locale}/quote`} className="btn btn-primary mt-10">
              {nav.cta}
            </Link>
          </div>
          <div className="zoom relative aspect-[4/5] overflow-hidden rounded-card lg:aspect-[4/5]">
            <Image src="/images/gallery/15.jpg" alt={locale === "ar" ? "منصة تدريب على الكهرباء والتحكم في مختبر جامعي" : "Electrical and control training rig in a university lab"} fill sizes="(min-width:1024px) 600px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Proof: real customers and suppliers as plain lines. */}
      <section className="section">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="h2">{d.clientsH2}</h2>
            <p className="lead mt-4">{d.clientsLead}</p>
            <div className="zoom relative mt-8 aspect-[4/3] overflow-hidden rounded-card">
              <Image src="/images/gallery/52.jpg" alt={locale === "ar" ? "فريق تورمالين الخليج مع العميل أثناء فحص معدة" : "GTT team inspecting equipment with a customer"} fill sizes="(min-width:1024px) 500px, 100vw" className="object-cover" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <ul className="divide-y divide-line border-y border-line">
              {clients.map((c) => (
                <li key={c.name.en} className="flex items-center gap-4 py-3.5">
                  {c.logo && <Image src={c.logo} alt="" width={96} height={44} className="h-11 w-24 rounded-md border border-line bg-white object-contain p-1.5" />}
                  <span className="text-lg">{c.name[locale]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm font-semibold text-muted">{d.suppliersLabel}</p>
            <p className="mt-2 leading-loose" dir="ltr" lang="en">
              {suppliers.map((s) => s.name).join(" · ")}
            </p>
          </div>
        </div>
      </section>

      {/* Close: photograph with the main action. */}
      <section className="relative isolate overflow-hidden">
        <Image src="/images/banner/installation.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-ink/70" aria-hidden />
        <div className="wrap flex min-h-[70svh] flex-col items-start justify-center py-24 text-white">
          <h2 className="h2 max-w-[40rem]">{d.closeH2}</h2>
          <p className="mt-4 max-w-[36rem] text-lg leading-relaxed text-white/85">{d.closeLead}</p>
          <Link href={`/${locale}/quote`} className="btn btn-primary mt-8">
            {nav.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
