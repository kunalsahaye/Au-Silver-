"use client";
import AddToCart from "@/components/AddToCart";

/** Bar at the bottom of the screen on phones so "Add to bag" is always in reach. */
export default function StickyBuy({ slug, name, price, priceText, soldOut, labels }: {
  slug: string; name: string; price: number; priceText: string; soldOut: boolean; labels: [string, string, string];
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-black/10 bg-ivory/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="min-w-0 flex-1"><p className="truncate text-xs">{name}</p><p className="text-sm font-semibold">{priceText}</p></div>
      <div className="w-44"><AddToCart slug={slug} name={name} price={price} soldOut={soldOut} labels={labels} /></div>
    </div>
  );
}
