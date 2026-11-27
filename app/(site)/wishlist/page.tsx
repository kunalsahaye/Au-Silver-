import { WishlistView } from "@/components/Wishlist";
import { getProducts } from "@/lib/store";
import { siteContent } from "@/lib/site";
import { words } from "@/lib/words";

export const metadata = { title: "Wishlist", robots: { index: false } };

export default async function Wishlist() {
  const [c, all] = await Promise.all([siteContent(), getProducts()]);
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16 md:py-20">
      <h1 className="mb-10 text-5xl tracking-[-0.045em] md:text-6xl">Wishlist</h1>
      <WishlistView products={all} cur={c.site.currency} placeholder={c.site.productPlaceholder} soldOut={words(c.words).soldOut} />
    </div>
  );
}
