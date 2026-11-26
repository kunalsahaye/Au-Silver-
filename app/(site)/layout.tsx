import Link from "next/link";
import CartProvider from "@/components/CartProvider";
import CartLink from "@/components/CartLink";
import Track from "@/components/Track";
import { siteContent } from "@/lib/site";

export const dynamic = "force-dynamic";

const igUrl = (h: string) => (/^https?:\/\//.test(h) ? h : `https://instagram.com/${h.replace(/^@/, "")}`);

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const c = await siteContent();
  const s = c.site;
  const nav: [string, string][] = [
    ["Shop", "/shop"],
    ...c.categories.filter((x) => x.inMenu).map((x): [string, string] => [x.name, `/shop?cat=${x.slug}`]),
    ...c.pages.filter((p) => p.inMenu).map((p): [string, string] => [p.title, `/${p.slug}`]),
  ];
  return (
    <CartProvider>
      <Track />
      <div className="site-theme flex min-h-screen flex-col">
        {c.preview && (
          <div className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-4 bg-[#b8924a] px-4 py-2 text-center text-xs text-black">
            <b>Preview: you are seeing your unpublished changes.</b>
            <Link href="/admin" className="underline">Back to admin to publish</Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a route handler, needs a full page load */}
            <a href="/admin/preview/exit" className="underline">Exit preview</a>
          </div>
        )}
        {s.announcement && <div className="bg-[#24140b] px-4 py-2 text-center text-[10px] tracking-wide text-white/80">{s.announcement}</div>}
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
          <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
            <nav className="hidden flex-wrap gap-x-5 gap-y-1 text-[11px] md:flex">{nav.map(([l, h]) => <Link key={h} href={h} className="hover:opacity-50">{l}</Link>)}</nav>
            <details className="relative md:hidden">
              <summary className="list-none text-lg">≡</summary>
              <nav className="absolute top-8 left-0 z-50 w-56 space-y-3 bg-white p-5 text-sm shadow-xl">{nav.map(([l, h]) => <Link key={h} href={h} className="block">{l}</Link>)}</nav>
            </details>
            <Link href="/" className="text-center text-xl font-extrabold tracking-[-0.04em] uppercase">{s.brand}</Link>
            <div className="flex items-center justify-end gap-5 text-[11px]"><CartLink /></div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-[#24140b] text-white">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="text-lg font-extrabold tracking-[-0.04em] uppercase">{s.brand}</p>
              <p className="mt-4 max-w-xs text-[11px] opacity-60">{s.tagline}</p>
            </div>
            <div className="space-y-2 text-[11px] opacity-80"><p className="mb-3 opacity-50">Shop</p><Link className="block" href="/shop">Shop all</Link>{c.categories.map((x) => <Link key={x.slug} className="block" href={`/shop?cat=${x.slug}`}>{x.name}</Link>)}</div>
            <div className="space-y-2 text-[11px] opacity-80"><p className="mb-3 opacity-50">Help</p>{c.pages.map((p) => <Link key={p.slug} className="block" href={`/${p.slug}`}>{p.title}</Link>)}</div>
            <div className="space-y-2 text-[11px] opacity-80"><p className="mb-3 opacity-50">Get in touch</p>{s.instagram && <a className="block" href={igUrl(s.instagram)} target="_blank" rel="noreferrer">Instagram {s.instagram}</a>}<p>{s.email}</p><p>{s.phone}</p></div>
          </div>
          <div className="mx-auto flex max-w-[1280px] justify-between border-t border-white/10 px-6 py-5 text-[10px] opacity-50"><span>© {new Date().getFullYear()} {s.brand}</span></div>
        </footer>
      </div>
    </CartProvider>
  );
}
