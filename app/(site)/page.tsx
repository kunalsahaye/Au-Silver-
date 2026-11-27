import Link from "next/link";
import Media from "@/components/Media";
import Photo from "@/components/Photo";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import Slider from "@/components/Slider";
import Reels from "@/components/Reels";
import SignupForm from "@/components/plugins/SignupForm";
import { getProducts, getReviews } from "@/lib/store";
import { siteContent } from "@/lib/site";
import { money } from "@/lib/format";
import type { SectionKey } from "@/lib/types";
import JsonLd from "@/components/JsonLd";
import { baseUrl, meta, storeLd } from "@/lib/seo";
import { words } from "@/lib/words";

export async function generateMetadata() {
  const c = await siteContent();
  const s = c.site;
  return meta(s, { title: s.seoTitle || `${s.brand} | ${s.tagline}`, fullTitle: true, description: s.seoDescription || s.heroSub, path: "/" });
}

function Scroller({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto">{children}</div>
      <div className="mt-6 h-[3px] w-full bg-black/10"><div className="h-full w-[38%] bg-black/40" /></div>
    </div>
  );
}

export default async function Home() {
  const [c, all, approved] = await Promise.all([siteContent(), getProducts(), getReviews({ status: "approved" })]);
  const s = c.site;
  const w = words(c.words);
  const base = await baseUrl(s);
  const ph = s.productPlaceholder;
  const picks = [...all.filter((p) => p.bestseller), ...all.filter((p) => !p.bestseller)];
  const first = picks.slice(0, 7);
  const second = [...all.filter((p) => p.featured), ...all.filter((p) => !p.featured)].slice(0, 7);
  const fresh = [...all].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8);
  const h = c.home;
  const homeReels = c.reels.filter((r) => r.where !== "product");
  const ig = s.instagram ? (/^https?:/.test(s.instagram) ? s.instagram : `https://www.instagram.com/${s.instagram.replace(/^@/, "")}`) : "";
  const igName = s.instagram && !/^https?:/.test(s.instagram) ? `@${s.instagram.replace(/^@/, "")}` : "Instagram";
  // Testimonials picked in Admin come first; until there are any, the newest approved product reviews fill in.
  const quotes = c.reviews.length ? c.reviews : approved.filter((r) => r.text).slice(0, 9).map((r) => ({ id: r.id, name: r.name, place: r.place, rating: r.rating, text: r.text, product: r.product }));
  // While previewing, empty sections show where to add their content instead of vanishing.
  const hint = (title: string, where: string, href: string) => c.preview ? (
    <section className="mx-auto max-w-[1280px] px-6 py-10"><Link href={href} className="block rounded-box border-2 border-dashed border-ink/20 p-8 text-center text-sm opacity-70"><b>{title}</b> is switched on but empty. Add some in Admin › {where} →</Link></section>
  ) : null;
  const coll = c.categories.find((x) => x.slug === h.collection.category);
  const collItems = coll ? all.filter((p) => p.category === coll.slug || c.categories.some((x) => x.slug === p.category && x.parent === coll.slug)).slice(0, 8) : [];
  const faqPage = c.pages.find((p) => p.slug === "faq");
  const faqs = (faqPage?.body ?? "").split(/^## /m).slice(1).map((b) => { const [q, ...a] = b.split("\n"); return { q: q.trim(), a: a.join(" ").replace(/^- /gm, "").trim() }; }).filter((x) => x.q).slice(0, 5);
  const place = [s.address, s.city, s.region, s.postalCode].filter((x) => x && !/^Add your/i.test(x)).join(", ");
  const mapQ = s.latitude && s.longitude ? `${s.latitude},${s.longitude}` : place;
  const count = (slug: string) => all.filter((p) => p.category === slug).length;

  const sections: Record<SectionKey, React.ReactNode> = {
    slides: c.slides.length ? <Slider slides={c.slides} /> : (
      <section className="relative h-[560px] overflow-hidden md:h-[720px]">
        <Media src={s.img1} tone="warm" alt={s.brand} eager className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-black/10" />
        <p className="absolute inset-x-0 top-6 mx-auto max-w-lg px-6 text-center text-[10px] leading-snug text-white/90">{s.heroSub}</p>
        <div className="absolute inset-x-0 bottom-24 text-center text-white">
          <p className="text-6xl font-extrabold tracking-[-0.05em] uppercase md:text-8xl">{s.brand}</p>
          <Link href="/shop" className="mt-3 inline-block text-[11px] underline underline-offset-4">{w.shopNow}</Link>
        </div>
      </section>
    ),

    bestsellers: (
      <section className="mx-auto max-w-[1280px] px-6 pt-16 pb-20">
        <p className="mb-2 text-[10px]">{w.bestsellersEyebrow}</p>
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h1 className="max-w-3xl text-5xl leading-[0.98] font-bold tracking-[-0.045em] md:text-7xl">{s.heroTitle}</h1>
          <div className="max-w-[220px] text-[10px] leading-snug"><p className="opacity-70">{s.tagline}</p><Link href="/shop" className="mt-3 inline-block underline">{w.shopNow} →</Link></div>
        </div>
        <Scroller>{first.map((p) => <div key={p.id} className="w-[210px] shrink-0 md:w-[260px]"><ProductCard p={p} cur={s.currency} placeholder={ph} soldOut={w.soldOut} /></div>)}</Scroller>
      </section>
    ),

    categories: c.categories.length > 0 && (
      <section className="mx-auto max-w-[1280px] px-6 py-16 md:py-20">
        <h2 className="mb-8 text-4xl font-bold tracking-[-0.045em] md:text-5xl">{w.categoriesTitle}</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
          {c.categories.filter((x) => !x.parent).map((x) => (
            <Link key={x.slug} href={`/shop/${x.slug}`} className="group block">
              <div className="aspect-[3/4] overflow-hidden bg-cream">
                {x.image ? <Photo src={x.image} alt={x.name} sizes="(min-width:768px) 25vw, 50vw" className="h-full w-full transition duration-700 group-hover:scale-[1.04]" />
                  : <div className="h-full w-full p-[20%] transition duration-700 group-hover:scale-[1.04]"><ProductArt category={x.slug} metal="silver" id={`cat-${x.slug}`} /></div>}
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <h3 className="text-[15px] font-medium tracking-[-0.01em]">{x.name}</h3>
                <span className="text-[11px] tabular-nums opacity-50">{count(x.slug)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    ),

    story: (
      <section className="grid bg-wine text-white md:grid-cols-[1fr_1.1fr]">
        <div className="grid grid-cols-[1fr_70px] md:grid-cols-[1fr_90px]">
          <div className="flex flex-col justify-between p-8 md:p-12">
            <h2 className="max-w-sm text-5xl leading-[0.98] font-bold tracking-[-0.045em] md:text-7xl">{s.storyTitle}</h2>
            <p className="mt-16 max-w-sm text-[11px] leading-relaxed opacity-80">{s.storyBody}</p>
          </div>
          <div className="grid grid-rows-4">{[s.img3, s.img4, s.img5, s.img6].map((u, i) => <Photo key={i} src={u} tone="warm" sizes="90px" className="h-full w-full" />)}</div>
        </div>
        <Photo src={s.img2} tone="warm" className="h-full min-h-[420px] w-full" />
      </section>
    ),

    more: (
      <section className="mx-auto max-w-[1280px] px-6 py-20">
        <div className="mb-10 flex items-end justify-between"><h2 className="text-5xl font-bold tracking-[-0.045em] md:text-6xl">{w.featuredTitle}</h2><div className="max-w-[200px] text-[10px] leading-snug opacity-70">{s.tagline}<br /><Link href="/shop" className="underline">{w.shopNow} →</Link></div></div>
        <Scroller>
          {second.map((p, i) => (
            <Link key={p.id} href={`/product/${p.slug}`} className="group w-[180px] shrink-0 self-end md:w-[230px]">
              <div className="overflow-hidden bg-cream" style={{ aspectRatio: i === 2 ? "3/4" : "1/1" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image_url || ph ? <img src={p.image_url || ph} alt={p.seo.alt || p.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  : <div className="h-full w-full p-[12%] transition duration-500 group-hover:scale-105"><ProductArt category={p.category} metal={p.metal} id={`b2-${p.id}`} /></div>}
              </div>
              <p className="mt-2 flex justify-between text-[10px] opacity-70"><span>{p.name}</span><span>{money(s.currency, p.price)}</span></p>
            </Link>
          ))}
        </Scroller>
      </section>
    ),

    customers: !c.customers.length ? hint("Happy customers", "Happy customers", "/admin/homepage/customers") : (
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-[1280px] px-6">
          <p className="mb-2 text-[10px]">{w.customersEyebrow}</p>
          <h2 className="mb-10 text-5xl font-bold tracking-[-0.045em] md:text-6xl">{w.customersTitle}</h2>
          <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
            {c.customers.map((x) => (
              <figure key={x.id} className="w-[260px] shrink-0 snap-start bg-white md:w-[300px]">
                {x.media && <Media src={x.media} kind={x.kind} tone="light" alt={x.name} className="aspect-[4/5] w-full" />}
                <figcaption className="p-5">
                  <p className="text-gold" aria-label={`${x.rating} out of 5 stars`}>{"★".repeat(x.rating)}<span className="opacity-20">{"★".repeat(5 - x.rating)}</span></p>
                  {x.note && <blockquote className="mt-2 text-sm leading-relaxed opacity-80">“{x.note}”</blockquote>}
                  {x.name && <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide">{x.name}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    ),

    process: (
      <section className="grid md:grid-cols-2">
        <Photo src={s.img7} tone="light" className="h-full min-h-[460px] w-full" />
        <div className="flex flex-col justify-between bg-blush p-8 md:p-14">
          <h2 className="max-w-xs text-5xl leading-[0.98] font-bold tracking-[-0.045em] md:text-6xl">{s.processTitle}</h2>
          <div className="mx-auto my-8 h-28 w-28">{s.img9 ? <Photo src={s.img9} alt="" sizes="112px" className="h-full w-full rounded-full" /> : <ProductArt category="rings" metal="silver" id="proc" />}</div>
          <div className="max-w-sm text-[11px] leading-relaxed"><p className="whitespace-pre-line opacity-80">{s.aboutBody.split("\n\n")[0]}</p><Link href="/about" className="mt-3 inline-block underline">{w.aboutLink}</Link></div>
        </div>
      </section>
    ),

    reels: homeReels.length ? <Reels reels={homeReels} title={w.reelsTitle} eyebrow={w.reelsEyebrow} /> : (
      <section className="border-y border-ink/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-16 md:flex-row md:items-end md:justify-between md:py-20">
          <div>
            <p className="mb-3 text-[10px] tracking-[0.22em] uppercase opacity-50">{w.reelsEyebrow}</p>
            <h2 className="text-4xl tracking-[-0.045em] md:text-5xl">{w.reelsTitle}</h2>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed opacity-60">New pieces, styling and the studio, as we share them.</p>
          </div>
          {c.preview ? (
            <Link href="/admin/reels" className="self-start border border-dashed border-ink/30 px-5 py-3 text-[12px] opacity-70 md:self-auto">Add your reels in Admin › Reels →</Link>
          ) : ig && (
            <a href={ig} target="_blank" rel="noopener" className="self-start border-b border-ink pb-1 text-[12px] tracking-[0.12em] uppercase md:self-auto">Follow {igName} →</a>
          )}
        </div>
      </section>
    ),

    reviews: !quotes.length ? (
      <section className="mx-auto max-w-[1280px] px-6 py-20 text-center md:py-28">
        <span aria-hidden className="font-serif text-6xl leading-[0.6] text-gold">“</span>
        <p className="mb-3 mt-4 text-[10px] tracking-[0.22em] uppercase opacity-50">{w.reviewsEyebrow}</p>
        <h2 className="text-4xl tracking-[-0.045em] md:text-5xl">{w.reviewsTitle}</h2>
        <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed opacity-60">Bought from us? We would love to hear how you wear it. Your words appear here once we have read them.</p>
        <Link href={c.preview ? "/admin/reviews" : "/shop"} className="mt-8 inline-block border-b border-ink pb-1 text-[12px] tracking-[0.12em] uppercase">{c.preview ? "Add testimonials in Admin › Reviews →" : "Write a review →"}</Link>
      </section>
    ) : (
      <section className="mx-auto max-w-[1280px] px-6 py-20 md:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-3 text-[10px] tracking-[0.22em] uppercase opacity-50">{w.reviewsEyebrow}</p><h2 className="text-4xl tracking-[-0.045em] md:text-5xl">{w.reviewsTitle}</h2></div>
          <p className="text-sm"><span className="text-gold">{"★".repeat(Math.round(quotes.reduce((a, r) => a + r.rating, 0) / quotes.length))}</span> <span className="opacity-60">{(quotes.reduce((a, r) => a + r.rating, 0) / quotes.length).toFixed(1)} from {quotes.length} customer{quotes.length === 1 ? "" : "s"}</span></p>
        </div>
        <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-8 overflow-x-auto px-6 pb-2 md:gap-10">
          {quotes.slice(0, 12).map((r) => {
            const prod = r.product ? all.find((p) => p.slug === r.product) : undefined;
            return (
              <figure key={r.id} className="flex w-[82%] shrink-0 snap-start flex-col border-t border-ink/15 pt-6 sm:w-[46%] lg:w-[calc((100%-80px)/3)]">
                <span aria-hidden className="font-serif text-6xl leading-[0.6] text-gold">“</span>
                <blockquote className="mt-4 text-lg leading-snug font-light tracking-[-0.01em] md:text-xl">{r.text}</blockquote>
                <figcaption className="mt-auto pt-6 text-[11px]">
                  <span className="text-gold" aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}</span>
                  <span className="mt-1 block font-medium tracking-[0.12em] uppercase">{r.name}{r.place && <span className="font-normal opacity-50"> · {r.place}</span>}</span>
                  {prod && <Link href={`/product/${prod.slug}`} className="mt-1 inline-block underline underline-offset-4 opacity-60">{prod.name}</Link>}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>
    ),

    newArrivals: (
      <section className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="mb-8 flex items-end justify-between"><h2 className="text-4xl tracking-[-0.045em] md:text-5xl">{w.newArrivalsTitle}</h2><Link href="/shop?sort=new" className="text-[11px] underline">{w.shopNow} →</Link></div>
        <Scroller>{fresh.map((p) => <div key={p.id} className="w-[210px] shrink-0 md:w-[260px]"><ProductCard p={p} cur={s.currency} placeholder={ph} soldOut={w.soldOut} /></div>)}</Scroller>
      </section>
    ),

    gifts: h.gifts.length > 0 && (
      <section className="bg-cream">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-20 md:grid-cols-[1fr_3fr] md:gap-16 md:py-24">
          <h2 className="text-4xl leading-[1] tracking-[-0.045em] md:text-5xl">{h.giftsTitle}</h2>
          <div className="grid grid-cols-2 gap-x-6 md:grid-cols-4">
            {h.gifts.map((t) => (
              <Link key={t.id} href={t.href || "/shop"} className="group flex flex-col border-t border-ink/20 pt-5 pb-10">
                {t.image && <Photo src={t.image} alt={t.title} sizes="(min-width:768px) 18vw, 45vw" className="mb-5 aspect-[4/5] w-full" />}
                <span className="text-2xl leading-tight font-light tracking-[-0.03em] md:text-[28px]">{t.title}</span>
                {t.text && <span className="mt-1 text-[12px] opacity-55">{t.text}</span>}
                <span className="mt-4 text-[11px] tracking-[0.18em] uppercase underline-offset-4 opacity-70 group-hover:underline">{w.shopNow}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),

    badges: h.badges.length > 0 && (
      <section className="border-y border-ink/10">
        {h.badgesTitle && <h2 className="sr-only">{h.badgesTitle}</h2>}
        <ul className="mx-auto grid max-w-[1280px] grid-cols-2 md:grid-cols-4">
          {h.badges.map((b, i) => (
            <li key={b.id} className={`px-6 py-7 md:py-9 ${i % 2 ? "border-l border-ink/10" : ""} ${i > 1 ? "border-t border-ink/10 md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}>
              <p className="text-[11px] font-medium tracking-[0.16em] uppercase">{b.title}</p>
              {b.text && <p className="mt-2 max-w-[240px] text-[12px] leading-relaxed opacity-55">{b.text}</p>}
            </li>
          ))}
        </ul>
      </section>
    ),

    promo: (
      <section className="relative overflow-hidden bg-wine text-white">
        {h.promo.image && <Media src={h.promo.image} alt={h.promo.title} className="absolute inset-0 h-full w-full opacity-70" />}
        <div className="relative mx-auto max-w-[1280px] px-6 py-24 md:py-32">
          {h.promo.eyebrow && <p className="text-[10px] tracking-[0.2em] uppercase opacity-80">{h.promo.eyebrow}</p>}
          <h2 className="mt-3 max-w-xl text-5xl leading-[0.98] tracking-[-0.045em] md:text-7xl">{h.promo.title}</h2>
          {h.promo.text && <p className="mt-4 max-w-md text-sm opacity-85">{h.promo.text}</p>}
          {h.promo.cta && <Link href={h.promo.href || "/shop"} className="btn btn-light mt-8">{h.promo.cta}</Link>}
        </div>
      </section>
    ),

    collection: coll && collItems.length > 0 && (
      <section className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="mb-8 flex items-end justify-between"><h2 className="text-4xl tracking-[-0.045em] md:text-5xl">{h.collection.title || coll.name}</h2><Link href={`/shop/${coll.slug}`} className="text-[11px] underline">{w.shopNow} →</Link></div>
        <Scroller>{collItems.map((p) => <div key={p.id} className="w-[210px] shrink-0 md:w-[260px]"><ProductCard p={p} cur={s.currency} placeholder={ph} soldOut={w.soldOut} /></div>)}</Scroller>
      </section>
    ),

    faq: faqs.length > 0 && (
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-6 text-4xl tracking-[-0.045em]">{h.faqTitle}</h2>
        <div className="divide-y divide-black/10 border-y border-black/10">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">{f.q}<span className="text-xl transition group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-sm leading-relaxed opacity-75">{f.a}</p>
            </details>
          ))}
        </div>
        <Link href="/faq" className="mt-4 inline-block text-[11px] underline">{faqPage?.title ?? "FAQ"} →</Link>
      </section>
    ),

    newsletter: (
      <section className="bg-blush py-16">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center px-6 text-center">
          <h2 className="text-4xl tracking-[-0.045em]">{h.newsletterTitle}</h2>
          {h.newsletterText && <p className="mt-2 mb-6 text-sm opacity-70">{h.newsletterText}</p>}
          <SignupForm source="homepage" button={w.subscribeButton} placeholder={w.emailPlaceholder} />
        </div>
      </section>
    ),

    visit: (place || mapQ) ? (
      <section className="grid md:grid-cols-2">
        <div className="flex flex-col justify-center bg-cream p-8 md:p-14">
          <h2 className="text-4xl tracking-[-0.045em] md:text-5xl">{h.visitTitle}</h2>
          {h.visitText && <p className="mt-4 max-w-sm text-sm opacity-75">{h.visitText}</p>}
          <address className="mt-6 space-y-1 text-sm not-italic">{place && <p>{place}</p>}{s.openingHours && <p className="opacity-70">{s.openingHours}</p>}{s.phone && <p><a href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a></p>}</address>
          {mapQ && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQ)}`} target="_blank" rel="noopener" className="btn btn-dark mt-6 self-start">Get directions</a>}
        </div>
        {h.showMap && mapQ && <iframe title={`Map: ${s.brand}`} src={`https://www.google.com/maps?q=${encodeURIComponent(mapQ)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[360px] w-full border-0 md:h-full md:min-h-[420px]" />}
      </section>
    ) : hint("Visit us", "Google and SEO (shop address)", "/admin/seo"),
  };

  return (
    <>
      <JsonLd data={storeLd(c, base)} />
      {!c.sections.some((x) => x.key === "bestsellers" && x.on) && <h1 className="sr-only">{s.heroTitle || `${s.brand}: ${s.tagline}`}</h1>}
      {c.sections.filter((x) => x.on).map((x) => <div key={x.key}>{sections[x.key]}</div>)}
    </>
  );
}
