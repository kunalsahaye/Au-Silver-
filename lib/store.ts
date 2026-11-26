import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { defaultSettings, seedProducts } from "./seed";
import { ensureSchema } from "./migrate";
import type { Enquiry, Order, PageView, Product, SiteSettings } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const usingSupabase = Boolean(url && key);
const sb = usingSupabase ? createClient(url!, key!, { auth: { persistSession: false } }) : null;
/** Make sure the Supabase tables exist before the first query. */
const ready = () => (sb ? ensureSchema() : Promise.resolve());

/* ---------- demo mode: JSON file so the template works with zero setup ---------- */
interface Demo {
  products: Product[]; settings: SiteSettings;
  enquiries: Enquiry[]; orders: Order[]; views: PageView[];
}
const FILE = path.join(os.tmpdir(), `demo-${path.basename(process.cwd())}.json`);
function load(): Demo {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch {
    return structuredClone({ products: seedProducts, settings: defaultSettings, enquiries: [], orders: [], views: [] });
  }
}
function save(d: Demo) { try { fs.writeFileSync(FILE, JSON.stringify(d)); } catch {} }
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---------- products ---------- */
export async function getProducts(): Promise<Product[]> {
  await ready();
  if (sb) {
    const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: false });
    if (error) console.error("[db] products:", error.message);
    return (data as Product[]) ?? [];
  }
  return load().products;
}
export async function getProduct(slug: string) {
  await ready();
  return (await getProducts()).find((x) => x.slug === slug) ?? null;
}
export async function saveProduct(input: Partial<Product> & { name: string }) {
  await ready();
  const row = {
    slug: input.slug || slugify(input.name),
    name: input.name,
    category: input.category ?? "rings",
    metal: input.metal ?? "gold",
    price: Number(input.price) || 0,
    description: input.description ?? "",
    material: input.material ?? "",
    finish: input.finish ?? "",
    image_url: input.image_url || null,
    featured: !!input.featured,
    bestseller: !!input.bestseller,
    stock: Number(input.stock) || 0,
  };
  // Keep web addresses unique: "silver-ring", "silver-ring-2", ...
  const others = (await getProducts()).filter((x) => x.id !== input.id).map((x) => x.slug);
  const base = slugify(row.slug) || uid();
  row.slug = base;
  for (let n = 2; others.includes(row.slug); n++) row.slug = `${base}-${n}`;
  if (sb) {
    const { error } = input.id
      ? await sb.from("products").update(row).eq("id", input.id)
      : await sb.from("products").insert(row);
    if (error) throw new Error(`Could not save product: ${error.message}`);
    return;
  }
  const d = load();
  if (input.id) d.products = d.products.map((x) => (x.id === input.id ? { ...x, ...row } : x));
  else d.products.unshift({ ...row, id: uid(), created_at: new Date().toISOString() });
  save(d);
}
export async function deleteProduct(id: string) {
  await ready();
  if (sb) { await sb.from("products").delete().eq("id", id); return; }
  const d = load(); d.products = d.products.filter((x) => x.id !== id); save(d);
}

/* ---------- settings ---------- */
export async function getSettings(): Promise<SiteSettings> {
  await ready();
  if (sb) {
    const { data } = await sb.from("settings").select("value").eq("key", "site").maybeSingle();
    return { ...defaultSettings, ...(data?.value ?? {}) };
  }
  return { ...defaultSettings, ...load().settings };
}
export async function saveSettings(s: SiteSettings) {
  await ready();
  if (sb) {
    const { error } = await sb.from("settings").upsert({ key: "site", value: s });
    if (error) throw new Error(`Could not save site content: ${error.message}`);
    return;
  }
  const d = load(); d.settings = s; save(d);
}

/* ---------- enquiries ---------- */
export async function createEnquiry(e: Pick<Enquiry, "name" | "email" | "phone" | "message" | "product_name">) {
  await ready();
  if (sb) { await sb.from("enquiries").insert({ ...e, status: "new" }); return; }
  const d = load();
  d.enquiries.unshift({ ...e, id: uid(), status: "new", created_at: new Date().toISOString() });
  save(d);
}
export async function getEnquiries(): Promise<Enquiry[]> {
  await ready();
  if (sb) {
    const { data } = await sb.from("enquiries").select("*").order("created_at", { ascending: false });
    return (data as Enquiry[]) ?? [];
  }
  return load().enquiries;
}
export async function setEnquiryStatus(id: string, status: Enquiry["status"]) {
  await ready();
  if (sb) { await sb.from("enquiries").update({ status }).eq("id", id); return; }
  const d = load(); d.enquiries = d.enquiries.map((x) => (x.id === id ? { ...x, status } : x)); save(d);
}

/* ---------- orders ---------- */
type NewOrder = Omit<Order, "id" | "status" | "created_at">;

/**
 * Saves an order and takes the items out of stock in one step.
 * Prices and totals must already be computed on the server from the product list.
 * Returns the name of the first item that ran out, if any; nothing is saved in that case.
 */
export async function createOrder(o: NewOrder): Promise<{ ok: true } | { ok: false; soldOut: string }> {
  await ready();
  if (sb) {
    const { error } = await sb.rpc("place_order", { p_order: o });
    if (error) {
      const m = /OUT_OF_STOCK:(.*)/.exec(error.message);
      if (m) return { ok: false, soldOut: m[1] };
      throw new Error(error.message);
    }
    return { ok: true };
  }
  const d = load();
  for (const i of o.items) {
    const p = d.products.find((x) => x.slug === i.slug);
    if (!p || p.stock < i.qty) return { ok: false, soldOut: i.name };
  }
  for (const i of o.items) d.products = d.products.map((x) => (x.slug === i.slug ? { ...x, stock: x.stock - i.qty } : x));
  d.orders.unshift({ ...o, id: uid(), status: "new", created_at: new Date().toISOString() });
  save(d);
  return { ok: true };
}
export async function getOrders(): Promise<Order[]> {
  await ready();
  if (sb) {
    const { data } = await sb.from("orders").select("*").order("created_at", { ascending: false });
    return (data as Order[]) ?? [];
  }
  return load().orders;
}

/** Adds (delta > 0) or removes (delta < 0) stock. Removing fails, changing nothing, if there is not enough. */
async function adjustStock(slug: string, delta: number): Promise<boolean> {
  if (sb) {
    const { data, error } = await sb.rpc("adjust_stock", { p_slug: slug, p_delta: delta });
    if (error) throw new Error(error.message);
    return data === true;
  }
  const d = load();
  const p = d.products.find((x) => x.slug === slug);
  if (!p) return delta > 0; // product deleted since: nothing to put back
  if (p.stock + delta < 0) return false;
  p.stock += delta; save(d);
  return true;
}

/** Changes an order's status. Cancelling puts its items back in stock; un-cancelling takes them out again. */
export async function setOrderStatus(id: string, status: Order["status"]): Promise<{ ok: true } | { ok: false; soldOut: string }> {
  await ready();
  const order = (await getOrders()).find((x) => x.id === id);
  if (!order) return { ok: true };
  const was = order.status === "cancelled", now = status === "cancelled";
  if (!was && now) {
    for (const i of order.items) await adjustStock(i.slug, i.qty);
  } else if (was && !now) {
    const done: typeof order.items = [];
    for (const i of order.items) {
      if (!(await adjustStock(i.slug, -i.qty))) {
        for (const j of done) await adjustStock(j.slug, j.qty);
        return { ok: false, soldOut: i.name };
      }
      done.push(i);
    }
  }
  if (sb) await sb.from("orders").update({ status }).eq("id", id);
  else { const d = load(); d.orders = d.orders.map((x) => (x.id === id ? { ...x, status } : x)); save(d); }
  return { ok: true };
}

/* ---------- analytics ---------- */
export async function trackView(p: string) {
  await ready();
  if (sb) { await sb.from("page_views").insert({ path: p }); return; }
  const d = load(); d.views.push({ path: p, created_at: new Date().toISOString() });
  d.views = d.views.slice(-5000); save(d);
}
export async function getViews(): Promise<PageView[]> {
  await ready();
  if (sb) {
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const { data } = await sb.from("page_views").select("path,created_at").gte("created_at", since).limit(20000);
    return (data as PageView[]) ?? [];
  }
  return load().views;
}
