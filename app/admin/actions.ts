"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkLogin, endSession, getRole, startSession } from "@/lib/auth";
import { deleteProduct, saveProduct, saveSettings, setEnquiryStatus, setOrderStatus } from "@/lib/store";
import type { Category, Enquiry, Metal, Order, SiteSettings } from "@/lib/types";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
async function guard() { if (!(await getRole())) redirect("/admin/login"); }

export async function login(fd: FormData) {
  const role = checkLogin(s(fd, "email"), String(fd.get("password") ?? ""));
  if (!role) redirect("/admin/login?error=1");
  await startSession(role);
  redirect("/admin");
}
export async function logout() { await endSession(); redirect("/admin/login"); }

export async function upsertProduct(fd: FormData) {
  await guard();
  await saveProduct({
    id: s(fd, "id") || undefined, name: s(fd, "name"), slug: s(fd, "slug") || undefined,
    category: s(fd, "category") as Category, metal: s(fd, "metal") as Metal,
    price: Number(s(fd, "price")), stock: Number(s(fd, "stock")),
    description: s(fd, "description"), material: s(fd, "material"), finish: s(fd, "finish"),
    image_url: s(fd, "image_url") || null,
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
export async function updateContent(fd: FormData) {
  await guard();
  const keys: (keyof SiteSettings)[] = ["brand", "tagline", "announcement", "heroTitle", "heroSub", "storyTitle", "storyBody", "aboutBody", "email", "phone", "address", "instagram", "currency", "img1", "img2", "img3", "img4", "img5", "img6", "img7", "img8"];
  const v = {} as SiteSettings;
  keys.forEach((k) => (v[k] = s(fd, k)));
  await saveSettings(v);
  revalidatePath("/", "layout");
  redirect("/admin/content?saved=1");
}
export async function enquiryStatus(fd: FormData) {
  await guard(); await setEnquiryStatus(s(fd, "id"), s(fd, "status") as Enquiry["status"]);
  revalidatePath("/admin/enquiries");
}
export async function orderStatus(fd: FormData) {
  await guard(); await setOrderStatus(s(fd, "id"), s(fd, "status") as Order["status"]);
  revalidatePath("/admin/orders");
}
