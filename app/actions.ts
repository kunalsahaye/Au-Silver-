"use server";
import { redirect } from "next/navigation";
import { addSubscriber, createEnquiry, createOrder, getContent, getProducts } from "@/lib/store";
import { applyCoupon, type CouponResult } from "@/lib/coupons";
import { money, shippingFor } from "@/lib/format";
import { notify } from "@/lib/mail";
import type { OrderItem } from "@/lib/types";

const clean = (v: FormDataEntryValue | null, max = 500) => String(v ?? "").trim().slice(0, max);
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));

export async function submitEnquiry(fd: FormData) {
  const e = {
    name: clean(fd.get("name"), 100), email: clean(fd.get("email"), 150),
    phone: clean(fd.get("phone"), 40), message: clean(fd.get("message"), 2000),
    product_name: clean(fd.get("product")) || null,
  };
  if (!e.name || !e.email || !e.message) redirect("/contact?error=1");
  await createEnquiry(e);
  await notify(`New enquiry from ${e.name}`,
    `<p><b>${esc(e.name)}</b> (${esc(e.email)}, ${esc(e.phone)})</p><p>${esc(e.message)}</p>${e.product_name ? `<p>About: ${esc(e.product_name)}</p>` : ""}`);
  redirect("/contact?sent=1");
}

export async function placeOrder(fd: FormData) {
  // The browser only tells us which pieces and how many. Names, prices and the total come from our own product list.
  let raw: { slug?: unknown; qty?: unknown }[] = [];
  try { raw = JSON.parse(clean(fd.get("items"), 20000)); } catch {}
  if (!Array.isArray(raw)) raw = [];
  const qty = new Map<string, number>();
  for (const r of raw.slice(0, 50)) {
    const slug = String(r?.slug ?? ""), q = Math.floor(Number(r?.qty));
    if (slug && q > 0) qty.set(slug, Math.min(20, (qty.get(slug) ?? 0) + q));
  }
  const products = await getProducts();
  const items: OrderItem[] = [];
  for (const [slug, q] of qty) {
    const p = products.find((x) => x.slug === slug);
    if (p) items.push({ slug, name: p.name, price: Number(p.price), qty: q });
  }
  const c = await getContent();
  const site = c.site;
  const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0);
  // Discount codes are checked again here against the live list; the browser's word is never trusted.
  const code = clean(fd.get("coupon"), 40);
  const cp = code && c.plugins.coupons.on ? applyCoupon(c.coupons, code, subtotal, site.currency) : null;
  const discount = cp?.ok ? cp.discount : 0;
  const shipping = cp?.ok && cp.freeShipping ? 0 : shippingFor(subtotal, site);
  const o = {
    name: clean(fd.get("name"), 100), email: clean(fd.get("email"), 150),
    phone: clean(fd.get("phone"), 40), address: clean(fd.get("address"), 500), items,
    total: subtotal - discount + shipping, coupon: cp?.ok ? cp.code : null, discount,
  };
  if (!o.name || !o.email || !o.address || !items.length) redirect("/cart?error=1");
  const res = await createOrder(o);
  if (!res.ok) redirect(`/cart?soldout=${encodeURIComponent(res.soldOut)}`);
  const cur = site.currency;
  await notify(`New order from ${o.name}`,
    `<p><b>${esc(o.name)}</b> (${esc(o.email)}, ${esc(o.phone)})</p><p>${esc(o.address)}</p><ul>${items.map((i) => `<li>${esc(i.name)} × ${i.qty} at ${esc(money(cur, i.price))}</li>`).join("")}</ul>${o.coupon ? `<p>Code ${esc(o.coupon)}: −${esc(money(cur, discount))}</p>` : ""}<p>Shipping: ${shipping ? esc(money(cur, shipping)) : "Free"}</p><p>Total: ${esc(money(cur, o.total))}</p>`);
  redirect("/cart?placed=1");
}

/** Used by the bag to show what a discount code takes off. The order itself is checked again on the server. */
export async function checkCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const c = await getContent();
  if (!c.plugins.coupons.on) return { ok: false, error: "Discount codes are not in use right now." };
  return applyCoupon(c.coupons, String(code).slice(0, 40), Math.max(0, Number(subtotal) || 0), c.site.currency);
}

/** Email sign-up from the popup or the footer. */
export async function subscribe(_: unknown, fd: FormData): Promise<{ ok: boolean; msg: string }> {
  const email = clean(fd.get("email"), 150).toLowerCase();
  if (clean(fd.get("website"))) return { ok: true, msg: "Thank you!" }; // bots fill the hidden field
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, msg: "Please enter a valid email." };
  const fresh = await addSubscriber(email, clean(fd.get("source"), 30));
  if (fresh) await notify("New email sign-up", `<p>${esc(email)} joined your list.</p>`);
  return { ok: true, msg: fresh ? "You're on the list. Thank you!" : "You're already on our list. Thank you!" };
}
