import Link from "next/link";
import Media from "@/components/Media";
import Photo from "@/components/Photo";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import Slider from "@/components/Slider";
import { getProducts } from "@/lib/store";
import { siteContent } from "@/lib/site";
import { money } from "@/lib/format";
import type { SectionKey } from "@/lib/types";

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
  const picks = [...all.filter((p) => p.bestseller), ...all.filter((p) => !p.bestseller)];
  const first = picks.slice(0, 7);
  const second = [...all.filter((p) => p.featured), ...all.filter((p) => !p.featured)].slice(0, 7);
  const count = (slug: string) => all.filter((p) => p.category === slug).length;

  const sections: Record<SectionKey, React.ReactNode> = {
    slides: c.slides.length ? <Slider slides={c.slides} /> : (
      <section className="relative h-[560px] overflow-hidden md:h-[720px]">
        <Media src={s.img1} tone="warm" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-black/10" />
        <p className="absolute inset-x-0 top-6 mx-auto max-w-lg px-6 text-center text-[10px] leading-snug text-white/90">{s.heroSub}</p>
        <div className="absolute inset-x-0 bottom-24 text-center text-white">
          <h1 className="text-6xl font-extrabold tracking-[-0.05em] uppercase md:text-8xl">{s.brand}</h1>
          <Link href="/shop" className="mt-3 inline-block text-[11px] underline underline-offset-4">Shop now</Link>
        </div>
      </section>
    ),

    bestsellers: (
      <section className="mx-auto max-w-[1280px] px-6 pt-16 pb-20">
        <p className="mb-2 text-[10px]">Bestsellers</p>
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-3xl text-5xl leading-[0.98] font-bold tracking-[-0.045em] md:text-7xl">{s.heroTitle}</h2>
          <div className="max-w-[220px] text-[10px] leading-snug"><p className="opacity-70">{s.tagline}</p><Link href="/shop" className="mt-3 inline-block underline">Shop now →</Link></div>
        </div>
        <Scroller>{first.map((p) => <div key={p.id} className="w-[210px] shrink-0 md:w-[260px]"><ProductCard p={p} cur={s.currency} /></div>)}</Scroller>
      </section>
    ),

    categories: c.categories.length > 0 && (
      <section className="mx-auto max-w-[1280px] px-6 pb-20">
        <h2 className="mb-8 text-4xl font-bold tracking-[-0.045em] md:text-5xl">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {c.categories.map((x) => (
            <Link key={x.slug} href={`/shop?cat=${x.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-[#f4f2ee]">
              {x.image ? <Photo src={x.image} alt={x.name} className="h-full w-full transition duration-500 group-hover:scale-105" />
                : <div className="h-full w-full p-[18%] transition duration-500 group-hover:scale-105"><ProductArt category={x.slug} metal="silver" id={`cat-${x.slug}`} /></div>}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 text-white">
                <p className="text-lg font-bold">{x.name}</p><p className="text-[10px] opacity-80">{count(x.slug)} pieces</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    ),

    story: (
      <section className="grid bg-[#2a170d] text-white md:grid-cols-[1fr_1.1fr]">
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
        <div className="mb-10 flex items-end justify-between"><h2 className="text-5xl font-bold tracking-[-0.045em] md:text-6xl">Featured</h2><div className="max-w-[200px] text-[10px] leading-snug opacity-70">{s.tagline}<br /><Link href="/shop" className="underline">Shop now →</Link></div></div>
        <Scroller>
          {second.map((p, i) => (
            <Link key={p.id} href={`/product/${p.slug}`} className="group w-[180px] shrink-0 self-end md:w-[230px]">
              <div className="overflow-hidden bg-[#f4f2ee]" style={{ aspectRatio: i === 2 ? "3/4" : "1/1" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  : <div className="h-full w-full p-[12%] transition duration-500 group-hover:scale-105"><ProductArt category={p.category} metal={p.metal} id={`b2-${p.id}`} /></div>}
              </div>
              <p className="mt-2 flex justify-between text-[10px] opacity-70"><span>{p.name}</span><span>{money(s.currency, p.price)}</span></p>
            </Link>
          ))}
        </Scroller>
      </section>
    ),

    customers: c.customers.length > 0 && (
      <section className="bg-[#f4f2ee] py-20">
        <div className="mx-auto max-w-[1280px] px-6">
          <p className="mb-2 text-[10px]">Loved by you</p>
          <h2 className="mb-10 text-5xl font-bold tracking-[-0.045em] md:text-6xl">Happy customers</h2>
          <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
            {c.customers.map((x) => (
              <figure key={x.id} className="w-[260px] shrink-0 snap-start bg-white md:w-[300px]">
                {x.media && <Media src={x.media} kind={x.kind} tone="light" alt={x.name} className="aspect-[4/5] w-full" />}
                <figcaption className="p-5">
                  <p className="text-[#b8924a]" aria-label={`${x.rating} out of 5 stars`}>{"★".repeat(x.rating)}<span className="opacity-20">{"★".repeat(5 - x.rating)}</span></p>
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
        <div className="flex flex-col justify-between bg-[#eeeae5] p-8 md:p-14">
          <h2 className="max-w-xs text-5xl leading-[0.98] font-bold tracking-[-0.045em] md:text-6xl">{s.processTitle}</h2>
          <div className="mx-auto my-8 h-28 w-28"><ProductArt category="rings" metal="silver" id="proc" /></div>
          <div className="max-w-sm text-[11px] leading-relaxed"><p className="whitespace-pre-line opacity-80">{s.aboutBody.split("\n\n")[0]}</p><Link href="/about" className="mt-3 inline-block underline">About us →</Link></div>
        </div>
      </section>
    ),
  };

  return <>{c.sections.filter((x) => x.on).map((x) => <div key={x.key}>{sections[x.key]}</div>)}</>;
}
