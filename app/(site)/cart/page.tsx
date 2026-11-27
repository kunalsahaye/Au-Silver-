import CartView, { type Live } from "@/components/CartView";
import { getProducts } from "@/lib/store";
import { siteContent } from "@/lib/site";
import { words } from "@/lib/words";

export const metadata = { title: "Your bag", robots: { index: false, follow: true } };

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [products, c] = await Promise.all([getProducts(), siteContent()]);
  const s = c.site;
  const live: Record<string, Live> = Object.fromEntries(products.map((p) => [p.slug, { name: p.name, price: Number(p.price), stock: p.stock }]));
  const pl = c.plugins;
  const upsell = pl.upsell.on ? products.filter((p) => p.stock > 0).sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || Number(b.featured) - Number(a.featured)).slice(0, 10)
    .map((p) => ({ slug: p.slug, name: p.name, price: Number(p.price), image: p.image_url || p.images[0] || s.productPlaceholder, category: p.category, metal: p.metal })) : [];
  return <CartView currency={s.currency} live={live} shipping={{ shippingFee: s.shippingFee, freeShippingOver: s.freeShippingOver }} w={words(c.words)}
    extras={{ coupons: pl.coupons.on && c.coupons.some((x) => x.on), shipBar: pl.shipBar.on, upsellTitle: pl.upsell.cartTitle, upsell }} />;
}
