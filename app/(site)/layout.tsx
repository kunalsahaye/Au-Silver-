import Link from "next/link";
import CartProvider from "@/components/CartProvider";
import CartLink from "@/components/CartLink";
import Track from "@/components/Track";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const nav = [["Shop", "/shop"], ["Earrings", "/shop?cat=earrings"], ["Rings", "/shop?cat=rings"], ["Bracelets", "/shop?cat=bracelets"], ["About us", "/about"], ["Contact", "/contact"]];
  return (
    <CartProvider>
      <Track />
      <div className="site-theme flex min-h-screen flex-col">
        <div className="bg-[#24140b] px-4 py-2 text-center text-[10px] tracking-wide text-white/80">{s.announcement}</div>
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
          <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
            <nav className="hidden gap-5 text-[11px] md:flex">{nav.map(([l, h]) => <Link key={l} href={h} className="hover:opacity-50">{l}</Link>)}</nav>
            <span className="text-[11px] md:hidden">≡</span>
            <Link href="/" className="text-center text-xl font-extrabold tracking-[-0.04em] uppercase">{s.brand}</Link>
            <div className="flex items-center justify-end gap-5 text-[11px]"><span className="hidden sm:block">Wishlist</span><CartLink /></div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-[#24140b] text-white">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
            <div>
              <p className="text-lg font-extrabold tracking-[-0.04em] uppercase">{s.brand}</p>
              <p className="mt-6 text-[11px] opacity-60">Get first dibs on drops, design updates and offers.</p>
              <div className="mt-2 flex border-b border-white/30 pb-2 text-xs"><span className="flex-1 opacity-50">Email</span><span>Sign up</span></div>
            </div>
            <div className="space-y-2 text-[11px] opacity-80"><p className="mb-3 opacity-50">Shop</p><Link className="block" href="/shop">Shop All</Link><Link className="block" href="/shop?cat=rings">Rings</Link><Link className="block" href="/shop?cat=earrings">Earrings</Link><Link className="block" href="/shop?cat=necklaces">Necklaces</Link></div>
            <div className="space-y-2 text-[11px] opacity-80"><p className="mb-3 opacity-50">Collections</p><Link className="block" href="/shop">New in</Link><Link className="block" href="/shop">Bestsellers</Link></div>
            <div className="space-y-2 text-[11px] opacity-80"><p className="mb-3 opacity-50">Help</p><Link className="block" href="/contact">Contact</Link><p>Shipping</p><p>Returns</p></div>
            <div className="space-y-2 text-[11px] opacity-80"><p className="mb-3 opacity-50">{s.brand}</p><Link className="block" href="/about">About</Link><p>{s.instagram}</p><p>{s.email}</p></div>
          </div>
          <div className="mx-auto flex max-w-[1280px] justify-between border-t border-white/10 px-6 py-5 text-[10px] opacity-50"><span>© {new Date().getFullYear()} {s.brand}</span><span>Privacy Policy · Cookie Policy</span></div>
        </footer>
      </div>
    </CartProvider>
  );
}
