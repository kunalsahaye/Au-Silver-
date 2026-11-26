"use server";
import { redirect } from "next/navigation";
import { createEnquiry, createOrder } from "@/lib/store";
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
  let items: OrderItem[] = [];
  try { items = JSON.parse(clean(fd.get("items"), 20000)); } catch {}
  items = items.filter((i) => i && i.qty > 0).slice(0, 50);
  const o = {
    name: clean(fd.get("name"), 100), email: clean(fd.get("email"), 150),
    phone: clean(fd.get("phone"), 40), address: clean(fd.get("address"), 500), items,
    total: items.reduce((a, b) => a + Number(b.price) * Number(b.qty), 0),
  };
  if (!o.name || !o.email || !o.address || !items.length) redirect("/cart?error=1");
  await createOrder(o);
  await notify(`New order from ${o.name}`,
    `<p><b>${esc(o.name)}</b> — ${esc(o.phone)}</p><p>${esc(o.address)}</p><ul>${items.map((i) => `<li>${esc(String(i.name))} × ${Number(i.qty)}</li>`).join("")}</ul><p>Total: ${o.total}</p>`);
  redirect("/cart?placed=1");
}
