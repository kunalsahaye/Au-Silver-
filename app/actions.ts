"use server";
import { redirect } from "next/navigation";
import { addReview, addSubscriber, createEnquiry, createOrder, getContent, getOrders, getProducts } from "@/lib/store";
import { applyCoupon, type CouponResult } from "@/lib/coupons";
import { indianMobile, money, orderRef, shippingFor, validEmail, validPincode } from "@/lib/format";
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
  // Contact and delivery details, checked here as well as in the browser.
  const line = clean(fd.get("address"), 300), city = clean(fd.get("city"), 80), state = clean(fd.get("state"), 60), pin = clean(fd.get("pincode"), 10);
  const phone = indianMobile(clean(fd.get("phone"), 40));
  const o = {
    name: clean(fd.get("name"), 100), email: clean(fd.get("email"), 150).toLowerCase(),
    phone: phone ? `+91 ${phone}` : "", address: [line, [city, state].filter(Boolean).join(", "), pin].filter(Boolean).join("\n"), items,
    total: subtotal - discount + shipping, coupon: cp?.ok ? cp.code : null, discount,
  };
  if (!items.length) redirect("/cart");
  const bad = !o.name ? "name" : !validEmail(o.email) ? "email" : !phone ? "phone" : !line || !city || !state ? "address" : !validPincode(pin) ? "pincode" : "";
  if (bad) redirect(`/cart?error=${bad}`);
  // A double tap or a resubmitted page must not create a second order.
  const key = (x: { email: string; total: number; items: { slug: string; qty: number }[] }) => `${x.email}|${x.total}|${x.items.map((i) => `${i.slug}x${i.qty}`).sort().join(",")}`;
  const dup = (await getOrders()).slice(0, 30).find((x) => Date.now() - new Date(x.created_at).getTime() < 3 * 60_000 && key({ ...x, total: Number(x.total) }) === key(o));
  if (dup) redirect(`/cart?placed=${orderRef(dup.id)}`);
  const res = await createOrder(o);
  if (!res.ok) redirect(`/cart?soldout=${encodeURIComponent(res.soldOut)}`);
  const ref = orderRef(res.id);
  const cur = site.currency;
  await notify(`New order ${ref} from ${o.name}`,
    `<p><b>${esc(o.name)}</b> (${esc(o.email)}, ${esc(o.phone)})</p><p>${esc(o.address)}</p><ul>${items.map((i) => `<li>${esc(i.name)} × ${i.qty} at ${esc(money(cur, i.price))}</li>`).join("")}</ul>${o.coupon ? `<p>Code ${esc(o.coupon)}: −${esc(money(cur, discount))}</p>` : ""}<p>Shipping: ${shipping ? esc(money(cur, shipping)) : "Free"}</p><p>Total: ${esc(money(cur, o.total))}</p>`);
  redirect(`/cart?placed=${ref}`);
}

/** Today's names, prices and stock for the pieces in a saved bag, so the bag never shows an old price. */
export async function bagInfo(slugs: string[]): Promise<Record<string, { name: string; price: number; stock: number }>> {
  const want = new Set((Array.isArray(slugs) ? slugs : []).slice(0, 50).map(String));
  const out: Record<string, { name: string; price: number; stock: number }> = {};
  for (const p of await getProducts()) if (want.has(p.slug)) out[p.slug] = { name: p.name, price: Number(p.price), stock: p.stock };
  return out;
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
  const source = clean(fd.get("source"), 90);
  const fresh = await addSubscriber(email, source);
  if (source.startsWith("restock:")) {
    // Back-in-stock request: always tell the shop, even if this email is already on the list.
    const slug = source.slice(8);
    await notify(`Back-in-stock request: ${slug}`, `<p>${esc(email)} would like to know when <b>${esc(slug)}</b> is back in stock.</p>`);
    return { ok: true, msg: "Thank you! We'll email you as soon as it's back." };
  }
  if (fresh) await notify("New email sign-up", `<p>${esc(email)} joined your list.</p>`);
  return { ok: true, msg: fresh ? "You're on the list. Thank you!" : "You're already on our list. Thank you!" };
}

/** A customer's review from a product page. Saved as waiting until the shop approves it. */
export async function submitReview(_: unknown, fd: FormData): Promise<{ ok: boolean; msg: string }> {
  if (clean(fd.get("website"))) return { ok: true, msg: "Thank you!" };
  const product = clean(fd.get("product"), 120);
  const r = { product, name: clean(fd.get("name"), 60), place: clean(fd.get("place"), 60), rating: Math.min(5, Math.max(1, Math.round(Number(fd.get("rating")) || 5))), text: clean(fd.get("text"), 1000) };
  if (!r.name || r.text.length < 10) return { ok: false, msg: "Please add your name and a few words about the piece." };
  if (!(await getProducts()).some((p) => p.slug === product)) return { ok: false, msg: "That piece could not be found." };
  await addReview(r);
  await notify(`New review to approve: ${r.rating}★ from ${r.name}`, `<p>${esc(r.text)}</p><p>Approve it in Admin › Reviews.</p>`);
  return { ok: true, msg: "Thank you! Your review will appear once we've read it." };
}
