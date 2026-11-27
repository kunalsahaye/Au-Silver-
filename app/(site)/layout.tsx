import Link from "next/link";
import CartProvider from "@/components/CartProvider";
import CartLink from "@/components/CartLink";
import { WishLink } from "@/components/Wishlist";
import Track from "@/components/Track";
import { siteContent } from "@/lib/site";
import { sameAs } from "@/lib/seo";
import { words } from "@/lib/words";
import { fontsHref, themeVars } from "@/lib/theme";
import Popup from "@/components/plugins/Popup";
import SignupForm from "@/components/plugins/SignupForm";
import WhatsApp from "@/components/plugins/WhatsApp";

export const dynamic = "force-dynamic";

const LEGAL = ["privacy", "terms"];
const socialName = (u: string) => {
  const host = u.replace(/^https?:\/\/(www\.)?/, "");
  const known: Record<string, string> = { "instagram.com": "Instagram", "facebook.com": "Facebook", "youtube.com": "YouTube", "pinterest.com": "Pinterest", "x.com": "X", "twitter.com": "X" };
  const k = Object.keys(known).find((d) => host.startsWith(d));
  return k ? known[k] : host.replace(/\/$/, "");
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const c = await siteContent();
  const s = c.site;
  const w = words(c.words);
  const top = c.categories.filter((x) => !x.parent);
  const subs = (slug: string) => c.categories.filter((x) => x.parent === slug);
  const menuCats = c.categories.filter((x) => x.inMenu && !x.parent);
  const menuPages = c.pages.filter((p) => p.inMenu);
  const social = sameAs(s);
  const wa = s.whatsapp.replace(/[^0-9]/g, "");
  const pl = c.plugins;
  const fonts = fontsHref(c.theme);
  return (
    <CartProvider>
      <Track />
      {fonts && <><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link rel="stylesheet" href={fonts} precedence="default" /></>}
      <div className="site-theme flex min-h-screen flex-col" style={themeVars(c.theme)}>
        {c.preview && (
          <div className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-4 bg-gold px-4 py-2 text-center text-xs text-black">
            <b>Preview: you are seeing your unpublished changes.</b>
            <Link href="/admin" className="underline">Back to admin to publish</Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a route handler, needs a full page load */}
            <a href="/admin/preview/exit" className="underline">Exit preview</a>
          </div>
        )}
        {s.announcement && <div className="bg-[var(--bar)] px-4 py-2 text-center text-[10px] tracking-wide text-white/80">{s.announcement}</div>}
        <header className="sticky top-0 z-40 border-b border-black/5 bg-ivory/95 backdrop-blur">
          <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
            <nav aria-label="Main" className="hidden flex-wrap items-center gap-x-5 gap-y-1 text-[11px] md:flex">
              <Link href="/shop" className="hover:opacity-50">{w.footerShop}</Link>
              {menuCats.map((x) => (
                <div key={x.slug} className="group relative">
                  <Link href={`/shop/${x.slug}`} className="hover:opacity-50">{x.name}</Link>
                  {subs(x.slug).length > 0 && (
                    <div className="invisible absolute top-full left-0 z-50 min-w-44 space-y-2 bg-white p-4 pt-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                      {subs(x.slug).map((y) => <Link key={y.slug} href={`/shop/${y.slug}`} className="block hover:opacity-50">{y.name}</Link>)}
                    </div>
                  )}
                </div>
              ))}
              {menuPages.map((p) => <Link key={p.slug} href={`/${p.slug}`} className="hover:opacity-50">{p.title}</Link>)}
            </nav>
            <details className="relative md:hidden">
              <summary className="list-none p-2" aria-label="Menu"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M3 7h18M3 12h18M3 17h18" /></svg></summary>
              <nav aria-label="Mobile" className="absolute top-10 left-0 z-50 w-64 space-y-3 bg-white p-5 text-sm shadow-xl">
                <form action="/shop" role="search"><input name="q" type="search" placeholder={w.searchPlaceholder} aria-label="Search jewellery" className="field !py-2" /></form>
                <Link href="/shop" className="block font-semibold">{w.footerShop}</Link>
                {top.map((x) => (
                  <div key={x.slug}>
                    <Link href={`/shop/${x.slug}`} className="block">{x.name}</Link>
                    {subs(x.slug).map((y) => <Link key={y.slug} href={`/shop/${y.slug}`} className="mt-2 block pl-4 opacity-70">{y.name}</Link>)}
                  </div>
                ))}
                <Link href="/wishlist" className="block">Wishlist</Link>
                <hr className="opacity-20" />
                {c.pages.map((p) => <Link key={p.slug} href={`/${p.slug}`} className="block">{p.title}</Link>)}
              </nav>
            </details>
            <Link href="/" className="text-center text-xl font-extrabold tracking-[-0.04em] uppercase" aria-label={`${s.brand} home`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {s.logo ? <img src={s.logo} alt={s.brand} className="mx-auto h-8 w-auto md:h-10" /> : s.brand}
            </Link>
            <div className="flex items-center justify-end gap-4 text-[11px] md:gap-5">
              <details className="relative hidden md:block">
                <summary className="list-none p-1 hover:opacity-60" aria-label="Search"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg></summary>
                <form action="/shop" role="search" className="absolute top-10 right-0 z-50 flex w-[min(80vw,340px)] gap-2 bg-white p-3 shadow-xl">
                  <input name="q" type="search" placeholder={w.searchPlaceholder} aria-label="Search jewellery" className="field !py-2" autoFocus />
                  <button className="btn btn-dark !px-4 !py-2">Go</button>
                </form>
              </details>
              <span className="hidden md:inline-flex"><WishLink /></span>
              <CartLink />
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        {pl.popup.on && <Popup p={pl.popup} button={w.subscribeButton} placeholder={w.emailPlaceholder} />}
        {pl.whatsapp.on && <WhatsApp number={pl.whatsapp.number || s.whatsapp} text={pl.whatsapp.text} />}
        <footer className="bg-[var(--bar)] text-white">
          {pl.newsletter.on && (
            <div className="border-b border-white/10">
              <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-6 py-12 md:flex-row md:items-center md:justify-between">
                <div><h2 className="text-2xl tracking-[-0.03em]">{pl.newsletter.title}</h2>{pl.newsletter.text && <p className="mt-1 text-xs opacity-60">{pl.newsletter.text}</p>}</div>
                <SignupForm source="footer" button={w.subscribeButton} placeholder={w.emailPlaceholder} dark />
              </div>
            </div>
          )}
          <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="text-lg font-extrabold tracking-[-0.04em] uppercase">{s.brand}</p>
              <p className="mt-4 max-w-xs text-[11px] opacity-60">{s.tagline}</p>
              {(s.address || s.city) && (
                <address className="mt-4 text-[11px] not-italic opacity-60">{[s.address, s.city, s.region, s.postalCode].filter(Boolean).join(", ")}</address>
              )}
            </div>
            <nav aria-label="Shop" className="space-y-2 text-[11px] opacity-80"><p className="mb-3 opacity-50">{w.footerShop}</p><Link className="block" href="/shop">{w.shopAllTitle}</Link>{top.map((x) => <Link key={x.slug} className="block" href={`/shop/${x.slug}`}>{x.name}</Link>)}</nav>
            <nav aria-label="Help" className="space-y-2 text-[11px] opacity-80"><p className="mb-3 opacity-50">{w.footerHelp}</p>{c.pages.filter((p) => !LEGAL.includes(p.slug)).map((p) => <Link key={p.slug} className="block" href={`/${p.slug}`}>{p.title}</Link>)}<Link className="block" href="/wishlist">Wishlist</Link></nav>
            <div className="space-y-2 text-[11px] opacity-80">
              <p className="mb-3 opacity-50">{w.footerContact}</p>
              {s.email && <a className="block" href={`mailto:${s.email}`}>{s.email}</a>}
              {s.phone && <a className="block" href={`tel:${s.phone.replace(/\s+/g, "")}`}>{s.phone}</a>}
              {wa && <a className="block" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a>}
              {social.map((u) => <a key={u} className="block" href={u} target="_blank" rel="noreferrer me">{socialName(u)}</a>)}
            </div>
          </div>
          <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-3 border-t border-white/10 px-6 py-5 text-[10px] opacity-50">
            <span>© {new Date().getFullYear()} {s.brand} · 925 sterling silver</span>
            <span className="flex gap-5">{c.pages.filter((p) => LEGAL.includes(p.slug)).map((p) => <Link key={p.slug} href={`/${p.slug}`} className="hover:opacity-70">{p.title}</Link>)}</span>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
