import Link from "next/link";
import { notFound } from "next/navigation";
import { upsertProduct, removeProduct } from "../../../actions";
import ImageField from "@/components/admin/ImageField";
import { getRole } from "@/lib/auth";
import { getProducts } from "@/lib/store";
import { blobEnabled } from "@/lib/uploads";
import { cats } from "@/lib/format";

const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block opacity-60">{t}</span>{children}</label>;

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "new" ? null : (await getProducts()).find((x) => x.id === id) ?? null;
  if (id !== "new" && !p) notFound();
  const role = await getRole();
  return (
    <div className="max-w-2xl">
      <Link href="/admin/products" className="text-sm opacity-60 hover:underline">← All products</Link>
      <h1 className="serif mb-6 mt-2 text-4xl italic">{p ? "Edit product" : "New product"}</h1>
      <form action={upsertProduct} className="space-y-4 rounded-2xl bg-white p-7">
        <input type="hidden" name="id" defaultValue={p?.id} />
        <ImageField name="image_url" label="Product photo" defaultValue={p?.image_url ?? ""} blob={blobEnabled}
          hint="Square photos look best. JPG, PNG or WebP up to 10 MB. Without a photo the shop shows an illustration." />
        <L t="Name"><input name="name" defaultValue={p?.name} className="field" required /></L>
        <div className="grid grid-cols-2 gap-4">
          <L t="Category"><select name="category" defaultValue={p?.category} className="field capitalize">{cats.map((c) => <option key={c}>{c}</option>)}</select></L>
          <L t="Metal tone"><select name="metal" defaultValue={p?.metal ?? "silver"} className="field">{["silver", "gold", "rose"].map((c) => <option key={c}>{c}</option>)}</select></L>
          <L t="Price"><input name="price" type="number" min="0" step="1" defaultValue={p?.price} className="field" required /></L>
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
        <button className="btn btn-dark">Save product</button>
      </form>
      {p && role === "admin" && (
        <form action={removeProduct} className="mt-4"><input type="hidden" name="id" value={p.id} /><button className="text-sm text-burgundy underline">Delete product</button></form>
      )}
    </div>
  );
}
