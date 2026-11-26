import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/store";
import { siteContent } from "@/lib/site";

export default async function Shop({ searchParams }: { searchParams: Promise<{ cat?: string; metal?: string; sort?: string }> }) {
  const { cat, metal, sort } = await searchParams;
  const [c, all] = await Promise.all([siteContent(), getProducts()]);
  const s = c.site;
  const current = c.categories.find((x) => x.slug === cat);
  let list = all.filter((p) => (!cat || p.category === cat) && (!metal || p.metal === metal));
  if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
  const q = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams(); const m = { cat, metal, sort, ...o };
    Object.entries(m).forEach(([k, v]) => v && p.set(k, v));
    return `/shop${p.size ? `?${p}` : ""}`;
  };
  const pill = (on: boolean) => `eyebrow rounded-full border px-4 py-2 ${on ? "border-ink bg-ink text-ivory" : "border-ink/20 hover:border-ink"}`;
  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <h1 className="serif text-5xl italic md:text-6xl">{current?.name ?? (cat ? cat : "All jewellery")}</h1>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link href={q({ cat: undefined })} className={pill(!cat)}>All</Link>
        {c.categories.map((x) => <Link key={x.slug} href={q({ cat: x.slug })} className={pill(cat === x.slug)}>{x.name}</Link>)}
        <span className="mx-2 hidden h-5 w-px bg-ink/20 sm:block" />
        {["gold", "silver", "rose"].map((m) => <Link key={m} href={q({ metal: metal === m ? undefined : m })} className={pill(metal === m)}>{m}</Link>)}
        <span className="ml-auto flex gap-2">
          <Link href={q({ sort: "low" })} className={pill(sort === "low")}>Price ↑</Link>
          <Link href={q({ sort: "high" })} className={pill(sort === "high")}>Price ↓</Link>
        </span>
      </div>
      <p className="mt-6 text-sm opacity-60">{list.length} pieces</p>
      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {list.map((p) => <ProductCard key={p.id} p={p} cur={s.currency} />)}
      </div>
      {!list.length && <p className="py-20 text-center opacity-60">Nothing here yet.</p>}
    </div>
  );
}
