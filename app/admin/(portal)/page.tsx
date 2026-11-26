import Link from "next/link";
import { getEnquiries, getOrders, getProducts, getViews } from "@/lib/store";

export default async function Dashboard() {
  const [views, enquiries, orders, products] = await Promise.all([getViews(), getEnquiries(), getOrders(), getProducts()]);
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const days = Array.from({ length: 14 }, (_, i) => day(new Date(Date.now() - (13 - i) * 864e5)));
  const per = Object.fromEntries(days.map((d) => [d, 0]));
  views.forEach((v) => { const d = v.created_at.slice(0, 10); if (d in per) per[d]++; });
  const max = Math.max(1, ...Object.values(per));
  const top = Object.entries(views.reduce<Record<string, number>>((a, v) => ((a[v.path] = (a[v.path] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((a, b) => a + Number(b.total), 0);
  const stats = [
    ["Page views (30d)", views.length], ["New enquiries", enquiries.filter((e) => e.status === "new").length],
    ["New orders", orders.filter((o) => o.status === "new").length], ["Revenue", `₹${revenue.toLocaleString("en-IN")}`],
    ["Products", products.length],
  ];
  return (
    <div className="space-y-8">
      <h1 className="serif text-4xl italic">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(([k, v]) => <div key={k} className="rounded-2xl bg-white p-5"><p className="eyebrow opacity-50">{k}</p><p className="serif mt-2 text-3xl">{v}</p></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl bg-white p-6">
          <p className="mb-5 font-medium">Visits, last 14 days</p>
          <div className="flex h-44 items-end gap-2">
            {days.map((d) => (
              <div key={d} className="flex flex-1 flex-col items-center gap-2" title={`${d}: ${per[d]}`}>
                <div className="w-full rounded-t-lg bg-burgundy/80" style={{ height: `${(per[d] / max) * 100}%`, minHeight: 3 }} />
                <span className="text-[10px] opacity-50">{d.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6">
          <p className="mb-4 font-medium">Top pages</p>
          {top.length === 0 && <p className="text-sm opacity-50">No visits yet.</p>}
          <ul className="space-y-2 text-sm">{top.map(([p, n]) => <li key={p} className="flex justify-between"><span className="truncate">{p}</span><span className="opacity-60">{n}</span></li>)}</ul>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-6">
        <div className="mb-4 flex justify-between"><p className="font-medium">Latest enquiries</p><Link href="/admin/enquiries" className="text-sm underline">All</Link></div>
        {enquiries.slice(0, 4).map((e) => <div key={e.id} className="border-t border-ink/10 py-3 text-sm"><b>{e.name}</b> <span className="opacity-60">· {e.email}</span><p className="line-clamp-1 opacity-70">{e.message}</p></div>)}
        {!enquiries.length && <p className="text-sm opacity-50">Nothing yet.</p>}
      </div>
    </div>
  );
}
