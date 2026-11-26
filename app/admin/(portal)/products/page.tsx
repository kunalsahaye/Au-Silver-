import Link from "next/link";
import ProductArt from "@/components/ProductArt";
import { getProducts, getSettings } from "@/lib/store";
import { cats, money } from "@/lib/format";

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; stock?: string }> }) {
  const { q = "", cat = "", stock = "" } = await searchParams;
  const [all, s] = await Promise.all([getProducts(), getSettings()]);
  const term = q.trim().toLowerCase();
  const list = all.filter((p) =>
    (!term || p.name.toLowerCase().includes(term) || p.slug.includes(term)) &&
    (!cat || p.category === cat) &&
    (stock !== "low" || p.stock <= 3));
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="serif text-4xl italic">Products</h1><p className="text-sm opacity-60">{all.length} pieces in the shop</p></div>
        <Link href="/admin/products/new" className="btn btn-dark">+ Add product</Link>
      </div>
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search by name" className="field !w-56 !py-2" />
        <select name="cat" defaultValue={cat} className="field !w-auto !py-2 capitalize"><option value="">All categories</option>{cats.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <select name="stock" defaultValue={stock} className="field !w-auto !py-2"><option value="">Any stock</option><option value="low">Low or sold out (3 or fewer)</option></select>
        <button className="btn btn-line !px-4 !py-2">Filter</button>
        {(q || cat || stock) && <Link href="/admin/products" className="self-center text-sm underline opacity-60">Clear</Link>}
      </form>
      <div className="overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-left text-sm">
          <thead className="eyebrow border-b border-ink/10 opacity-50"><tr><th className="p-4">Piece</th><th>Category</th><th>Price</th><th>Stock</th><th>Tags</th><th /></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b border-ink/5">
                <td className="p-3"><Link href={`/admin/products/${p.id}`} className="flex items-center gap-3"><div className="h-12 w-12 shrink-0 rounded-xl bg-cream p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full rounded-lg object-cover" /> : <ProductArt category={p.category} metal={p.metal} id={`a-${p.id}`} />}
                </div>{p.name}</Link></td>
                <td className="capitalize">{p.category}</td><td>{money(s.currency, p.price)}</td>
                <td>{p.stock <= 0 ? <span className="rounded-full bg-burgundy/10 px-2 py-0.5 text-xs text-burgundy">Sold out</span> : p.stock <= 3 ? <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs">{p.stock} left</span> : p.stock}</td>
                <td className="text-xs opacity-60">{p.featured && "Featured "}{p.bestseller && "Bestseller"}</td>
                <td className="whitespace-nowrap pr-4 text-right"><Link href={`/product/${p.slug}`} target="_blank" className="mr-4 opacity-60 hover:underline">View ↗</Link><Link href={`/admin/products/${p.id}`} className="underline">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="p-8 text-center opacity-60">{all.length ? "No products match." : "No products yet. Add your first piece."}</p>}
      </div>
    </div>
  );
}
