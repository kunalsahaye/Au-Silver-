"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";

/** Add to bag. With `stock` it also shows a quantity picker and a "Buy now" button that goes straight to checkout. */
export default function AddToCart({ slug, name, price, image, soldOut, stock, buyNow, labels = ["Add to bag", "Added to bag ✓", "Sold out"] }: {
  slug: string; name: string; price: number; image?: string; soldOut: boolean; stock?: number; buyNow?: string; labels?: [string, string, string];
}) {
  const { add, lines } = useCart();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [qty, setQty] = useState(1);
  const inBag = lines.find((l) => l.slug === slug)?.qty ?? 0;
  const max = Math.max(0, Math.min(20, (stock ?? 20) - inBag));
  const n = Math.min(qty, Math.max(1, max));
  const full = !soldOut && max === 0;
  return (
    <div className="space-y-3">
      {stock !== undefined && !soldOut && (
        <div className="flex items-center gap-4">
          <span className="text-[11px] tracking-[0.14em] uppercase opacity-60" id={`q-${slug}`}>Quantity</span>
          <div className="flex items-center border border-ink/20" role="group" aria-labelledby={`q-${slug}`}>
            <button type="button" onClick={() => setQty(Math.max(1, n - 1))} disabled={n <= 1} aria-label="One less" className="h-11 w-11 disabled:opacity-30">−</button>
            <output aria-live="polite" className="w-8 text-center text-sm tabular-nums">{n}</output>
            <button type="button" onClick={() => setQty(Math.min(max, n + 1))} disabled={n >= max} aria-label="One more" className="h-11 w-11 disabled:opacity-30">+</button>
          </div>
          {full && <span className="text-xs opacity-60">All available pieces are in your bag.</span>}
        </div>
      )}
      <button type="button" disabled={soldOut || full}
        onClick={() => { add({ slug, name, price, image, stock }, n); setDone(true); setQty(1); setTimeout(() => setDone(false), 1800); }}
        className="btn btn-dark w-full disabled:opacity-40">
        {soldOut ? labels[2] : done ? labels[1] : labels[0]}
      </button>
      {buyNow && !soldOut && (
        <button type="button" disabled={full && !inBag}
          onClick={() => { if (!full) add({ slug, name, price, image, stock }, n, true); router.push("/cart"); }}
          className="btn btn-line w-full disabled:opacity-40">{buyNow}</button>
      )}
    </div>
  );
}
