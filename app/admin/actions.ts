"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkLogin, endSession, getRole, startSession } from "@/lib/auth";
import { deleteProduct, getDraft, saveProduct, setEnquiryStatus, setOrderStatus } from "@/lib/store";
import type { Enquiry, Metal, Order } from "@/lib/types";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const oneOf = <T extends string>(v: string, list: readonly T[], fallback: T): T => (list.includes(v as T) ? (v as T) : fallback);
const METALS = ["gold", "silver", "rose"] as const;
const ORDER = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
const ENQ = ["new", "contacted", "closed"] as const;
async function guard() { if (!(await getRole())) redirect("/admin/login"); }

// Slows down password guessing: 5 wrong tries from one address lock it out for 15 minutes (per server instance).
const tries = new Map<string, { n: number; first: number; until: number }>();
export async function login(fd: FormData) {
  const ip = ((await headers()).get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const t = tries.get(ip);
  if (t && t.until > Date.now()) redirect("/admin/login?error=locked");
  const role = checkLogin(s(fd, "email"), String(fd.get("password") ?? ""));
  if (!role) {
    const fresh = !t || Date.now() - t.first > 15 * 60_000;
    const n = (fresh ? 0 : t.n) + 1;
    tries.set(ip, { n, first: fresh ? Date.now() : t.first, until: n >= 5 ? Date.now() + 15 * 60_000 : 0 });
    await new Promise((r) => setTimeout(r, 600));
    redirect("/admin/login?error=1");
  }
  tries.delete(ip);
  await startSession(role);
  redirect("/admin");
}
export async function logout() { await endSession(); redirect("/admin/login"); }

export async function upsertProduct(fd: FormData) {
  await guard();
  if (!s(fd, "name")) redirect("/admin/products");
  const cats = (await getDraft()).content.categories.map((c) => c.slug);
  let images: string[] = [];
  try { const v = JSON.parse(s(fd, "images") || "[]"); if (Array.isArray(v)) images = v.map(String).filter((u) => /^(https?:\/\/|\/uploads\/)/.test(u)); } catch {}
  await saveProduct({
    id: s(fd, "id") || undefined, name: s(fd, "name"), slug: s(fd, "slug") || undefined,
    category: oneOf<string>(s(fd, "category"), cats, cats[0] ?? "rings"), metal: oneOf<Metal>(s(fd, "metal"), METALS, "silver"),
    price: Math.max(0, Number(s(fd, "price")) || 0), stock: Math.max(0, Math.floor(Number(s(fd, "stock")) || 0)),
    description: s(fd, "description"), material: s(fd, "material"), finish: s(fd, "finish"),
    image_url: images[0] ?? null, images: images.slice(1),
    seo: {
      title: s(fd, "seoTitle").slice(0, 70), description: s(fd, "seoDescription").slice(0, 170),
      alt: s(fd, "alt").slice(0, 150), sku: s(fd, "sku").slice(0, 40),
      weight: s(fd, "weight").slice(0, 40), size: s(fd, "size").slice(0, 80), stone: s(fd, "stone").slice(0, 80),
      ...(Number(s(fd, "compareAt")) > Number(s(fd, "price")) ? { compareAt: Math.round(Number(s(fd, "compareAt"))) } : {}),
    },
    featured: fd.get("featured") === "on", bestseller: fd.get("bestseller") === "on",
  });
  revalidatePath("/", "layout");
  redirect("/admin/products");
}
export async function removeProduct(fd: FormData) {
  if ((await getRole()) !== "admin") redirect("/admin/products");
  await deleteProduct(s(fd, "id"));
  revalidatePath("/", "layout");
  redirect("/admin/products");
}
export async function enquiryStatus(fd: FormData) {
  await guard(); await setEnquiryStatus(s(fd, "id"), oneOf<Enquiry["status"]>(s(fd, "status"), ENQ, "new"));
  revalidatePath("/admin/enquiries");
}
export async function orderStatus(fd: FormData) {
  await guard();
  const res = await setOrderStatus(s(fd, "id"), oneOf<Order["status"]>(s(fd, "status"), ORDER, "new"));
  revalidatePath("/", "layout");
  if (!res.ok) redirect(`/admin/orders?soldout=${encodeURIComponent(res.soldOut)}`);
}
