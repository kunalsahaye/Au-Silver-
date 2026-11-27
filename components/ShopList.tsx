import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import JsonLd from "@/components/JsonLd";
import { getProducts } from "@/lib/store";
import { baseUrl, breadcrumbLd } from "@/lib/seo";
import { words } from "@/lib/words";
import type { CategoryItem, Content } from "@/lib/types";

export type ShopQuery = { q?: string; metal?: string; sort?: string; stock?: string; min?: string; max?: string; page?: string };
const PER_PAGE = 24;
const SORTS: [string, string][] = [["", "Recommended"], ["new", "Newest"], ["low", "Price: low to high"], ["high", "Price: high to low"], ["name", "Name A–Z"]];

/** True when the address has filters, so search engines should not index this exact view. */
export const isFiltered = (q: ShopQuery) => !!(q.q || q.metal || q.sort || q.stock || q.min || q.max);

/** Product listing with category navigation, search, filters, sorting and pages. */
export default async function ShopList({ c, cat, q }: { c: Content; cat: CategoryItem | null; q: ShopQuery }) {
  const s = c.site, w = words(c.words);
  const all = await getProducts();
  const base = await baseUrl(s);
  const parent = cat?.parent ? c.categories.find((x) => x.slug === cat.parent) ?? null : null;
  const inCat = (slug: string) => {
    if (!cat) return true;
    if (slug === cat.slug) return true;
    return c.categories.some((x) => x.slug === slug && x.parent === cat.slug); // products in sub-categories count too
  };
  const term = (q.q ?? "").trim().toLowerCase();
  const min = Number(q.min) || 0, max = Number(q.max) || Infinity;
  let list = all.filter((p) =>
    inCat(p.category) && (!q.metal || p.metal === q.metal) && (q.stock !== "in" || p.stock > 0) &&
    p.price >= min && p.price <= max &&
    (!term || `${p.name} ${p.description} ${p.material} ${p.finish}`.toLowerCase().includes(term)));
  const by: Record<string, (a: typeof list[0], b: typeof list[0]) => number> = {
    new: (a, b) => b.created_at.localeCompare(a.created_at), low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
    "": (a, b) => Number(b.bestseller) + Number(b.featured) - Number(a.bestseller) - Number(a.featured) || Number(b.stock > 0) - Number(a.stock > 0),
  };
  list = [...list].sort(by[q.sort ?? ""] ?? by[""]);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Math.floor(Number(q.page) || 1)));
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const path = cat ? `/shop/${cat.slug}` : "/shop";
  const href = (o: Partial<ShopQuery>, to = path) => {
    const sp = new URLSearchParams();
    Object.entries({ ...q, page: undefined, ...o }).forEach(([k, v]) => v && sp.set(k, String(v)));
    return `${to}${sp.size ? `?${sp}` : ""}`;
  };
  const chip = (on: boolean) => `eyebrow whitespace-nowrap rounded-full border px-4 py-2.5 ${on ? "border-ink bg-ink text-ivory" : "border-ink/20 hover:border-ink"}`;
  const top = c.categories.filter((x) => !x.parent);
  const children = cat ? c.categories.filter((x) => x.parent === (cat.parent || cat.slug)) : [];
  const crumbs: [string, string][] = [["Home", "/"], [w.shopAllTitle, "/shop"], ...(parent ? [[parent.name, `/shop/${parent.slug}`] as [string, string]] : []), ...(cat ? [[cat.name, path] as [string, string]] : [])];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <JsonLd data={breadcrumbLd(base, crumbs)} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "ItemList", name: cat?.name ?? w.shopAllTitle,
        itemListElement: shown.map((p, i) => ({ "@type": "ListItem", position: (page - 1) * PER_PAGE + i + 1, url: `${base}/product/${p.slug}`, name: p.name })),
      }} />
      <nav aria-label="Breadcrumb" className="eyebrow mb-6 opacity-60">
        {crumbs.map(([n, h], i) => <span key={h}>{i > 0 && " › "}{i < crumbs.length - 1 ? <Link href={h}>{n}</Link> : <span aria-current="page">{n}</span>}</span>)}
      </nav>
      <h1 className="serif text-5xl italic md:text-6xl">{cat?.name ?? (term ? `“${q.q}”` : w.shopAllTitle)}</h1>
      {cat?.description && <p className="mt-4 max-w-2xl leading-relaxed opacity-75">{cat.description}</p>}

      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
        <Link href={href({}, "/shop")} className={chip(!cat)}>All</Link>
        {top.map((x) => <Link key={x.slug} href={href({}, `/shop/${x.slug}`)} className={chip(cat?.slug === x.slug || parent?.slug === x.slug)}>{x.name}</Link>)}
      </div>
      {children.length > 0 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <Link href={href({}, `/shop/${cat!.parent || cat!.slug}`)} className={chip(!cat!.parent)}>All {(parent ?? cat)!.name}</Link>
          {children.map((x) => <Link key={x.slug} href={href({}, `/shop/${x.slug}`)} className={chip(cat?.slug === x.slug)}>{x.name}</Link>)}
        </div>
      )}

      <form action={path} className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-cream p-4 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-end">
        <label className="col-span-2 text-xs md:col-span-1"><span className="mb-1 block opacity-60">Search</span><input name="q" type="search" defaultValue={q.q} placeholder={w.searchPlaceholder} className="field" /></label>
        <label className="text-xs"><span className="mb-1 block opacity-60">Metal</span>
          <select name="metal" defaultValue={q.metal ?? ""} className="field"><option value="">Any</option><option value="silver">Silver</option><option value="gold">Gold tone</option><option value="rose">Rose tone</option></select></label>
        <label className="text-xs"><span className="mb-1 block opacity-60">Sort</span>
          <select name="sort" defaultValue={q.sort ?? ""} className="field">{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label className="text-xs"><span className="mb-1 block opacity-60">Min price</span><input name="min" type="number" min="0" inputMode="numeric" defaultValue={q.min} className="field" /></label>
        <label className="text-xs"><span className="mb-1 block opacity-60">Max price</span><input name="max" type="number" min="0" inputMode="numeric" defaultValue={q.max} className="field" /></label>
        <div className="col-span-2 flex items-center gap-4 md:col-span-1">
          <label className="flex items-center gap-2 text-xs whitespace-nowrap"><input type="checkbox" name="stock" value="in" defaultChecked={q.stock === "in"} className="h-5 w-5" />{w.inStockOnly}</label>
          <button className="btn btn-dark !px-5 !py-3">Apply</button>
        </div>
      </form>
      {isFiltered(q) && <Link href={path} className="mt-3 inline-block text-xs underline opacity-60">Clear filters</Link>}

      <p className="mt-6 text-sm opacity-60">{list.length} {w.pieces}</p>
      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((p) => <ProductCard key={p.id} p={p} cur={s.currency} placeholder={s.productPlaceholder} soldOut={w.soldOut} />)}
      </div>
      {!list.length && <p className="py-20 text-center opacity-60">{w.emptyList}</p>}
      {pages > 1 && (
        <nav aria-label="Pages" className="mt-12 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={n === 1 ? href({}) : `${href({})}${href({}).includes("?") ? "&" : "?"}page=${n}`} aria-current={n === page ? "page" : undefined}
              className={`grid h-11 w-11 place-items-center rounded-full border ${n === page ? "border-ink bg-ink text-ivory" : "border-ink/20"}`}>{n}</Link>
          ))}
        </nav>
      )}
    </div>
  );
}
