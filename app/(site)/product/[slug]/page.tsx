import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import ProductArt from "@/components/ProductArt";
import ProductCard from "@/components/ProductCard";
import Gallery from "@/components/Gallery";
import JsonLd from "@/components/JsonLd";
import { getProduct, getProducts } from "@/lib/store";
import { siteContent } from "@/lib/site";
import { money } from "@/lib/format";
import { baseUrl, breadcrumbLd, meta, productDescription, productLd, productTitle } from "@/lib/seo";
import { words } from "@/lib/words";
import Reels from "@/components/Reels";
import RecentlyViewed from "@/components/plugins/RecentlyViewed";
import StickyBuy from "@/components/plugins/StickyBuy";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P) {
  const { slug } = await params;
  const [p, c] = await Promise.all([getProduct(slug), siteContent()]);
  if (!p) return {};
  return meta(c.site, { title: productTitle(p), description: productDescription(p), path: `/product/${p.slug}`, image: p.image_url || p.images[0] || c.site.productPlaceholder });
}

export default async function ProductPage({ params }: P) {
  const { slug } = await params;
  const [p, c, all] = await Promise.all([getProduct(slug), siteContent(), getProducts()]);
  if (!p) notFound();
  const s = c.site, w = words(c.words);
  const base = await baseUrl(s);
  const cat = c.categories.find((x) => x.slug === p.category);
  const parent = cat?.parent ? c.categories.find((x) => x.slug === cat.parent) : undefined;
  const catName = cat?.name ?? p.category;
  const photos = [p.image_url ?? "", ...p.images].filter(Boolean);
  const alt = p.seo.alt || `${p.name}, ${p.material || "silver"} ${catName.toLowerCase()}`;
  const related = all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const pl = c.plugins;
  // Upsell: pieces from other categories that go with this one, bestsellers first.
  const pairs = pl.upsell.on ? all.filter((x) => x.category !== p.category && x.stock > 0).sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || Number(b.featured) - Number(a.featured)).slice(0, 4) : [];
  const minis = all.map((x) => ({ slug: x.slug, name: x.name, price: money(s.currency, x.price), image: x.image_url || x.images[0] || s.productPlaceholder }));
  const reels = c.reels.filter((r) => r.where !== "home");
  const rows = [["Material", p.material], ["Finish", p.finish], ["Metal tone", p.metal], ["Category", catName], ["Availability", p.stock > 0 ? "In stock" : w.soldOut]];
  const crumbs: [string, string][] = [["Home", "/"], [w.shopAllTitle, "/shop"], ...(parent ? [[parent.name, `/shop/${parent.slug}`] as [string, string]] : []), [catName, `/shop/${p.category}`], [p.name, `/product/${p.slug}`]];
  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <JsonLd data={productLd(p, c, base, catName)} />
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
          <p className="mt-5 max-w-md leading-relaxed opacity-75">{p.description}</p>
          <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            {rows.map(([k, v]) => <div key={k} className="flex justify-between py-3"><dt className="opacity-60">{k}</dt><dd className="font-medium capitalize">{v}</dd></div>)}
          </dl>
          <p className="mt-8 text-3xl">{money(s.currency, p.price)}</p>
          <div className="mt-5 space-y-3">
            <AddToCart slug={p.slug} name={p.name} price={p.price} soldOut={p.stock <= 0} labels={[w.addToBag, w.addedToBag, w.soldOut]} />
            <Link href={`/contact?product=${encodeURIComponent(p.name)}`} className="btn btn-line w-full">{w.enquire}</Link>
          </div>
        </div>
      </div>
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
      {pl.stickyBuy.on && <StickyBuy slug={p.slug} name={p.name} price={p.price} priceText={money(s.currency, p.price)} soldOut={p.stock <= 0} labels={[w.addToBag, w.addedToBag, w.soldOut]} />}
    </div>
  );
}
