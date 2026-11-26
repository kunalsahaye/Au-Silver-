import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import ProductArt from "@/components/ProductArt";
import ProductCard from "@/components/ProductCard";
import { getProduct, getProducts, getSettings } from "@/lib/store";
import { money } from "@/lib/format";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, s, all] = await Promise.all([getProduct(slug), getSettings(), getProducts()]);
  if (!p) notFound();
  const related = all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const rows = [["Material", p.material], ["Finish", p.finish], ["Metal tone", p.metal], ["Category", p.category], ["Availability", p.stock > 0 ? "In stock" : "Sold out"]];
  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <p className="eyebrow mb-8 opacity-60"><Link href="/shop">Collections</Link> › <Link href={`/shop?cat=${p.category}`} className="capitalize">{p.category}</Link></p>
      <div className="grid gap-12 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-b from-blush to-cream p-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full rounded-2xl object-cover" /> : <ProductArt category={p.category} metal={p.metal} id={`pdp-${p.id}`} />}
        </div>
        <div>
          <h1 className="serif text-5xl leading-tight italic">{p.name}</h1>
          <p className="mt-5 max-w-md leading-relaxed opacity-75">{p.description}</p>
          <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10 text-sm">
            {rows.map(([k, v]) => <div key={k} className="flex justify-between py-3"><dt className="opacity-60">{k}</dt><dd className="font-medium capitalize">{v}</dd></div>)}
          </dl>
          <p className="mt-8 text-3xl">{money(s.currency, p.price)}</p>
          <div className="mt-5 space-y-3">
            <AddToCart slug={p.slug} name={p.name} price={p.price} soldOut={p.stock <= 0} />
            <Link href={`/contact?product=${encodeURIComponent(p.name)}`} className="btn btn-line w-full">Enquire about this piece</Link>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="serif mb-8 text-3xl italic">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} cur={s.currency} />)}</div>
        </div>
      )}
    </div>
  );
}
