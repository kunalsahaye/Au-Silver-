"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { draftMode } from "next/headers";
import { getRole } from "@/lib/auth";
import { discardDraft, getDraft, publishDraft, saveDraft } from "@/lib/store";
import type { Badge, CategoryItem, Content, Coupon, Tile, Customer, PageItem, Plugins, Reel, Review, Section, SiteSettings, Slide, Theme } from "@/lib/types";
import { defaultHome, defaultPlugins, defaultSections, defaultTheme } from "@/lib/seed";
import { FONTS } from "@/lib/theme";
import { WORDS } from "@/lib/words";

/* All edits here go into the draft. Nothing changes on the shop until Publish. */

const str = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const kindOf = (u: string) => (/\.(mp4|mov|webm)(\?|$)/i.test(u) ? "video" : "image") as "video" | "image";
const newId = () => Math.random().toString(36).slice(2, 10);
const RESERVED = ["shop", "cart", "product", "admin", "api", "uploads", "about", "contact"];

const backTo = (v: unknown) => { const b = str(v, 100); return /^\/admin(\/[a-z0-9/-]*)?$/.test(b) ? b : "/admin"; };
async function guard() { if (!(await getRole())) redirect("/admin/login"); }
function list(fd: FormData): Record<string, unknown>[] {
  try { const v = JSON.parse(String(fd.get("items") ?? "[]")); return Array.isArray(v) ? v.slice(0, 100) : []; } catch { return []; }
}
function unique(base: string, taken: Set<string>) {
  let s = base || newId(); for (let n = 2; taken.has(s); n++) s = `${base}-${n}`;
  taken.add(s); return s;
}
async function update(back: string, change: (c: Content) => void) {
  await guard();
  const { content } = await getDraft();
  change(content);
  await saveDraft(content);
  revalidatePath("/admin", "layout");
  redirect(`${back}?saved=1`);
}
const pick = (fd: FormData, site: SiteSettings, keys: (keyof SiteSettings)[], max = 2000) => {
  for (const k of keys) if (fd.has(k)) site[k] = str(fd.get(k), max);
};

export async function saveHomepage(fd: FormData) {
  await update("/admin/homepage", (c) => {
    const known = new Set(defaultSections.map((s) => s.key));
    const got = list(fd).filter((x) => known.has(x.key as Section["key"])).map((x) => ({ key: x.key as Section["key"], on: !!x.on }));
    c.sections = [...got, ...defaultSections.filter((d) => !got.some((g) => g.key === d.key))];
    pick(fd, c.site, ["heroTitle", "heroSub", "storyTitle", "storyBody", "processTitle", "img1", "img2", "img3", "img4", "img5", "img6", "img7", "img9"]);
  });
}

export async function saveSlides(fd: FormData) {
  await update("/admin/homepage/slides", (c) => {
    c.slides = list(fd).map((x): Slide => {
      const media = str(x.media, 1000);
      return { id: str(x.id, 20) || newId(), media, kind: kindOf(media), title: str(x.title, 120), sub: str(x.sub, 300), cta: str(x.cta, 40), href: str(x.href, 300) };
    }).filter((s) => s.media || s.title);
  });
}

export async function saveCustomers(fd: FormData) {
  await update("/admin/homepage/customers", (c) => {
    c.customers = list(fd).map((x): Customer => {
      const media = str(x.media, 1000);
      return { id: str(x.id, 20) || newId(), name: str(x.name, 80), note: str(x.note, 600), media, kind: kindOf(media), rating: Math.min(5, Math.max(1, Math.round(Number(x.rating) || 5))) };
    }).filter((x) => x.name || x.note || x.media);
  });
}

export async function saveCategories(fd: FormData) {
  await update("/admin/categories", (c) => {
    const taken = new Set<string>();
    const cats = list(fd).filter((x) => str(x.name)).map((x): CategoryItem => ({
      slug: unique(slugify(str(x.slug) || str(x.name)), taken), name: str(x.name, 60), image: str(x.image, 1000), inMenu: !!x.inMenu,
      parent: str(x.parent, 60), description: str(x.description, 2000),
      seoTitle: str(x.seoTitle, 70), seoDescription: str(x.seoDescription, 170),
    }));
    // One level of sub-categories: a parent must exist, be a top-level category and not be itself.
    const top = new Set(cats.filter((x) => !x.parent).map((x) => x.slug));
    for (const x of cats) if (x.parent && (x.parent === x.slug || !top.has(x.parent))) x.parent = "";
    c.categories = cats;
  });
}

export async function savePages(fd: FormData) {
  await update("/admin/pages", (c) => {
    const taken = new Set<string>();
    c.pages = list(fd).filter((x) => str(x.title)).map((x): PageItem => {
      let base = slugify(str(x.slug) || str(x.title));
      const fixed = base === "about" || base === "contact"; // these two keep their own page designs
      if (!fixed && RESERVED.includes(base)) base = `${base}-page`;
      return {
        slug: unique(base, taken), title: str(x.title, 80), body: str(x.body, 20000), inMenu: !!x.inMenu,
        seoTitle: str(x.seoTitle, 70), seoDescription: str(x.seoDescription, 170), image: str(x.image, 1000),
      };
    });
    const about = c.pages.find((p) => p.slug === "about");
    if (about) c.site.aboutBody = about.body; // the homepage "process" section quotes its first paragraph
  });
}

export async function saveShopSettings(fd: FormData) {
  await update("/admin/settings", (c) => {
    pick(fd, c.site, ["brand", "tagline", "announcement", "email", "phone", "address", "instagram", "currency", "img8", "logo", "productPlaceholder", "whatsapp", "facebook", "youtube", "pinterest", "returnDays", "deliveryDays"]);
    const num = (k: "shippingFee" | "freeShippingOver") => { const v = str(fd.get(k), 12); c.site[k] = v === "" ? "" : String(Math.max(0, Number(v) || 0)); };
    num("shippingFee"); num("freeShippingOver");
  });
}

export async function saveWords(fd: FormData) {
  await update("/admin/words", (c) => {
    const w: Record<string, string> = {};
    for (const k of Object.keys(WORDS)) { const v = str(fd.get(k), 300); if (v && v !== WORDS[k as keyof typeof WORDS][0]) w[k] = v; }
    c.words = w;
  });
}

export async function saveSeo(fd: FormData) {
  await update("/admin/seo", (c) => {
    pick(fd, c.site, ["seoTitle", "seoDescription", "shareImage", "googleVerification", "bingVerification", "address", "city", "region", "postalCode", "country", "latitude", "longitude", "openingHours", "priceRange"], 300);
    const url = str(fd.get("siteUrl"), 200).replace(/\/+$/, "");
    c.site.siteUrl = /^https?:\/\/[^\s/]+$/.test(url) ? url : "";
    // Verification fields: accept the whole <meta> tag and keep only its content value.
    for (const k of ["googleVerification", "bingVerification"] as const) {
      const m = /content=["']([^"']+)["']/.exec(c.site[k]); if (m) c.site[k] = m[1];
    }
  });
}

export async function saveBlocks(fd: FormData) {
  await update("/admin/homepage/blocks", (c) => {
    const arr = (k: string) => { try { const v = JSON.parse(String(fd.get(k) ?? "[]")); return Array.isArray(v) ? v.slice(0, 24) : []; } catch { return []; } };
    const t = (k: string, max = 300) => str(fd.get(k), max);
    const tilesOf = (k: string) => arr(k).map((x: Record<string, unknown>): Tile => ({ id: str(x.id, 20) || newId(), title: str(x.title, 80), text: str(x.text, 160), image: str(x.image, 1000), href: str(x.href, 300) })).filter((x: Tile) => x.title || x.image);
    const h = { ...defaultHome, ...c.home };
    h.occasionsTitle = t("occasionsTitle", 80); h.occasions = tilesOf("occasions");
    h.giftsTitle = t("giftsTitle", 80); h.gifts = tilesOf("gifts");
    h.badgesTitle = t("badgesTitle", 80);
    h.badges = arr("badges").map((x: Record<string, unknown>): Badge => ({ id: str(x.id, 20) || newId(), icon: str(x.icon, 6), title: str(x.title, 60), text: str(x.text, 160) })).filter((x: Badge) => x.title);
    h.promo = { image: t("promo.image", 1000), eyebrow: t("promo.eyebrow", 60), title: t("promo.title", 120), text: t("promo.text", 300), cta: t("promo.cta", 40), href: t("promo.href", 300) };
    h.collection = { category: t("collection.category", 60), title: t("collection.title", 80) };
    h.faqTitle = t("faqTitle", 80); h.newsletterTitle = t("newsletterTitle", 120); h.newsletterText = t("newsletterText", 300);
    h.visitTitle = t("visitTitle", 80); h.visitText = t("visitText", 400); h.showMap = fd.get("showMap") === "on";
    c.home = h;
  });
}

export async function saveReels(fd: FormData) {
  await update("/admin/reels", (c) => {
    c.reels = list(fd).map((x): Reel => ({
      id: str(x.id, 20) || newId(), media: str(x.media, 1000), poster: str(x.poster, 1000), caption: str(x.caption, 200),
      href: str(x.href, 300), where: (["home", "product", "both"].includes(String(x.where)) ? x.where : "both") as Reel["where"], instagram: str(x.instagram, 300),
    })).filter((x) => x.media || x.poster);
  });
}

export async function saveReviews(fd: FormData) {
  await update("/admin/reviews", (c) => {
    c.reviews = list(fd).map((x): Review => ({
      id: str(x.id, 20) || newId(), name: str(x.name, 80), place: str(x.place, 80), text: str(x.text, 800),
      rating: Math.min(5, Math.max(1, Math.round(Number(x.rating) || 5))), product: str(x.product, 120),
    })).filter((x) => x.text);
  });
}

export async function saveTheme(fd: FormData) {
  await update("/admin/theme", (c) => {
    const t: Theme = { ...defaultTheme, ...c.theme };
    for (const k of ["background", "text", "soft", "soft2", "dark", "accent", "gold", "bar"] as const) {
      const v = str(fd.get(k), 7); if (/^#[0-9a-f]{6}$/i.test(v)) t[k] = v.toLowerCase();
    }
    const hf = str(fd.get("headingFont"), 40), bf = str(fd.get("bodyFont"), 40);
    if (FONTS[hf]) t.headingFont = hf;
    if (FONTS[bf]) t.bodyFont = bf;
    t.headingWeight = fd.get("headingWeight") === "normal" ? "normal" : "bold";
    const cr = str(fd.get("corners"), 10); t.corners = cr === "round" || cr === "soft" ? cr : "square";
    if (fd.get("reset") === "1") Object.assign(t, defaultTheme);
    c.theme = t;
  });
}

export async function savePlugins(fd: FormData) {
  await update("/admin/plugins", (c) => {
    const on = (k: string) => fd.get(`${k}.on`) === "on";
    const t = (k: string, max = 300) => str(fd.get(k), max);
    const n = (k: string, d: number, lo = 0, hi = 365) => { const v = Number(fd.get(k)); return Number.isFinite(v) && fd.get(k) !== "" ? Math.min(hi, Math.max(lo, v)) : d; };
    const d = defaultPlugins;
    const p: Plugins = {
      popup: { on: on("popup"), title: t("popup.title", 120), text: t("popup.text", 400), image: t("popup.image", 1000), coupon: t("popup.coupon", 40).toUpperCase(),
        button: t("popup.button", 40), href: t("popup.href", 300), email: fd.get("popup.email") === "on", delay: n("popup.delay", d.popup.delay, 0, 120), exit: fd.get("popup.exit") === "on", days: n("popup.days", d.popup.days, 0, 365) },
      newsletter: { on: on("newsletter"), title: t("newsletter.title", 120), text: t("newsletter.text", 300) },
      coupons: { on: on("coupons") },
      upsell: { on: on("upsell"), productTitle: t("upsell.productTitle", 80) || d.upsell.productTitle, cartTitle: t("upsell.cartTitle", 80) || d.upsell.cartTitle },
      shipBar: { on: on("shipBar") },
      whatsapp: { on: on("whatsapp"), number: t("whatsapp.number", 30), text: t("whatsapp.text", 300) },
      recent: { on: on("recent"), title: t("recent.title", 80) || d.recent.title },
      stickyBuy: { on: on("stickyBuy") },
    };
    c.plugins = p;
    if (fd.has("coupons")) {
      const seen = new Set<string>();
      c.coupons = (() => { try { const v = JSON.parse(String(fd.get("coupons"))); return Array.isArray(v) ? v.slice(0, 100) : []; } catch { return []; } })()
        .map((x: Record<string, unknown>): Coupon => ({
          code: str(x.code, 30).toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
          kind: (["percent", "amount", "shipping"].includes(String(x.kind)) ? x.kind : "percent") as Coupon["kind"],
          value: Math.max(0, Number(x.value) || 0), minOrder: Math.max(0, Number(x.minOrder) || 0),
          expires: /^\d{4}-\d{2}-\d{2}$/.test(String(x.expires)) ? String(x.expires) : "", on: !!x.on,
        }))
        .filter((x: Coupon) => x.code && !seen.has(x.code) && seen.add(x.code));
    }
  });
}

/* ---------- Instagram ---------- */
export async function connectInstagram(fd: FormData) {
  await guard();
  const { checkToken } = await import("@/lib/instagram");
  const { saveInstagram } = await import("@/lib/store");
  const token = str(fd.get("token"), 1000);
  try {
    const user = await checkToken(token);
    await saveInstagram({ token, user, refreshed: new Date().toISOString() });
  } catch (e) { redirect(`/admin/reels?ig=${encodeURIComponent((e as Error).message.slice(0, 150))}`); }
  redirect("/admin/reels?ig=ok");
}
export async function disconnectInstagram() {
  await guard();
  const { saveInstagram } = await import("@/lib/store");
  await saveInstagram(null);
  redirect("/admin/reels");
}
/** Copies an Instagram post into the shop's own storage (Instagram's links expire) and adds it as a reel. */
export async function importInstagram(fd: FormData) {
  await guard();
  const { getPost } = await import("@/lib/instagram");
  const { copyIntoStorage, storageEnabled } = await import("@/lib/uploads");
  const post = await getPost(str(fd.get("id"), 40));
  if (!post) redirect("/admin/reels?ig=That post could not be found.");
  const keep = async (u: string) => (storageEnabled ? copyIntoStorage(u) : u);
  let media = "", poster = "";
  try {
    media = await keep(post.media);
    poster = post.type === "VIDEO" && post.thumb !== post.media ? await keep(post.thumb) : "";
  } catch (e) { redirect(`/admin/reels?ig=${encodeURIComponent(`Could not copy the post: ${(e as Error).message}`.slice(0, 150))}`); }
  await update("/admin/reels", (c) => {
    c.reels = [...c.reels, { id: newId(), media, poster, caption: post.caption.split("\n")[0].slice(0, 200), href: "", where: "both", instagram: post.link }];
  });
}

export async function publish(fd: FormData) {
  await guard();
  await publishDraft();
  (await draftMode()).disable();
  revalidatePath("/", "layout");
  redirect(`${backTo(fd.get("back"))}?published=1`);
}
export async function discard(fd: FormData) {
  await guard();
  await discardDraft();
  (await draftMode()).disable();
  revalidatePath("/", "layout");
  redirect(`${backTo(fd.get("back"))}?discarded=1`);
}

/** Copies photos still stored in Vercel Blob into Supabase Storage and updates every place that uses them. */
export async function movePhotos() {
  if ((await getRole()) !== "admin") redirect("/admin/settings");
  const { copyIntoStorage, storageEnabled } = await import("@/lib/uploads");
  const { findMediaUrls, replaceMediaUrls } = await import("@/lib/store");
  if (!storageEnabled) redirect("/admin/settings?moved=none");
  const urls = await findMediaUrls(/\.blob\.vercel-storage\.com\//);
  const map: Record<string, string> = {};
  let failed = 0;
  for (const u of urls) {
    try { map[u] = await copyIntoStorage(u); } catch (e) { failed++; console.error("[move photos]", (e as Error).message); }
  }
  await replaceMediaUrls(map);
  revalidatePath("/", "layout");
  redirect(`/admin/settings?moved=${Object.keys(map).length}&failed=${failed}`);
}
