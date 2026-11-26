"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { placeOrder } from "@/app/actions";
import { useCart } from "@/components/CartProvider";

function Inner() {
  const { lines, total, setQty, clear } = useCart();
  const sp = useSearchParams();
  const placed = sp.get("placed");
  useEffect(() => { if (placed) clear(); /* eslint-disable-next-line */ }, [placed]);
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
              <div><Link href={`/product/${l.slug}`} className="serif text-xl italic">{l.name}</Link><p className="text-sm opacity-60">₹{l.price.toLocaleString("en-IN")}</p></div>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(l.slug, l.qty - 1)} className="h-8 w-8 rounded-full border border-ink/20">−</button>
                <span className="w-5 text-center text-sm">{l.qty}</span>
                <button onClick={() => setQty(l.slug, l.qty + 1)} className="h-8 w-8 rounded-full border border-ink/20">+</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {lines.length > 0 && (
        <form action={placeOrder} className="space-y-3 self-start rounded-[2rem] bg-cream p-8">
          {sp.get("error") && <p className="text-sm text-burgundy">Please complete all required fields.</p>}
          <input type="hidden" name="items" value={JSON.stringify(lines)} />
          <input name="name" placeholder="Full name" className="field" required />
          <input name="email" type="email" placeholder="Email" className="field" required />
          <input name="phone" placeholder="Phone" className="field" />
          <textarea name="address" rows={3} placeholder="Delivery address" className="field" required />
          <div className="flex justify-between border-t border-ink/10 pt-4 text-lg"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          <button className="btn btn-dark w-full">Place order</button>
          <p className="text-xs opacity-50">We will contact you to confirm and arrange payment.</p>
        </form>
      )}
    </div>
  );
}
export default function CartPage() { return <Suspense><Inner /></Suspense>; }
