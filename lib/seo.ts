import "server-only";
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { Content, PageItem, Product, SiteSettings } from "./types";

/** The shop's public address, e.g. https://ausilver.in (from settings, then SITE_URL, then the request). */
export async function baseUrl(site: SiteSettings): Promise<string> {
  if (site.siteUrl) return site.siteUrl;
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const abs = (base: string, u: string) => (!u ? undefined : /^https?:\/\//.test(u) ? u : `${base}${u.startsWith("/") ? "" : "/"}${u}`);
const clip = (s: string, n: number) => { const t = s.replace(/\s+/g, " ").trim(); return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t; };

/** Title, description, canonical address and share cards for one page. */
export async function meta(site: SiteSettings, o: {
  title: string; description?: string; path: string; image?: string; type?: "website" | "article"; noindex?: boolean; fullTitle?: boolean;
}): Promise<Metadata> {
  const base = await baseUrl(site);
  const url = `${base}${o.path}`;
  const description = clip(o.description || site.seoDescription || site.heroSub, 160);
  const image = abs(base, o.image || site.shareImage || site.img1);
  const title = o.fullTitle ? o.title : `${o.title} | ${site.brand}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: { "en-IN": url, "x-default": url } },
    robots: o.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, siteName: site.brand, locale: "en_IN", type: o.type ?? "website", images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export const productTitle = (p: Product) => p.seo.title || p.name;
export const productDescription = (p: Product) => p.seo.description || p.description || `${p.name} in ${p.material || "925 sterling silver"}.`;
export const pageTitle = (p: PageItem) => p.seoTitle || p.title;
export const pageDescription = (p: PageItem) => p.seoDescription || p.body.replace(/^## .*$/gm, "").replace(/^- /gm, "");

/* ---------- structured data (schema.org JSON-LD) ---------- */
export function sameAs(s: SiteSettings): string[] {
  const ig = s.instagram ? (/^https?:/.test(s.instagram) ? s.instagram : `https://www.instagram.com/${s.instagram.replace(/^@/, "")}`) : "";
  return [ig, s.facebook, s.youtube, s.pinterest].filter((x) => /^https?:\/\//.test(x));
}

export function storeLd(c: Content, base: string) {
  const s = c.site;
  const address = s.address || s.city ? {
    "@type": "PostalAddress", streetAddress: s.address || undefined, addressLocality: s.city || undefined,
    addressRegion: s.region || undefined, postalCode: s.postalCode || undefined, addressCountry: s.country || "IN",
  } : undefined;
  return [
    {
      "@context": "https://schema.org", "@type": "WebSite", "@id": `${base}/#website`, url: base, name: s.brand, inLanguage: "en-IN",
      potentialAction: { "@type": "SearchAction", target: `${base}/shop?q={search_term_string}`, "query-input": "required name=search_term_string" },
    },
    {
      "@context": "https://schema.org", "@type": ["JewelryStore", "OnlineStore"], "@id": `${base}/#store`,
      name: s.brand, description: s.seoDescription || s.heroSub, url: base,
      logo: abs(base, s.logo) , image: abs(base, s.shareImage || s.img1),
      email: s.email || undefined, telephone: s.phone || undefined, priceRange: s.priceRange || undefined,
      currenciesAccepted: "INR", address,
      geo: s.latitude && s.longitude ? { "@type": "GeoCoordinates", latitude: Number(s.latitude), longitude: Number(s.longitude) } : undefined,
      openingHours: s.openingHours || undefined,
      areaServed: { "@type": "Country", name: "India" },
      sameAs: sameAs(s),
    },
  ];
}

export function breadcrumbLd(base: string, items: [string, string][]) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${base}${path}` })),
  };
}

export function productLd(p: Product, c: Content, base: string, categoryName: string) {
  const s = c.site;
  const images = [p.image_url, ...p.images].filter(Boolean).map((u) => abs(base, u!)!);
  const days = (s.deliveryDays || "3-7").split("-").map((n) => Number(n.trim()) || 0);
  const fee = Number(s.shippingFee) || 0;
  return {
    "@context": "https://schema.org", "@type": "Product",
    name: p.name, description: productDescription(p), sku: p.seo.sku || p.slug, image: images.length ? images : undefined,
    brand: { "@type": "Brand", name: s.brand }, category: categoryName, material: p.material || undefined, color: p.metal,
    url: `${base}/product/${p.slug}`,
    offers: {
      "@type": "Offer", url: `${base}/product/${p.slug}`, priceCurrency: "INR", price: Number(p.price).toFixed(2),
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition", seller: { "@id": `${base}/#store` },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: fee, currency: "INR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: days[0] || 3, maxValue: days[1] || days[0] || 7, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: Number(s.returnDays) > 0 ? {
        "@type": "MerchantReturnPolicy", applicableCountry: "IN", returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: Number(s.returnDays), returnMethod: "https://schema.org/ReturnByMail",
      } : { "@type": "MerchantReturnPolicy", applicableCountry: "IN", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" },
    },
  };
}

export function faqLd(body: string) {
  const items: { q: string; a: string[] }[] = [];
  for (const line of body.replace(/\r/g, "").split("\n")) {
    if (line.startsWith("## ")) items.push({ q: line.slice(3).trim(), a: [] });
    else if (items.length && line.trim()) items[items.length - 1].a.push(line.replace(/^- /, "").trim());
  }
  if (!items.length) return null;
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a.join(" ") } })),
  };
}
