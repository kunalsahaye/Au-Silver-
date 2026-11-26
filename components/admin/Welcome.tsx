import Link from "next/link";

const tiles = [
  { href: "/admin/products/new", title: "Add a product", text: "Name, price, photos, stock", icon: "+" },
  { href: "/admin/products", title: "Edit products", text: "Change prices, photos, stock", icon: "✎" },
  { href: "/admin/homepage", title: "Change the homepage", text: "Sections, photos, order", icon: "⌂" },
  { href: "/admin/homepage/slides", title: "Homepage slides", text: "Photos or videos at the top", icon: "▶" },
  { href: "/admin/homepage/customers", title: "Happy customers", text: "Customer photos, videos, notes", icon: "♥" },
  { href: "/admin/categories", title: "Categories", text: "Menu, category photos", icon: "▦" },
  { href: "/admin/pages", title: "Pages", text: "About, Contact, FAQ", icon: "¶" },
  { href: "/admin/settings", title: "Shop settings", text: "Offers, shipping, Instagram", icon: "⚙" },
  { href: "/admin/seo", title: "Google and SEO", text: "Search, Maps, Shopping, sharing", icon: "G" },
  { href: "/admin/words", title: "Words on the site", text: "Buttons, headings, messages", icon: "Aa" },
  { href: "/admin/orders", title: "Orders", text: "New orders and their status", icon: "☰" },
  { href: "/", title: "View the shop", text: "Opens your live website", icon: "↗", external: true },
];

/** Big, touch-friendly shortcuts at the top of the admin home (designed for iPad). */
export default function Welcome({ newOrders = 0 }: { newOrders?: number }) {
  return (
    <section className="mb-10">
      <h1 className="serif text-4xl italic">Hi! What would you like to do?</h1>
      <p className="mt-2 mb-6 opacity-70">Tap a box to get started. Product changes go live straight away. Homepage, pages and settings go live when you press “Publish”.</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
        {tiles.map((t) => (
          <Link key={t.title} href={t.href} target={t.external ? "_blank" : undefined}
            className="group relative block min-h-[110px] rounded-2xl border border-[#e6dcd2] bg-white p-5 transition hover:-translate-y-0.5 hover:border-burgundy/40 hover:shadow-md active:scale-[.99]">
            <span className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-[#f2ece6] text-base group-hover:bg-burgundy group-hover:text-ivory">{t.icon}</span>
            <strong className="block text-lg leading-tight">{t.title}</strong>
            <span className="mt-1 block text-sm opacity-60">{t.text}</span>
            {t.href === "/admin/orders" && newOrders > 0 && <span className="absolute top-4 right-4 rounded-full bg-burgundy px-2.5 py-0.5 text-xs text-ivory">{newOrders} new</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
