import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { defaultSettings, seedProducts } from "./seed";
import type { Enquiry, Order, PageView, Product, SiteSettings } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const usingSupabase = Boolean(url && key);
const sb = usingSupabase ? createClient(url!, key!, { auth: { persistSession: false } }) : null;

/* ---------- demo mode: JSON file so the template works with zero setup ---------- */
interface Demo {
  products: Product[]; settings: SiteSettings;
  enquiries: Enquiry[]; orders: Order[]; views: PageView[];
}
const FILE = path.join(os.tmpdir(), `demo-${path.basename(process.cwd())}.json`);
function load(): Demo {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch {
    return { products: seedProducts, settings: defaultSettings, enquiries: [], orders: [], views: [] };
  }
}
function save(d: Demo) { try { fs.writeFileSync(FILE, JSON.stringify(d)); } catch {} }
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---------- products ---------- */
export async function getProducts(): Promise<Product[]> {
  if (sb) {
    const { data } = await sb.from("products").select("*").order("created_at", { ascending: false });
    return (data as Product[]) ?? [];
  }
  return load().products;
}
export async function getProduct(slug: string) {
  return (await getProducts()).find((x) => x.slug === slug) ?? null;
}
export async function saveProduct(input: Partial<Product> & { name: string }) {
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
  if (sb) {
    if (input.id) await sb.from("products").update(row).eq("id", input.id);
    else await sb.from("products").insert(row);
    return;
  }
  const d = load();
  if (input.id) d.products = d.products.map((x) => (x.id === input.id ? { ...x, ...row } : x));
  else d.products.unshift({ ...row, id: uid(), created_at: new Date().toISOString() });
  save(d);
}
export async function deleteProduct(id: string) {
  if (sb) { await sb.from("products").delete().eq("id", id); return; }
  const d = load(); d.products = d.products.filter((x) => x.id !== id); save(d);
}

/* ---------- settings ---------- */
export async function getSettings(): Promise<SiteSettings> {
  if (sb) {
    const { data } = await sb.from("settings").select("value").eq("key", "site").maybeSingle();
    return { ...defaultSettings, ...(data?.value ?? {}) };
  }
  return { ...defaultSettings, ...load().settings };
}
export async function saveSettings(s: SiteSettings) {
  if (sb) { await sb.from("settings").upsert({ key: "site", value: s }); return; }
  const d = load(); d.settings = s; save(d);
}

/* ---------- enquiries ---------- */
export async function createEnquiry(e: Pick<Enquiry, "name" | "email" | "phone" | "message" | "product_name">) {
  if (sb) { await sb.from("enquiries").insert({ ...e, status: "new" }); return; }
  const d = load();
  d.enquiries.unshift({ ...e, id: uid(), status: "new", created_at: new Date().toISOString() });
  save(d);
}
export async function getEnquiries(): Promise<Enquiry[]> {
  if (sb) {
    const { data } = await sb.from("enquiries").select("*").order("created_at", { ascending: false });
    return (data as Enquiry[]) ?? [];
  }
  return load().enquiries;
}
export async function setEnquiryStatus(id: string, status: Enquiry["status"]) {
  if (sb) { await sb.from("enquiries").update({ status }).eq("id", id); return; }
  const d = load(); d.enquiries = d.enquiries.map((x) => (x.id === id ? { ...x, status } : x)); save(d);
}

/* ---------- orders ---------- */
export async function createOrder(o: Omit<Order, "id" | "status" | "created_at">) {
  if (sb) { await sb.from("orders").insert({ ...o, status: "new" }); return; }
  const d = load();
  d.orders.unshift({ ...o, id: uid(), status: "new", created_at: new Date().toISOString() });
  save(d);
}
export async function getOrders(): Promise<Order[]> {
  if (sb) {
    const { data } = await sb.from("orders").select("*").order("created_at", { ascending: false });
    return (data as Order[]) ?? [];
  }
  return load().orders;
}
export async function setOrderStatus(id: string, status: Order["status"]) {
  if (sb) { await sb.from("orders").update({ status }).eq("id", id); return; }
  const d = load(); d.orders = d.orders.map((x) => (x.id === id ? { ...x, status } : x)); save(d);
}

/* ---------- analytics ---------- */
export async function trackView(p: string) {
  if (sb) { await sb.from("page_views").insert({ path: p }); return; }
  const d = load(); d.views.push({ path: p, created_at: new Date().toISOString() });
  d.views = d.views.slice(-5000); save(d);
}
export async function getViews(): Promise<PageView[]> {
  if (sb) {
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const { data } = await sb.from("page_views").select("path,created_at").gte("created_at", since).limit(20000);
    return (data as PageView[]) ?? [];
  }
  return load().views;
}
