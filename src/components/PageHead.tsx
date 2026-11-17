import Image from "next/image";

/** Inner-page hero: title and lead beside one photograph. */
export function PageHead({ title, lead, image, alt, children }: { title: string; lead: string; image: string; alt: string; children?: React.ReactNode }) {
  return (
    <section className="border-b border-line">
      <div className="wrap grid items-center gap-10 py-12 lg:grid-cols-12 lg:gap-16 lg:py-20">
        <div data-enter className="lg:col-span-6">
          <h1 className="h1 !text-[clamp(2rem,1.2rem+2.6vw,3.5rem)]">{title}</h1>
          <p className="lead mt-5">{lead}</p>
          {children}
        </div>
        <div className="zoom relative aspect-[4/3] overflow-hidden rounded-card lg:col-span-6">
          <Image src={image} alt={alt} fill priority sizes="(min-width:1024px) 620px, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
