import type { MetadataRoute } from "next";
import { getContent, getProducts } from "@/lib/store";
import { baseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Every public page, for Google and Bing. Updates itself as products and pages change. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [c, products] = await Promise.all([getContent(), getProducts()]);
  const base = await baseUrl(c.site);
  const now = new Date();
  const pagePath = (slug: string) => `/${slug}`;
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...c.categories.map((x) => ({ url: `${base}/shop/${x.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: x.parent ? 0.7 : 0.8 })),
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`, lastModified: new Date(p.created_at), changeFrequency: "weekly" as const, priority: 0.8,
      images: [p.image_url, ...p.images].filter((u): u is string => !!u).map((u) => (u.startsWith("http") ? u : `${base}${u}`)),
    })),
    ...c.pages.map((p) => ({ url: `${base}${pagePath(p.slug)}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
