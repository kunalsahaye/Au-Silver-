import { orderStatus } from "../../actions";
import { getOrders } from "@/lib/store";

export default async function Orders() {
  const list = await getOrders();
  return (
    <div className="max-w-4xl">
      <h1 className="serif mb-6 text-4xl italic">Orders</h1>
      <div className="space-y-3">
        {list.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-medium">{o.name} · ₹{Number(o.total).toLocaleString("en-IN")}</p><p className="text-sm opacity-60">{o.email}{o.phone && ` · ${o.phone}`} · {new Date(o.created_at).toLocaleString("en-IN")}</p></div>
              <form action={orderStatus} className="flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="field !w-auto !py-1.5 text-sm">{["new", "confirmed", "shipped", "delivered", "cancelled"].map((x) => <option key={x}>{x}</option>)}</select>
                <button className="btn btn-dark !px-4 !py-1.5">Update</button>
              </form>
            </div>
            <p className="mt-3 text-sm opacity-80">{o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</p>
            <p className="mt-1 text-sm opacity-60 whitespace-pre-line">{o.address}</p>
          </div>
        ))}
        {!list.length && <p className="rounded-2xl bg-white p-8 text-center opacity-60">No orders yet.</p>}
      </div>
    </div>
  );
}
