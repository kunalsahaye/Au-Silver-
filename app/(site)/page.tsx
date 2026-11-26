import Link from "next/link";
import Photo from "@/components/Photo";
import ProductCard from "@/components/ProductCard";
import ProductArt from "@/components/ProductArt";
import { getProducts, getSettings } from "@/lib/store";
import { money } from "@/lib/format";

function Scroller({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto">{children}</div>
      <div className="mt-6 h-[3px] w-full bg-black/10"><div className="h-full w-[38%] bg-black/40" /></div>
    </div>
  );
}

export default async function Home() {
  const [s, all] = await Promise.all([getSettings(), getProducts()]);
  const first = all.slice(0, 7);
  const second = all.slice(3, 10);
  return (
    <>
      {/* HERO */}
      <section className="relative h-[560px] overflow-hidden md:h-[720px]">
        <Photo src={s.img1} tone="warm" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-black/10" />
        <p className="absolute inset-x-0 top-6 mx-auto max-w-lg px-6 text-center text-[10px] leading-snug text-white/90">{s.heroSub}</p>
        <div className="absolute inset-x-0 bottom-24 text-center text-white">
          <h1 className="text-6xl font-extrabold tracking-[-0.05em] uppercase md:text-8xl">{s.brand}</h1>
          <Link href="/shop" className="mt-3 inline-block text-[11px] underline underline-offset-4">Shop now</Link>
        </div>
      </section>

      {/* BESTSELLERS 1 */}
      <section className="mx-auto max-w-[1280px] px-6 pt-16 pb-20">
        <p className="mb-2 text-[10px]">Bestsellers</p>
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-3xl text-5xl leading-[0.98] font-bold tracking-[-0.045em] md:text-7xl">{s.heroTitle}</h2>
          <div className="max-w-[220px] text-[10px] leading-snug"><p className="opacity-70">{s.storyBody}</p><Link href="/shop" className="mt-3 inline-block underline">Shop now →</Link></div>
        </div>
        <Scroller>{first.map((p) => <div key={p.id} className="w-[210px] shrink-0 md:w-[260px]"><ProductCard p={p} cur={s.currency} /></div>)}</Scroller>
      </section>

      {/* EMOTION EMBRACES TECHNIQUE */}
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

      {/* BESTSELLERS 2 */}
      <section className="mx-auto max-w-[1280px] px-6 py-20">
        <div className="mb-10 flex items-end justify-between"><h2 className="text-5xl font-bold tracking-[-0.045em] md:text-6xl">Bestsellers</h2><div className="max-w-[200px] text-[10px] leading-snug opacity-70">{s.tagline}<br /><Link href="/shop" className="underline">Shop now →</Link></div></div>
        <Scroller>
          {second.map((p, i) => (
            <Link key={p.id} href={`/product/${p.slug}`} className="group w-[180px] shrink-0 self-end md:w-[230px]">
              <div className="overflow-hidden bg-[#f4f2ee]" style={{ aspectRatio: i === 2 ? "3/4" : "1/1" }}><div className="h-full w-full p-[12%] transition duration-500 group-hover:scale-105"><ProductArt category={p.category} metal={p.metal} id={`b2-${p.id}`} /></div></div>
              <p className="mt-2 flex justify-between text-[10px] opacity-70"><span className="capitalize">{p.category}</span><span>{money(s.currency, p.price)}</span></p>
            </Link>
          ))}
        </Scroller>
      </section>

      {/* WE BELIEVE IN OUR PROCESS */}
      <section className="grid md:grid-cols-2">
        <Photo src={s.img7} tone="light" className="h-full min-h-[460px] w-full" />
        <div className="flex flex-col justify-between bg-[#eeeae5] p-8 md:p-14">
          <h2 className="max-w-xs text-5xl leading-[0.98] font-bold tracking-[-0.045em] md:text-6xl">We believe in our process</h2>
          <div className="mx-auto my-8 h-28 w-28"><ProductArt category="rings" metal="silver" id="proc" /></div>
          <div className="max-w-sm text-[11px] leading-relaxed"><p className="whitespace-pre-line opacity-80">{s.aboutBody.split("\n\n")[0]}</p><Link href="/about" className="mt-3 inline-block underline">About us →</Link></div>
        </div>
      </section>
    </>
  );
}
