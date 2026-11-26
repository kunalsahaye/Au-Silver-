import { upsertProduct, removeProduct } from "../../../actions";
import { getRole } from "@/lib/auth";
import { getProducts } from "@/lib/store";
import { cats } from "@/lib/format";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === "new" ? null : (await getProducts()).find((x) => x.id === id) ?? null;
  const role = await getRole();
  const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block opacity-60">{t}</span>{children}</label>;
  return (
    <div className="max-w-2xl">
      <h1 className="serif mb-6 text-4xl italic">{p ? "Edit product" : "New product"}</h1>
      <form action={upsertProduct} className="space-y-4 rounded-2xl bg-white p-7">
        <input type="hidden" name="id" defaultValue={p?.id} />
        <L t="Name"><input name="name" defaultValue={p?.name} className="field" required /></L>
        <div className="grid grid-cols-2 gap-4">
          <L t="Category"><select name="category" defaultValue={p?.category} className="field capitalize">{cats.map((c) => <option key={c}>{c}</option>)}</select></L>
          <L t="Metal tone"><select name="metal" defaultValue={p?.metal} className="field">{["gold", "silver", "rose"].map((c) => <option key={c}>{c}</option>)}</select></L>
          <L t="Price"><input name="price" type="number" step="1" defaultValue={p?.price} className="field" required /></L>
          <L t="Stock"><input name="stock" type="number" defaultValue={p?.stock ?? 10} className="field" /></L>
        </div>
        <L t="Description"><textarea name="description" rows={3} defaultValue={p?.description} className="field" /></L>
        <div className="grid grid-cols-2 gap-4">
          <L t="Material"><input name="material" defaultValue={p?.material} className="field" /></L>
          <L t="Finish"><input name="finish" defaultValue={p?.finish} className="field" /></L>
        </div>
        <L t="Photo URL (optional; leave blank to use the illustration)"><input name="image_url" defaultValue={p?.image_url ?? ""} className="field" placeholder="https://…" /></L>
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
