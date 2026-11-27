"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
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
  useEffect(() => { if (placed) { clear(); try { sessionStorage.removeItem(SAVED); } catch {} } }, [placed, clear]);
  // Keep what the shopper typed if the page reloads (for example after a field was rejected).
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const f = form.current; if (!f) return;
    try { const v = JSON.parse(sessionStorage.getItem(SAVED) || "{}"); for (const [k, val] of Object.entries(v)) { const el = f.elements.namedItem(k) as HTMLInputElement | null; if (el && !el.value && typeof val === "string") el.value = val; } } catch {}
    const keep = () => { try { sessionStorage.setItem(SAVED, JSON.stringify(Object.fromEntries(FIELDS.map((k) => [k, (f.elements.namedItem(k) as HTMLInputElement | null)?.value ?? ""])))); } catch {} };
    f.addEventListener("input", keep); f.addEventListener("change", keep);
    return () => { f.removeEventListener("input", keep); f.removeEventListener("change", keep); };
  }, [saved.length]);
  useEffect(() => { if (applied) checkCoupon(applied.code, subtotal).then(setCp); }, [subtotal]); // eslint-disable-line react-hooks/exhaustive-deps
  const suggest = extras.upsell.filter((u) => !lines.some((l) => l.slug === u.slug)).slice(0, 4);
  const pct = freeOver ? Math.min(100, (subtotal / freeOver) * 100) : 0;
  if (placed) return (
    <div className="mx-auto max-w-xl px-5 py-28 text-center">
      <h1 className="serif text-5xl italic">{w.orderPlacedTitle}</h1>
      {placed.startsWith("AU-") && <p className="mt-6 text-[11px] tracking-[0.16em] uppercase opacity-60">Order number <span className="font-mono text-sm tracking-normal opacity-100">{placed}</span></p>}
      <p className="mt-4 opacity-70">{w.orderPlaced}</p>
      <p className="mt-2 text-sm opacity-60">Please keep your order number for any questions.</p>
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
        <form ref={form} action={placeOrder} className="space-y-3 self-start rounded-[2rem] bg-cream p-8">
          {sp.get("error") && <p role="alert" className="text-sm text-[#9a3b2f]">{ERRORS[sp.get("error")!] ?? "Please complete all required fields."}</p>}
          {soldOut && <p className="text-sm text-burgundy">Sorry, {soldOut} just sold out or has too little stock. Please adjust your bag.</p>}
          <input type="hidden" name="items" value={JSON.stringify(lines.map(({ slug, qty }) => ({ slug, qty })))} />
          <input type="hidden" name="coupon" value={applied?.code ?? ""} />
          <p className="text-[11px] tracking-[0.16em] uppercase opacity-60">Contact</p>
          <F label="Full name"><input name="name" autoComplete="name" className="field" required maxLength={100} /></F>
          <F label="Email"><input name="email" type="email" autoComplete="email" className="field" required maxLength={150} /></F>
          <F label="Mobile number" hint="10 digits, for delivery updates"><input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" className="field" required pattern="^(\+?91\s?|0)?[6-9][0-9]{4}\s?[0-9]{5}$" title="A 10-digit Indian mobile number" /></F>
          <p className="pt-3 text-[11px] tracking-[0.16em] uppercase opacity-60">Delivery address</p>
          <F label="House, street and area"><textarea name="address" rows={2} autoComplete="street-address" className="field" required maxLength={300} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="City"><input name="city" autoComplete="address-level2" className="field" required maxLength={80} /></F>
            <F label="Pincode"><input name="pincode" inputMode="numeric" autoComplete="postal-code" className="field" required pattern="^[1-9][0-9]{5}$" maxLength={6} title="A 6-digit pincode" /></F>
          </div>
          <F label="State"><select name="state" autoComplete="address-level1" className="field" required defaultValue=""><option value="" disabled>Choose your state</option>{STATES.map((x) => <option key={x}>{x}</option>)}</select></F>
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
          <PlaceButton label={w.placeOrder} />
          <p className="text-xs opacity-50">{w.orderNote}</p>
        </form>
      )}
    </div>
  );
}
const SAVED = "checkout-details";
const FIELDS = ["name", "email", "phone", "address", "city", "pincode", "state"];
const ERRORS: Record<string, string> = {
  name: "Please add your full name.", email: "Please check your email address.", phone: "Please add a 10-digit Indian mobile number.",
  address: "Please add your full delivery address, city and state.", pincode: "Please add a 6-digit pincode.",
};
const STATES = ["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block text-xs"><span className="mb-1 block opacity-70">{label}{hint && <span className="opacity-60"> · {hint}</span>}</span>{children}</label>;
}
/** Disabled while the order is being sent, so a double tap can't place it twice. */
function PlaceButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} aria-busy={pending} className="btn btn-dark w-full disabled:opacity-60">{pending ? "Placing your order…" : label}</button>;
}
export default function CartView(props: Props) { return <Suspense><Inner {...props} /></Suspense>; }
