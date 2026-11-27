import Link from "next/link";
import Media from "@/components/Media";
import Photo from "@/components/Photo";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import Slider from "@/components/Slider";
import Reels from "@/components/Reels";
import SignupForm from "@/components/plugins/SignupForm";
import type { Tile } from "@/lib/types";
import { getProducts } from "@/lib/store";
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
  const [c, all] = await Promise.all([siteContent(), getProducts()]);
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
  // While previewing, empty sections show where to add their content instead of vanishing.
  const hint = (title: string, where: string, href: string) => c.preview ? (
    <section className="mx-auto max-w-[1280px] px-6 py-10"><Link href={href} className="block rounded-box border-2 border-dashed border-ink/20 p-8 text-center text-sm opacity-70"><b>{title}</b> is switched on but empty. Add some in Admin › {where} →</Link></section>
  ) : null;
  const tiles = (list: Tile[], wide = false) => (
    <div className={`grid grid-cols-2 gap-3 ${wide ? "md:grid-cols-4" : "md:grid-cols-4"}`}>
      {list.map((t) => (
        <Link key={t.id} href={t.href || "/shop"} className="group relative block aspect-[4/5] overflow-hidden rounded-box bg-cream">
          {t.image ? <Photo src={t.image} alt={t.title} className="h-full w-full transition duration-500 group-hover:scale-105" />
            : <div className="grid h-full w-full place-items-center bg-gradient-to-br from-cream to-blush p-6 text-center text-4xl opacity-60 transition duration-500 group-hover:scale-105">✦</div>}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 text-white">
            <h3 className="text-lg leading-tight">{t.title}</h3>{t.text && <p className="mt-1 text-[11px] opacity-85">{t.text}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
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
      <section className="mx-auto max-w-[1280px] px-6 pb-20">
        <h2 className="mb-8 text-4xl font-bold tracking-[-0.045em] md:text-5xl">{w.categoriesTitle}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {c.categories.filter((x) => !x.parent).map((x) => (
            <Link key={x.slug} href={`/shop/${x.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-cream">
              {x.image ? <Photo src={x.image} alt={x.name} className="h-full w-full transition duration-500 group-hover:scale-105" />
                : <div className="h-full w-full p-[18%] transition duration-500 group-hover:scale-105"><ProductArt category={x.slug} metal="silver" id={`cat-${x.slug}`} /></div>}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 text-white">
                <h3 className="text-lg font-bold">{x.name}</h3><p className="text-[10px] opacity-80">{count(x.slug)} {w.pieces}</p>
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
          <div className="grid grid-rows-4">{[s.img3, s.img4, s.img5, s.img6].map((u, i) => <Photo key={i} src={u} tone="warm" className="h-full w-full" />)}</div>
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
          <div className="mx-auto my-8 h-28 w-28">{s.img9 ? <Photo src={s.img9} alt="" className="h-full w-full rounded-full" /> : <ProductArt category="rings" metal="silver" id="proc" />}</div>
          <div className="max-w-sm text-[11px] leading-relaxed"><p className="whitespace-pre-line opacity-80">{s.aboutBody.split("\n\n")[0]}</p><Link href="/about" className="mt-3 inline-block underline">{w.aboutLink}</Link></div>
        </div>
      </section>
    ),

    reels: homeReels.length ? <Reels reels={homeReels} title={w.reelsTitle} eyebrow={w.reelsEyebrow} /> : hint("Reels", "Reels", "/admin/reels"),

    reviews: !c.reviews.length ? hint("Customer reviews", "Customer reviews", "/admin/reviews") : (
      <section className="mx-auto max-w-[1280px] px-6 py-16">
        <p className="mb-2 text-[10px]">{w.reviewsEyebrow}</p>
        <h2 className="mb-8 text-4xl tracking-[-0.045em] md:text-5xl">{w.reviewsTitle}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {c.reviews.slice(0, 9).map((r) => (
            <figure key={r.id} className="rounded-box bg-cream p-6">
              <p className="text-gold" aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}<span className="opacity-25">{"★".repeat(5 - r.rating)}</span></p>
              <blockquote className="mt-3 text-sm leading-relaxed opacity-85">“{r.text}”</blockquote>
              <figcaption className="mt-4 text-[11px] font-semibold tracking-wide uppercase">{r.name}{r.place && <span className="font-normal opacity-60"> · {r.place}</span>}</figcaption>
              {r.product && all.some((p) => p.slug === r.product) && <Link href={`/product/${r.product}`} className="mt-1 block text-[11px] underline opacity-60">{all.find((p) => p.slug === r.product)!.name}</Link>}
            </figure>
          ))}
        </div>
      </section>
    ),

    newArrivals: (
      <section className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="mb-8 flex items-end justify-between"><h2 className="text-4xl tracking-[-0.045em] md:text-5xl">{w.newArrivalsTitle}</h2><Link href="/shop?sort=new" className="text-[11px] underline">{w.shopNow} →</Link></div>
        <Scroller>{fresh.map((p) => <div key={p.id} className="w-[210px] shrink-0 md:w-[260px]"><ProductCard p={p} cur={s.currency} placeholder={ph} soldOut={w.soldOut} /></div>)}</Scroller>
      </section>
    ),

    occasions: h.occasions.length > 0 && (
      <section className="mx-auto max-w-[1280px] px-6 py-16">
        <h2 className="mb-8 text-4xl tracking-[-0.045em] md:text-5xl">{h.occasionsTitle}</h2>
        {tiles(h.occasions)}
      </section>
    ),

    gifts: h.gifts.length > 0 && (
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-[1280px] px-6">
          <h2 className="mb-8 text-4xl tracking-[-0.045em] md:text-5xl">{h.giftsTitle}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {h.gifts.map((t) => (
              <Link key={t.id} href={t.href || "/shop"} className="group flex items-center gap-4 rounded-box bg-ivory p-4 transition hover:shadow-md">
                {t.image ? <Photo src={t.image} alt={t.title} className="h-16 w-16 shrink-0 rounded-box" /> : <span className="grid h-16 w-16 shrink-0 place-items-center rounded-box bg-blush text-2xl">🎁</span>}
                <span><span className="block text-base font-semibold leading-tight">{t.title}</span>{t.text && <span className="block text-[11px] opacity-60">{t.text}</span>}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),

    badges: h.badges.length > 0 && (
      <section className="border-y border-black/5 py-12">
        <div className="mx-auto max-w-[1280px] px-6">
          {h.badgesTitle && <h2 className="mb-8 text-center text-3xl tracking-[-0.04em]">{h.badgesTitle}</h2>}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {h.badges.map((b) => (
              <div key={b.id} className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream text-lg font-semibold text-gold">{b.icon}</span>
                <h3 className="mt-3 text-sm font-semibold">{b.title}</h3>{b.text && <p className="mt-1 text-[11px] leading-snug opacity-65">{b.text}</p>}
              </div>
            ))}
          </div>
        </div>
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
