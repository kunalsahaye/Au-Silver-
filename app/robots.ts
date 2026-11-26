import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/store";
import { baseUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await baseUrl(await getSettings());
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/cart"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
