import Link from "next/link";
import ProductArt from "@/components/ProductArt";
import { getProducts, getSettings } from "@/lib/store";
import { money } from "@/lib/format";

export default async function Products() {
  const [list, s] = await Promise.all([getProducts(), getSettings()]);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="serif text-4xl italic">Products</h1>
        <Link href="/admin/products/new" className="btn btn-dark">+ Add product</Link>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-left text-sm">
          <thead className="eyebrow border-b border-ink/10 opacity-50"><tr><th className="p-4">Piece</th><th>Category</th><th>Price</th><th>Stock</th><th>Tags</th><th /></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b border-ink/5">
                <td className="flex items-center gap-3 p-3"><div className="h-12 w-12 rounded-xl bg-cream p-1">{!p.image_url ? <ProductArt category={p.category} metal={p.metal} id={`a-${p.id}`} /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.image_url} alt="" className="h-full w-full rounded-lg object-cover" />}</div>{p.name}</td>
                <td className="capitalize">{p.category}</td><td>{money(s.currency, p.price)}</td>
                <td className={p.stock <= 0 ? "text-burgundy" : ""}>{p.stock}</td>
                <td className="text-xs opacity-60">{p.featured && "Featured "}{p.bestseller && "Bestseller"}</td>
                <td className="pr-4 text-right"><Link href={`/admin/products/${p.id}`} className="underline">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
