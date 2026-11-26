import CartView, { type Live } from "@/components/CartView";
import { getProducts, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [products, s] = await Promise.all([getProducts(), getSettings()]);
  const live: Record<string, Live> = Object.fromEntries(products.map((p) => [p.slug, { name: p.name, price: Number(p.price), stock: p.stock }]));
  return <CartView currency={s.currency} live={live} />;
}
