import { headers } from "next/headers";
import { saveSeo } from "../../content-actions";
import EditorForm, { Box, Text } from "@/components/admin/EditorForm";
import ImageField from "@/components/admin/ImageField";
import SeoFields from "@/components/admin/SeoFields";
import { getDraft, getProducts } from "@/lib/store";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Seo({ searchParams }: Q) {
  const q = await searchParams;
  const [{ content: c }, products] = await Promise.all([getDraft(), getProducts()]);
  const s = c.site;
  const h = await headers();
  const base = s.siteUrl || `https://${h.get("host")}`;
  const noPhoto = products.filter((p) => !p.image_url).length;
  const noAlt = products.filter((p) => p.image_url && !p.seo.alt).length;
  const shortDesc = products.filter((p) => (p.description || "").length < 50).length;
  const checks: [boolean, string][] = [
    [!!s.siteUrl, "Your web address is filled in below"],
    [!!(s.seoDescription || s.heroSub), "The homepage has a description for Google"],
    [!!s.shareImage, "A share picture is set (shown on WhatsApp, Facebook, Google)"],
    [!!(s.address && s.city && s.postalCode), "Your shop address is complete (helps Google Maps and local search)"],
    [!!s.googleVerification, "Google Search Console is connected"],
    [noPhoto === 0, noPhoto ? `${noPhoto} product${noPhoto === 1 ? " has" : "s have"} no photo` : "Every product has a photo"],
    [noAlt === 0, noAlt ? `${noAlt} product photo${noAlt === 1 ? " has" : "s have"} no description (Products > edit > Photo description)` : "Every product photo has a description"],
    [shortDesc === 0, shortDesc ? `${shortDesc} product${shortDesc === 1 ? " has a" : "s have"} very short description` : "Every product has a description"],
  ];
  return (
    <EditorForm title="Google and SEO" q={q} action={saveSeo}
      intro="How your shop appears on Google, Google Maps, Google Shopping, WhatsApp and Facebook. Sitemap, structured data and product feed are made automatically.">
      <Box title="Checklist">
        <ul className="space-y-2 text-sm">
          {checks.map(([ok, t]) => <li key={t} className="flex gap-3"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${ok ? "bg-green-100 text-green-800" : "bg-gold/20"}`}>{ok ? "✓" : "!"}</span>{t}</li>)}
        </ul>
      </Box>
      <Box title="Your shop on Google">
        <Text name="siteUrl" label="Your web address" value={s.siteUrl} hint="e.g. https://ausilver.in — the address customers type. Used in Google, the sitemap and shared links." />
        <SeoFields title={s.seoTitle} description={s.seoDescription} url={base}
          fallbackTitle={`${s.brand} | ${s.tagline}`} fallbackDescription={s.heroSub} />
        <ImageField name="shareImage" label="Share picture (1200 × 630 works best)" defaultValue={s.shareImage} hint="Shown when someone shares your shop on WhatsApp, Facebook or X." />
      </Box>
      <Box title="Local business (Google Maps and “near me” searches)">
        <Text name="mapsLink" label="Google Maps link" value={s.mapsLink} hint="Your shop's Google listing. In Google Maps tap Share and paste the link. Used for Directions and “Read all reviews on Google”." />
        <Text name="mapEmbed" label="Map on the homepage (optional)" value={s.mapEmbed} area={2} hint="For an exact pin: in Google Maps on a computer open your shop, Share › Embed a map › Copy HTML, and paste it here. Without it the map uses the address below." />
        <Text name="address" label="Street address" value={s.address} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="city" label="City" value={s.city} />
          <Text name="region" label="State" value={s.region} hint="e.g. Maharashtra" />
          <Text name="postalCode" label="PIN code" value={s.postalCode} />
          <Text name="country" label="Country code" value={s.country} hint="IN for India" />
          <Text name="latitude" label="Latitude" value={s.latitude} hint="In Google Maps, long-press your shop and copy the first number" />
          <Text name="longitude" label="Longitude" value={s.longitude} hint="…and the second number" />
          <Text name="openingHours" label="Opening hours" value={s.openingHours} hint="e.g. Mo-Sa 10:00-20:00 (leave empty if online only)" />
          <Text name="priceRange" label="Price range" value={s.priceRange} hint="e.g. ₹₹" />
        </div>
      </Box>
      <Box title="Connect Google and Bing">
        <Text name="googleVerification" label="Google Search Console code" value={s.googleVerification} hint="In Search Console choose “URL prefix”, then “HTML tag”, and paste the whole tag here." />
        <Text name="bingVerification" label="Bing Webmaster code (optional)" value={s.bingVerification} hint="Paste Bing's meta tag the same way." />
        <div className="rounded-xl bg-[#f7f2ec] p-4 text-sm leading-relaxed">
          <p className="font-medium">Your automatic files</p>
          <p>Sitemap: <a className="underline" target="_blank" href={`${base}/sitemap.xml`}>{base}/sitemap.xml</a></p>
          <p>Product feed for Google Merchant Center: <a className="underline" target="_blank" href={`${base}/feed.xml`}>{base}/feed.xml</a></p>
          <p>Robots: <a className="underline" target="_blank" href={`${base}/robots.txt`}>{base}/robots.txt</a></p>
          <p className="mt-2 opacity-70">After publishing, add the sitemap in Google Search Console (Sitemaps) and the feed in Merchant Center (Products, Add feed, Scheduled fetch).</p>
        </div>
      </Box>
    </EditorForm>
  );
}
