import Link from "next/link";
import { notFound } from "next/navigation";
import { upsertProduct, removeProduct } from "../../../actions";
import GalleryField from "@/components/admin/GalleryField";
import SeoFields from "@/components/admin/SeoFields";
import { getRole } from "@/lib/auth";
import { getDraft, getProducts } from "@/lib/store";

const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block opacity-60">{t}</span>{children}</label>;

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "new" ? null : (await getProducts()).find((x) => x.id === id) ?? null;
  if (id !== "new" && !p) notFound();
  const role = await getRole();
  const { content } = await getDraft();
  const cats = content.categories;
  const ordered = cats.filter((c) => !c.parent).flatMap((c) => [c, ...cats.filter((x) => x.parent === c.slug)]);
  const site = content.site.siteUrl || "https://your-shop.com";
  const photos = p ? [p.image_url ?? "", ...p.images].filter(Boolean) : [];
  return (
    <div className="max-w-2xl">
      <Link href="/admin/products" className="text-sm opacity-60 hover:underline">← All products</Link>
      <h1 className="serif mb-6 mt-2 text-4xl italic">{p ? "Edit product" : "New product"}</h1>
      <form action={upsertProduct} className="space-y-4 rounded-2xl bg-white p-7">
        <input type="hidden" name="id" defaultValue={p?.id} />
        <GalleryField name="images" defaultValue={photos} />
        <L t="Name"><input name="name" defaultValue={p?.name} className="field" required /></L>
        <div className="grid grid-cols-2 gap-4">
          <L t="Category"><select name="category" defaultValue={p?.category} className="field">{ordered.map((c) => <option key={c.slug} value={c.slug}>{c.parent ? `— ${c.name}` : c.name}</option>)}</select></L>
          <L t="Metal tone"><select name="metal" defaultValue={p?.metal ?? "silver"} className="field">{["silver", "gold", "rose"].map((c) => <option key={c}>{c}</option>)}</select></L>
          <L t="Price"><input name="price" type="number" min="0" step="1" defaultValue={p?.price} className="field" required /></L>
          <L t="Old price, crossed out (optional, for a sale)"><input name="compareAt" type="number" min="0" step="1" defaultValue={p?.seo.compareAt || ""} className="field" placeholder="Leave empty if not on sale" /></L>
          <L t="Stock (pieces available)"><input name="stock" type="number" min="0" step="1" defaultValue={p?.stock ?? 10} className="field" /></L>
        </div>
        <L t="Description"><textarea name="description" rows={3} defaultValue={p?.description} className="field" /></L>
        <div className="grid grid-cols-2 gap-4">
          <L t="Material"><input name="material" defaultValue={p?.material ?? "925 Sterling Silver"} className="field" /></L>
          <L t="Finish"><input name="finish" defaultValue={p?.finish} className="field" /></L>
        </div>
        <L t="Web address (optional, made from the name if blank)"><input name="slug" defaultValue={p?.slug} className="field" placeholder="e.g. twist-ring" /></L>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={p?.featured} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="bestseller" defaultChecked={p?.bestseller} /> Bestseller</label>
        </div>
        <L t="Photo description for Google and screen readers"><input name="alt" defaultValue={p?.seo.alt} className="field" placeholder={p ? `${p.name}, ${p.material || "925 sterling silver"}` : "e.g. Silver twist ring on a white background"} /></L>
        <details className="rounded-xl border border-[#e6dcd2] p-4" open={!!(p?.seo.title || p?.seo.description)}>
          <summary className="cursor-pointer text-sm font-medium">Google and search settings</summary>
          <div className="mt-4 space-y-4">
            <SeoFields title={p?.seo.title} description={p?.seo.description}
              fallbackTitle={`${p?.name ?? "Product name"} | ${content.site.brand}`}
              fallbackDescription={(p?.description || "Product description").slice(0, 160)}
              url={`${site}/product/${p?.slug ?? "your-product"}`} />
            <L t="SKU or product code (optional, used by Google Shopping)"><input name="sku" defaultValue={p?.seo.sku} className="field" /></L>
          </div>
        </details>
        <button className="btn btn-dark">Save product</button>
      </form>
      {p && role === "admin" && (
        <form action={removeProduct} className="mt-4"><input type="hidden" name="id" value={p.id} /><button className="text-sm text-burgundy underline">Delete product</button></form>
      )}
    </div>
  );
}
