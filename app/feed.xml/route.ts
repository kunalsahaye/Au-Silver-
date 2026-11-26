import { getContent, getProducts } from "@/lib/store";
import { baseUrl, productDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

const x = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));

/** Product feed for Google Merchant Center (free listings and Shopping ads). RSS 2.0 with g: fields. */
export async function GET() {
  const [c, products] = await Promise.all([getContent(), getProducts()]);
  const s = c.site, base = await baseUrl(s);
  const catPath = (slug: string) => {
    const cat = c.categories.find((k) => k.slug === slug);
    const parent = cat?.parent ? c.categories.find((k) => k.slug === cat.parent) : null;
    return [parent?.name, cat?.name ?? slug].filter(Boolean).join(" > ");
  };
  const fee = Number(s.shippingFee) || 0;
  const items = products.filter((p) => p.image_url).map((p) => {
    const img = (u: string) => (u.startsWith("http") ? u : `${base}${u}`);
    return `<item>
<g:id>${x(p.seo.sku || p.slug)}</g:id>
<g:title>${x(p.seo.title || p.name)}</g:title>
<g:description>${x(productDescription(p))}</g:description>
<g:link>${x(`${base}/product/${p.slug}`)}</g:link>
<g:image_link>${x(img(p.image_url!))}</g:image_link>
${p.images.slice(0, 10).map((u) => `<g:additional_image_link>${x(img(u))}</g:additional_image_link>`).join("\n")}
<g:availability>${p.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
<g:price>${Number(p.price).toFixed(2)} INR</g:price>
<g:brand>${x(s.brand)}</g:brand>
<g:condition>new</g:condition>
<g:identifier_exists>no</g:identifier_exists>
<g:google_product_category>188</g:google_product_category>
<g:product_type>${x(catPath(p.category))}</g:product_type>
<g:material>${x(p.material || "925 Sterling Silver")}</g:material>
<g:color>${x(p.metal)}</g:color>
<g:shipping><g:country>IN</g:country><g:price>${fee.toFixed(2)} INR</g:price></g:shipping>
</item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${x(s.brand)}</title>
<link>${x(base)}</link>
<description>${x(s.seoDescription || s.heroSub)}</description>
${items.join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
