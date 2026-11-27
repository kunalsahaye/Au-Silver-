import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import ProductArt from "@/components/ProductArt";
import { WishButton } from "@/components/Wishlist";
import ProductCard from "@/components/ProductCard";
import Gallery from "@/components/Gallery";
import JsonLd from "@/components/JsonLd";
import { getProduct, getProducts, getReviews } from "@/lib/store";
import ReviewForm from "@/components/ReviewForm";
import { siteContent } from "@/lib/site";
import { money } from "@/lib/format";
import { baseUrl, breadcrumbLd, meta, productDescription, productLd, productTitle } from "@/lib/seo";
import { words } from "@/lib/words";
import Reels from "@/components/Reels";
import RecentlyViewed from "@/components/plugins/RecentlyViewed";
import StickyBuy from "@/components/plugins/StickyBuy";
import SignupForm from "@/components/plugins/SignupForm";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P) {
  const { slug } = await params;
  const [p, c] = await Promise.all([getProduct(slug), siteContent()]);
  if (!p) return {};
  return meta(c.site, { title: productTitle(p), description: productDescription(p), path: `/product/${p.slug}`, image: p.image_url || p.images[0] || c.site.productPlaceholder });
}

export default async function ProductPage({ params }: P) {
  const { slug } = await params;
  const [p, c, all, reviews] = await Promise.all([getProduct(slug), siteContent(), getProducts(), getReviews({ product: slug, status: "approved" })]);
  if (!p) notFound();
  const s = c.site, w = words(c.words);
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const base = await baseUrl(s);
  const cat = c.categories.find((x) => x.slug === p.category);
  const parent = cat?.parent ? c.categories.find((x) => x.slug === cat.parent) : undefined;
  const catName = cat?.name ?? p.category;
  const photos = [p.image_url ?? "", ...p.images].filter(Boolean);
  const alt = p.seo.alt || `${p.name}, ${p.material || "silver"} ${catName.toLowerCase()}`;
  const waNum = (c.plugins.whatsapp.number || s.whatsapp).replace(/[^0-9]/g, "");
  const sized = ["rings", "bracelets", "necklaces", "anklets"].some((x) => p.category.includes(x.slice(0, -1)));
  const hasPage = (slug: string) => c.pages.some((x) => x.slug === slug);
  const thumb = photos[0] || s.productPlaceholder || undefined;
  const was = p.seo.compareAt && p.seo.compareAt > p.price ? p.seo.compareAt : 0;
  const out = p.stock <= 0;
  const low = c.plugins.lowStock.on && !out && p.stock <= c.plugins.lowStock.threshold;
  const related = all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const pl = c.plugins;
  // Upsell: pieces from other categories that go with this one, bestsellers first.
  const pairs = pl.upsell.on ? all.filter((x) => x.category !== p.category && x.stock > 0).sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || Number(b.featured) - Number(a.featured)).slice(0, 4) : [];
  const minis = all.map((x) => ({ slug: x.slug, name: x.name, price: money(s.currency, x.price), image: x.image_url || x.images[0] || s.productPlaceholder }));
  const reels = c.reels.filter((r) => r.where !== "home");
  // Only details the shop has filled in are shown; nothing is guessed.
  const rows = ([["Material", p.material], ["Finish", p.finish], ["Metal tone", p.metal], ["Stone", p.seo.stone], ["Weight", p.seo.weight], ["Size", p.seo.size], ["Category", catName], ["Availability", p.stock > 0 ? "In stock" : w.soldOut]] as [string, string | undefined][]).filter((r): r is [string, string] => !!r[1]);
  const crumbs: [string, string][] = [["Home", "/"], [w.shopAllTitle, "/shop"], ...(parent ? [[parent.name, `/shop/${parent.slug}`] as [string, string]] : []), [catName, `/shop/${p.category}`], [p.name, `/product/${p.slug}`]];
  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <JsonLd data={productLd(p, c, base, catName, reviews)} />
      <JsonLd data={breadcrumbLd(base, crumbs)} />
      <nav aria-label="Breadcrumb" className="eyebrow mb-8 opacity-60">
        {crumbs.slice(1, -1).map(([n, h], i) => <span key={h}>{i > 0 && " › "}<Link href={h}>{n}</Link></span>)}
      </nav>
      <div className="grid gap-12 md:grid-cols-2">
        {photos.length ? <Gallery photos={photos} name={alt} /> : s.productPlaceholder ? (
          <div className="aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-b from-blush to-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.productPlaceholder} alt={alt} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-b from-blush to-cream p-12"><ProductArt category={p.category} metal={p.metal} id={`pdp-${p.id}`} /></div>
        )}
        <div>
          <h1 className="serif text-5xl leading-tight italic">{p.name}</h1>
          {reviews.length > 0 && <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-xs"><span className="text-gold">{"★".repeat(Math.round(avg))}<span className="opacity-25">{"★".repeat(5 - Math.round(avg))}</span></span><span className="underline opacity-60">{reviews.length} review{reviews.length === 1 ? "" : "s"}</span></a>}
          <p className="mt-5 max-w-md leading-relaxed opacity-75">{p.description}</p>
          <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            {rows.map(([k, v]) => <div key={k} className="flex justify-between py-3"><dt className="opacity-60">{k}</dt><dd className="font-medium capitalize">{v}</dd></div>)}
          </dl>
          <p className="mt-8 flex flex-wrap items-baseline gap-x-3 text-3xl tabular-nums">
            {money(s.currency, p.price)}
            {was > 0 && <><s className="text-lg opacity-40">{money(s.currency, was)}</s><span className="bg-ink px-2 py-1 text-[10px] tracking-[0.14em] text-ivory uppercase">Save {Math.round((1 - p.price / was) * 100)}%</span></>}
          </p>
          {low && <p className="mt-2 flex items-center gap-2 text-sm text-[#9a3b2f]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />{c.plugins.lowStock.text.replace("{n}", String(p.stock))}</p>}
          <div className="mt-5 space-y-3">
            <AddToCart slug={p.slug} name={p.name} price={p.price} image={thumb} soldOut={out} stock={p.stock} buyNow="Buy now" labels={[w.addToBag, w.addedToBag, w.soldOut]} />
            {out && pl.restock.on && (
              <div className="space-y-3 border border-ink/15 p-4">
                <p className="text-sm">{pl.restock.text}</p>
                <SignupForm source={`restock:${p.slug}`.slice(0, 90)} button="Notify me" placeholder={w.emailPlaceholder} />
              </div>
            )}
            <Link href={`/contact?product=${encodeURIComponent(p.name)}`} className="btn btn-line w-full">{w.enquire}</Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <WishButton slug={p.slug} name={p.name} />
            {waNum && <a href={`https://wa.me/${waNum}?text=${encodeURIComponent(`Hi! I'd like to know more about ${p.name}: ${base}/product/${p.slug}`)}`} target="_blank" rel="noopener" className="text-[11px] tracking-[0.12em] uppercase underline-offset-4 hover:underline">Ask on WhatsApp</a>}
            {sized && hasPage("size-guide") && <Link href="/size-guide" className="text-[11px] tracking-[0.12em] uppercase underline-offset-4 hover:underline">Size guide</Link>}
          </div>
          <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            {[
              ["Delivery", `Delivered across India in ${s.deliveryDays || "3-7"} working days, gift boxed.`, "shipping"],
              ["Returns and exchanges", `Easy returns within ${s.returnDays || "7"} days of delivery.`, "returns"],
              ["Caring for silver", "Keep it dry, put it on after perfume and wipe it with a soft cloth after wearing.", "care"],
            ].map(([t, d, slug]) => (
              <details key={t} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between">{t}<span aria-hidden className="text-lg font-light transition group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-[13px] leading-relaxed opacity-70">{d} {hasPage(slug) && <Link href={`/${slug}`} className="underline">Read more</Link>}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
      <section id="reviews" className="mt-24 grid gap-10 border-t border-black/10 pt-12 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="text-3xl tracking-[-0.03em]">Reviews</h2>
          {reviews.length > 0
            ? <p className="mt-3 text-sm"><span className="text-4xl font-light">{avg.toFixed(1)}</span> <span className="opacity-60">out of 5 · {reviews.length} review{reviews.length === 1 ? "" : "s"}</span></p>
            : <p className="mt-3 text-sm opacity-60">No reviews yet. Bought this piece? Tell others what you think.</p>}
          <div className="mt-6"><ReviewForm product={p.slug} /></div>
        </div>
        <div className="divide-y divide-black/10">
          {reviews.map((r) => (
            <figure key={r.id} className="py-6 first:pt-0">
              <p className="text-sm text-gold" aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}<span className="opacity-25">{"★".repeat(5 - r.rating)}</span></p>
              <blockquote className="mt-2 leading-relaxed">{r.text}</blockquote>
              <figcaption className="mt-2 text-[11px] tracking-wide uppercase opacity-60">{r.name}{r.place && ` · ${r.place}`} · {new Date(r.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      {pairs.length > 0 && (
        <div className="mt-24">
          <h2 className="mb-8 text-3xl tracking-[-0.03em]">{pl.upsell.productTitle}</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">{pairs.map((r) => <ProductCard key={r.id} p={r} cur={s.currency} placeholder={s.productPlaceholder} soldOut={w.soldOut} />)}</div>
        </div>
      )}
      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="serif mb-8 text-3xl italic">{w.relatedTitle}</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} cur={s.currency} placeholder={s.productPlaceholder} soldOut={w.soldOut} />)}</div>
        </div>
      )}
      {reels.length > 0 && <div className="-mx-5 mt-12"><Reels reels={reels} title={w.reelsTitle} eyebrow={w.reelsEyebrow} /></div>}
      {pl.recent.on && <div className="-mx-5"><RecentlyViewed current={p.slug} all={minis} title={pl.recent.title} /></div>}
      {pl.stickyBuy.on && <StickyBuy slug={p.slug} name={p.name} price={p.price} image={thumb} priceText={money(s.currency, p.price)} soldOut={p.stock <= 0} labels={[w.addToBag, w.addedToBag, w.soldOut]} />}
    </div>
  );
}
