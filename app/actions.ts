"use server";
import { redirect } from "next/navigation";
import { createEnquiry, createOrder, getProducts, getSettings } from "@/lib/store";
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
  const site = await getSettings();
  const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0);
  const shipping = shippingFor(subtotal, site);
  const o = {
    name: clean(fd.get("name"), 100), email: clean(fd.get("email"), 150),
    phone: clean(fd.get("phone"), 40), address: clean(fd.get("address"), 500), items,
    total: subtotal + shipping,
  };
  if (!o.name || !o.email || !o.address || !items.length) redirect("/cart?error=1");
  const res = await createOrder(o);
  if (!res.ok) redirect(`/cart?soldout=${encodeURIComponent(res.soldOut)}`);
  const cur = site.currency;
  await notify(`New order from ${o.name}`,
    `<p><b>${esc(o.name)}</b> (${esc(o.email)}, ${esc(o.phone)})</p><p>${esc(o.address)}</p><ul>${items.map((i) => `<li>${esc(i.name)} × ${i.qty} at ${esc(money(cur, i.price))}</li>`).join("")}</ul><p>Shipping: ${shipping ? esc(money(cur, shipping)) : "Free"}</p><p>Total: ${esc(money(cur, o.total))}</p>`);
  redirect("/cart?placed=1");
}
