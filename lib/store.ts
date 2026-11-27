import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { helpPages, defaultContent, defaultHome, defaultPlugins, defaultSections, defaultSettings, defaultTheme, seedProducts } from "./seed";
import { ensureSchema } from "./migrate";
import { defaultFaq, oldDefaultFaq } from "./faq";
import type { CategoryItem, Content, Enquiry, PageItem, Order, PageView, Product, ProductReview, SiteSettings, Subscriber } from "./types";

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
  kv?: Record<string, unknown>;
  subscribers?: Subscriber[];
  reviews?: ProductReview[];
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
const withImages = (p: Product): Product => ({ ...p, images: Array.isArray(p.images) ? p.images : [], seo: p.seo && typeof p.seo === "object" ? p.seo : {} });
export async function getProducts(): Promise<Product[]> {
  await ready();
  if (sb) {
    const { data, error } = await sb.from("products").select("*").order("created_at", { ascending: false });
    if (error) console.error("[db] products:", error.message);
    return ((data as Product[]) ?? []).map(withImages);
  }
  return load().products.map(withImages);
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
    images: (input.images ?? []).filter(Boolean).slice(0, 12),
    seo: input.seo ?? {},
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

/* ---------- editable content with draft and publish ---------- */
// Live content lives in settings rows "site" (texts, photos, shop details) and "content" (everything else).
// Unpublished edits live in one "draft" row until the owner presses Publish.
async function kvGet<T>(k: string): Promise<T | null> {
  await ready();
  if (sb) {
    const { data, error } = await sb.from("settings").select("value").eq("key", k).maybeSingle();
    if (error) console.error(`[db] settings ${k}:`, error.message);
    return (data?.value as T) ?? null;
  }
  return (load().kv?.[k] as T) ?? null;
}
async function kvSet(k: string, value: unknown) {
  await ready();
  if (sb) {
    const { error } = await sb.from("settings").upsert({ key: k, value });
    if (error) throw new Error(`Could not save: ${error.message}`);
    return;
  }
  const d = load(); d.kv = { ...(d.kv ?? {}), [k]: value }; save(d);
}
async function kvDelete(k: string) {
  await ready();
  if (sb) { await sb.from("settings").delete().eq("key", k); return; }
  const d = load(); if (d.kv) delete d.kv[k]; save(d);
}

const LAYOUT = 5;
/** Fills gaps with defaults so older saved content keeps working when new fields are added. */
function normalize(c: Partial<Content> | null, site: SiteSettings): Content {
  const base = defaultContent(site);
  const out: Content = { ...base, ...(c ?? {}), site: { ...defaultSettings, ...(c?.site ?? site) } };
  // Keep the owner's order; slot sections added in later versions in after their usual neighbour.
  const secs = out.sections.filter((x) => defaultSections.some((d) => d.key === x.key));
  defaultSections.forEach((d, i) => {
    if (secs.some((x) => x.key === d.key)) return;
    const prev = defaultSections.slice(0, i).reverse().find((p) => secs.some((x) => x.key === p.key));
    secs.splice(prev ? secs.findIndex((x) => x.key === prev.key) + 1 : 0, 0, { ...d });
  });
  // Layout 2 (Nov 2026): one-time move to the new shop order. On/off choices are kept, and reels and testimonials are switched on.
  if ((c?.layout ?? 0) < LAYOUT) {
    if ((c?.layout ?? 0) < 2) {
      const rank = (k: string) => defaultSections.findIndex((d) => d.key === k);
      secs.sort((a, b) => rank(a.key) - rank(b.key));
      secs.forEach((x) => { if (x.key === "reels" || x.key === "reviews") x.on = true; });
    }
    // Layout 3: Visit us switched on now that the shop's Google Maps listing is linked.
    if ((c?.layout ?? 0) < 3) secs.forEach((x) => { if (x.key === "visit") x.on = true; });
    // Layout 4: add the help and policy pages the shop didn't have yet.
    for (const p of helpPages(out.site)) if (!out.pages.some((x) => x.slug === p.slug)) out.pages.push(p);
    // Layout 5: grouped FAQ, only where the owner never changed the first three starter questions.
    const faq = out.pages.find((x) => x.slug === "faq");
    if (faq && faq.body.replace(/\r/g, "").trim() === oldDefaultFaq) faq.body = defaultFaq(out.site);
  }
  // The first template shipped a placeholder handle; point it at the official account.
  if (!out.site.instagram || out.site.instagram === "@aussilver") out.site.instagram = defaultSettings.instagram;
  out.sections = secs;
  out.layout = LAYOUT;
  if (!out.categories.length) out.categories = base.categories;
  const blankCat = { parent: "", description: "", seoTitle: "", seoDescription: "", image: "", inMenu: false };
  const blankPage = { seoTitle: "", seoDescription: "", image: "", inMenu: false, body: "" };
  out.categories = out.categories.map((x: Partial<CategoryItem>) => ({ ...blankCat, ...x }) as CategoryItem);
  out.pages = out.pages.map((x: Partial<PageItem>) => ({ ...blankPage, ...x }) as PageItem);
  out.words = out.words ?? {};
  out.theme = { ...defaultTheme, ...(out.theme ?? {}) };
  out.reels = Array.isArray(out.reels) ? out.reels : [];
  out.home = { ...defaultHome, ...(out.home ?? {}), promo: { ...defaultHome.promo, ...(out.home?.promo ?? {}) }, collection: { ...defaultHome.collection, ...(out.home?.collection ?? {}) } };
  out.reviews = Array.isArray(out.reviews) ? out.reviews : [];
  out.coupons = Array.isArray(out.coupons) ? out.coupons : [];
  const pl = (out.plugins ?? {}) as Partial<Content["plugins"]>;
  out.plugins = Object.fromEntries(Object.entries(defaultPlugins).map(([k, v]) => [k, { ...v, ...(pl[k as keyof typeof pl] ?? {}) }])) as Content["plugins"];
  return out;
}

/** What visitors see now. */
export async function getContent(): Promise<Content> {
  const [site, rest] = await Promise.all([getSettings(), kvGet<Partial<Content>>("content")]);
  return normalize({ ...(rest ?? {}), site }, site);
}
/** The owner's working copy: the draft if there is one, otherwise the live content. */
export async function getDraft(): Promise<{ content: Content; unpublished: boolean }> {
  const [live, draft] = await Promise.all([getContent(), kvGet<Partial<Content>>("draft")]);
  return draft ? { content: normalize(draft, live.site), unpublished: true } : { content: live, unpublished: false };
}
export async function saveDraft(c: Content) { await kvSet("draft", c); }
export async function discardDraft() { await kvDelete("draft"); }
/** Makes the draft live. */
export async function publishDraft() {
  const draft = await kvGet<Partial<Content>>("draft");
  if (!draft) return;
  const live = await getContent();
  const c = normalize(draft, live.site);
  const { site, ...rest } = c;
  await kvSet("content", rest);
  await saveSettings(site);
  await kvDelete("draft");
}

/* ---------- email sign-ups ---------- */
/** Adds an email to the list. Returns false if it was already there. */
export async function addSubscriber(email: string, source: string): Promise<boolean> {
  await ready();
  email = email.trim().toLowerCase();
  if (sb) {
    const { error } = await sb.from("subscribers").insert({ email, source });
    if (error && error.code !== "23505") throw new Error(`Could not save email: ${error.message}`);
    return !error;
  }
  const d = load(); d.subscribers ??= [];
  if (d.subscribers.some((x) => x.email === email)) return false;
  d.subscribers.unshift({ id: uid(), email, source, created_at: new Date().toISOString() }); save(d);
  return true;
}
export async function getSubscribers(): Promise<Subscriber[]> {
  await ready();
  if (sb) {
    const { data } = await sb.from("subscribers").select("*").order("created_at", { ascending: false });
    return (data as Subscriber[]) ?? [];
  }
  return load().subscribers ?? [];
}
export async function deleteSubscriber(id: string) {
  await ready();
  if (sb) { await sb.from("subscribers").delete().eq("id", id); return; }
  const d = load(); d.subscribers = (d.subscribers ?? []).filter((x) => x.id !== id); save(d);
}

/* ---------- product reviews written by customers ---------- */
export async function addReview(r: Pick<ProductReview, "product" | "name" | "place" | "rating" | "text">) {
  await ready();
  if (sb) {
    const { error } = await sb.from("reviews").insert({ ...r, status: "pending" });
    if (error) throw new Error(`Could not save review: ${error.message}`);
    return;
  }
  const d = load(); d.reviews ??= [];
  d.reviews.unshift({ ...r, id: uid(), status: "pending", created_at: new Date().toISOString() }); save(d);
}
export async function getReviews(o: { product?: string; status?: ProductReview["status"] } = {}): Promise<ProductReview[]> {
  await ready();
  if (sb) {
    let q = sb.from("reviews").select("*").order("created_at", { ascending: false });
    if (o.product) q = q.eq("product", o.product);
    if (o.status) q = q.eq("status", o.status);
    const { data, error } = await q;
    if (error) console.error("[db] reviews:", error.message);
    return (data as ProductReview[]) ?? [];
  }
  return (load().reviews ?? []).filter((r) => (!o.product || r.product === o.product) && (!o.status || r.status === o.status));
}
export async function setReviewStatus(id: string, status: ProductReview["status"] | "delete") {
  await ready();
  if (sb) {
    if (status === "delete") await sb.from("reviews").delete().eq("id", id);
    else await sb.from("reviews").update({ status }).eq("id", id);
    return;
  }
  const d = load();
  d.reviews = status === "delete" ? (d.reviews ?? []).filter((r) => r.id !== id) : (d.reviews ?? []).map((r) => (r.id === id ? { ...r, status } : r));
  save(d);
}

/* ---------- Instagram connection (kept apart from the content: the key is private) ---------- */
export interface InstagramLink { token: string; refreshed: string; user: string }
export const getInstagram = () => kvGet<InstagramLink>("instagram");
export const saveInstagram = (v: InstagramLink | null) => (v ? kvSet("instagram", v) : kvDelete("instagram"));

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

/* ---------- moving photos between storage services ---------- */
const KV_KEYS = ["site", "content", "draft"];
/** Every photo or video address used by products and site content that matches `re`. */
export async function findMediaUrls(re: RegExp): Promise<string[]> {
  const found = new Set<string>();
  const scan = (text: string) => { for (const m of text.matchAll(/https?:\/\/[^\s"'\\)]+/g)) if (re.test(m[0])) found.add(m[0]); };
  for (const p of await getProducts()) scan(JSON.stringify([p.image_url, p.images]));
  for (const k of KV_KEYS) { const v = await kvGet<unknown>(k); if (v) scan(JSON.stringify(v)); }
  return [...found];
}
/** Swaps old addresses for new ones everywhere they are used. */
export async function replaceMediaUrls(map: Record<string, string>) {
  const swap = (text: string) => Object.entries(map).reduce((t, [a, b]) => t.split(a).join(b), text);
  for (const p of await getProducts()) {
    const before = JSON.stringify([p.image_url, p.images]);
    const after = swap(before);
    if (after === before) continue;
    const [image_url, images] = JSON.parse(after) as [string | null, string[]];
    if (sb) await sb.from("products").update({ image_url, images }).eq("id", p.id);
    else { const d = load(); d.products = d.products.map((x) => (x.id === p.id ? { ...x, image_url, images } : x)); save(d); }
  }
  for (const k of KV_KEYS) {
    const v = await kvGet<unknown>(k);
    if (!v) continue;
    const before = JSON.stringify(v), after = swap(before);
    if (after !== before) await kvSet(k, JSON.parse(after));
  }
}
