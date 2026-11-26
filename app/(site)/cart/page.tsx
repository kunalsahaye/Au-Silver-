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
  return <CartView currency={s.currency} live={live} shipping={{ shippingFee: s.shippingFee, freeShippingOver: s.freeShippingOver }} w={words(c.words)} />;
}
