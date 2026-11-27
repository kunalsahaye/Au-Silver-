import Link from "next/link";
import { orderStatus } from "../../actions";
import { getOrders, getSettings } from "@/lib/store";
import { money } from "@/lib/format";

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; soldout?: string }> }) {
  const { status = "", soldout } = await searchParams;
  const [all, s] = await Promise.all([getOrders(), getSettings()]);
  const list = status ? all.filter((o) => o.status === status) : all;
  const count = (st: string) => all.filter((o) => o.status === st).length;
  return (
    <div className="max-w-4xl">
      <h1 className="serif mb-4 text-4xl italic">Orders</h1>
      <p className="mb-4 text-sm opacity-60">Stock is taken out when an order is placed. Setting an order to cancelled puts its pieces back in stock.</p>
      {soldout && <p className="mb-4 rounded-xl bg-burgundy/10 p-3 text-sm text-burgundy">Could not reopen that order: {soldout} no longer has enough stock.</p>}
      <nav className="mb-5 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/orders" className={`rounded-full px-3 py-1 ${!status ? "bg-ink text-ivory" : "bg-white"}`}>All ({all.length})</Link>
        {STATUSES.map((st) => <Link key={st} href={`/admin/orders?status=${st}`} className={`rounded-full px-3 py-1 capitalize ${status === st ? "bg-ink text-ivory" : "bg-white"}`}>{st} ({count(st)})</Link>)}
      </nav>
      <div className="space-y-3">
        {list.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-medium">{o.name} · {money(s.currency, Number(o.total))}</p><p className="text-sm opacity-60"><a href={`mailto:${o.email}`} className="underline">{o.email}</a>{o.phone && ` · ${o.phone}`} · {new Date(o.created_at).toLocaleString("en-IN")}</p></div>
              <form action={orderStatus} className="flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="field !w-auto !py-1.5 text-sm">{STATUSES.map((x) => <option key={x}>{x}</option>)}</select>
                <button className="btn btn-dark !px-4 !py-1.5">Update</button>
              </form>
            </div>
            <ul className="mt-3 text-sm opacity-80">{o.items.map((i) => <li key={i.slug}>{i.name} × {i.qty} <span className="opacity-60">at {money(s.currency, Number(i.price))}</span></li>)}</ul>
            {o.coupon && <p className="mt-1 text-sm text-burgundy">Code {o.coupon}: −{money(s.currency, Number(o.discount) || 0)}</p>}
            <p className="mt-2 whitespace-pre-line text-sm opacity-60">{o.address}</p>
          </div>
        ))}
        {!list.length && <p className="rounded-2xl bg-white p-8 text-center opacity-60">No orders{status && ` marked ${status}`} yet.</p>}
      </div>
    </div>
  );
}
