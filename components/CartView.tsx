"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { placeOrder } from "@/app/actions";
import { useCart } from "@/components/CartProvider";
import { money, shippingFor } from "@/lib/format";

export interface Live { name: string; price: number; stock: number }

type Ship = { shippingFee: string; freeShippingOver: string };
function Inner({ currency, live, shipping }: { currency: string; live: Record<string, Live>; shipping: Ship }) {
  const { lines: saved, setQty, clear } = useCart();
  // Show today's names, prices and stock from the shop, not what was saved in the browser.
  const lines = saved.filter((l) => live[l.slug]).map((l) => ({ ...l, ...live[l.slug], qty: Math.min(l.qty, live[l.slug].stock) })).filter((l) => l.qty > 0);
  const subtotal = lines.reduce((a, b) => a + b.price * b.qty, 0);
  const ship = shippingFor(subtotal, shipping);
  const total = subtotal + ship;
  const freeOver = shipping.freeShippingOver === "" ? null : Number(shipping.freeShippingOver);
  const fmt = (n: number) => money(currency, n);
  const sp = useSearchParams();
  const soldOut = sp.get("soldout");
  const placed = sp.get("placed");
  useEffect(() => { if (placed) clear(); }, [placed, clear]);
  if (placed) return (
    <div className="mx-auto max-w-xl px-5 py-28 text-center">
      <h1 className="serif text-5xl italic">Order received</h1>
      <p className="mt-4 opacity-70">Thank you. We will confirm your order and payment details shortly.</p>
      <Link href="/shop" className="btn btn-dark mt-8">Keep shopping</Link>
    </div>
  );
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_1fr]">
      <div>
        <h1 className="serif text-5xl italic">Your bag</h1>
        {!lines.length && <p className="mt-8 opacity-60">Your bag is empty. <Link href="/shop" className="underline">Browse the collection</Link></p>}
        <ul className="mt-8 divide-y divide-ink/10">
          {lines.map((l) => (
            <li key={l.slug} className="flex items-center justify-between gap-4 py-5">
              <div><Link href={`/product/${l.slug}`} className="serif text-xl italic">{l.name}</Link><p className="text-sm opacity-60">{fmt(l.price)}{l.stock <= 3 && ` · only ${l.stock} left`}</p></div>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(l.slug, l.qty - 1)} className="h-8 w-8 rounded-full border border-ink/20">−</button>
                <span className="w-5 text-center text-sm">{l.qty}</span>
                <button disabled={l.qty >= l.stock} onClick={() => setQty(l.slug, l.qty + 1)} className="h-8 w-8 rounded-full border border-ink/20 disabled:opacity-30">+</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {lines.length > 0 && (
        <form action={placeOrder} className="space-y-3 self-start rounded-[2rem] bg-cream p-8">
          {sp.get("error") && <p className="text-sm text-burgundy">Please complete all required fields.</p>}
          {soldOut && <p className="text-sm text-burgundy">Sorry, {soldOut} just sold out or has too little stock. Please adjust your bag.</p>}
          <input type="hidden" name="items" value={JSON.stringify(lines.map(({ slug, qty }) => ({ slug, qty })))} />
          <input name="name" placeholder="Full name" className="field" required />
          <input name="email" type="email" placeholder="Email" className="field" required />
          <input name="phone" placeholder="Phone" className="field" />
          <textarea name="address" rows={3} placeholder="Delivery address" className="field" required />
          <div className="space-y-1 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{ship ? fmt(ship) : "Free"}</span></div>
            {ship > 0 && freeOver !== null && <p className="text-xs opacity-60">Add {fmt(freeOver - subtotal)} more for free shipping.</p>}
          </div>
          <div className="flex justify-between text-lg"><span>Total</span><span>{fmt(total)}</span></div>
          <button className="btn btn-dark w-full">Place order</button>
          <p className="text-xs opacity-50">We will contact you to confirm and arrange payment.</p>
        </form>
      )}
    </div>
  );
}
export default function CartView(props: { currency: string; live: Record<string, Live>; shipping: Ship }) { return <Suspense><Inner {...props} /></Suspense>; }
