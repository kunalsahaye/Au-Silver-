"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { placeOrder } from "@/app/actions";
import { useCart } from "@/components/CartProvider";
import { money, shippingFor } from "@/lib/format";
import { checkCoupon } from "@/app/actions";
import type { CouponResult } from "@/lib/coupons";
import type { Words } from "@/lib/words";
import type { Metal } from "@/lib/types";
import ProductArt from "@/components/ProductArt";
import { useState } from "react";

export interface Live { name: string; price: number; stock: number }

type Ship = { shippingFee: string; freeShippingOver: string };
export interface Extras { coupons: boolean; shipBar: boolean; upsellTitle: string; upsell: { slug: string; name: string; price: number; image: string; category: string; metal: Metal }[] }
type Props = { currency: string; live: Record<string, Live>; shipping: Ship; w: Words; extras: Extras };
function Inner({ currency, live, shipping, w, extras }: Props) {
  const { lines: saved, setQty, clear, add } = useCart();
  const [code, setCode] = useState("");
  const [cp, setCp] = useState<CouponResult | null>(null);
  // Show today's names, prices and stock from the shop, not what was saved in the browser.
  const lines = saved.filter((l) => live[l.slug]).map((l) => ({ ...l, ...live[l.slug], qty: Math.min(l.qty, live[l.slug].stock) })).filter((l) => l.qty > 0);
  const subtotal = lines.reduce((a, b) => a + b.price * b.qty, 0);
  // Re-check the code whenever the bag changes (a minimum order may no longer be met).
  const applied = cp?.ok ? cp : null;
  const ship = applied?.freeShipping ? 0 : shippingFor(subtotal, shipping);
  const discount = applied ? Math.min(subtotal, applied.discount) : 0;
  const total = subtotal - discount + ship;
  const apply = async () => setCp(await checkCoupon(code, subtotal));
  const freeOver = shipping.freeShippingOver === "" ? null : Number(shipping.freeShippingOver);
  const fmt = (n: number) => money(currency, n);
  const sp = useSearchParams();
  const soldOut = sp.get("soldout");
  const placed = sp.get("placed");
  useEffect(() => { if (placed) clear(); }, [placed, clear]);
  useEffect(() => { if (applied) checkCoupon(applied.code, subtotal).then(setCp); }, [subtotal]); // eslint-disable-line react-hooks/exhaustive-deps
  const suggest = extras.upsell.filter((u) => !lines.some((l) => l.slug === u.slug)).slice(0, 4);
  const pct = freeOver ? Math.min(100, (subtotal / freeOver) * 100) : 0;
  if (placed) return (
    <div className="mx-auto max-w-xl px-5 py-28 text-center">
      <h1 className="serif text-5xl italic">{w.orderPlacedTitle}</h1>
      <p className="mt-4 opacity-70">{w.orderPlaced}</p>
      <Link href="/shop" className="btn btn-dark mt-8">{w.keepShopping}</Link>
    </div>
  );
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_1fr]">
      <div>
        <h1 className="serif text-5xl italic">{w.bagTitle}</h1>
        {extras.shipBar && lines.length > 0 && freeOver !== null && freeOver > 0 && !applied?.freeShipping && (
          <div className="mt-6 rounded-box bg-cream p-4 text-sm">
            <p>{subtotal >= freeOver ? w.freeShipDone : w.freeShipLeft.replace("{amount}", fmt(freeOver - subtotal))}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10"><div className="h-full bg-ink transition-all" style={{ width: `${pct}%` }} /></div>
          </div>
        )}
        {!lines.length && <p className="mt-8 opacity-60">{w.bagEmpty} <Link href="/shop" className="underline">{w.shopAllTitle} →</Link></p>}
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
        {lines.length > 0 && suggest.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl tracking-[-0.02em]">{extras.upsellTitle}</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {suggest.map((u) => (
                <div key={u.slug} className="text-xs">
                  <Link href={`/product/${u.slug}`} className="block aspect-square overflow-hidden bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {u.image ? <img src={u.image} alt={u.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="h-full w-full p-[15%]"><ProductArt category={u.category} metal={u.metal} id={`up-${u.slug}`} /></div>}
                  </Link>
                  <p className="mt-2 truncate">{u.name}</p><p className="opacity-60">{fmt(u.price)}</p>
                  <button type="button" onClick={() => add({ slug: u.slug, name: u.name, price: u.price })} className="mt-2 w-full border border-ink/30 py-2 text-[10px] tracking-widest uppercase hover:bg-ink hover:text-ivory">+ {w.addToBag}</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {lines.length > 0 && (
        <form action={placeOrder} className="space-y-3 self-start rounded-[2rem] bg-cream p-8">
          {sp.get("error") && <p className="text-sm text-burgundy">Please complete all required fields.</p>}
          {soldOut && <p className="text-sm text-burgundy">Sorry, {soldOut} just sold out or has too little stock. Please adjust your bag.</p>}
          <input type="hidden" name="items" value={JSON.stringify(lines.map(({ slug, qty }) => ({ slug, qty })))} />
          <input type="hidden" name="coupon" value={applied?.code ?? ""} />
          <input name="name" placeholder="Full name" className="field" required />
          <input name="email" type="email" placeholder="Email" className="field" required />
          <input name="phone" placeholder="Phone" className="field" />
          <textarea name="address" rows={3} placeholder="Delivery address" className="field" required />
          <div className="space-y-1 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            {extras.coupons && (
              <div className="pb-2">
                <div className="flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={w.discountCode} aria-label={w.discountCode} className="field !py-2 uppercase" />
                  <button type="button" onClick={apply} className="btn btn-line !px-4 !py-2">{w.apply}</button>
                </div>
                {cp && !cp.ok && <p className="mt-1 text-xs text-burgundy">{cp.error}</p>}
              </div>
            )}
            {applied && <div className="flex justify-between text-burgundy"><span>{applied.code} · {applied.label}</span><span>{discount ? `−${fmt(discount)}` : ""} <button type="button" onClick={() => { setCp(null); setCode(""); }} className="ml-1 underline">remove</button></span></div>}
            <div className="flex justify-between"><span>Shipping</span><span>{ship ? fmt(ship) : "Free"}</span></div>
            {ship > 0 && freeOver !== null && !extras.shipBar && <p className="text-xs opacity-60">Add {fmt(freeOver - subtotal)} more for free shipping.</p>}
          </div>
          <div className="flex justify-between text-lg"><span>Total</span><span>{fmt(total)}</span></div>
          <button className="btn btn-dark w-full">{w.placeOrder}</button>
          <p className="text-xs opacity-50">{w.orderNote}</p>
        </form>
      )}
    </div>
  );
}
export default function CartView(props: Props) { return <Suspense><Inner {...props} /></Suspense>; }
