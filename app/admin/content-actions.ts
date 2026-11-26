"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { draftMode } from "next/headers";
import { getRole } from "@/lib/auth";
import { discardDraft, getDraft, publishDraft, saveDraft } from "@/lib/store";
import type { CategoryItem, Content, Customer, PageItem, Section, SiteSettings, Slide } from "@/lib/types";
import { defaultSections } from "@/lib/seed";
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
