import { permanentRedirect } from "next/navigation";
import ShopList, { isFiltered, type ShopQuery } from "@/components/ShopList";
import { siteContent } from "@/lib/site";
import { meta } from "@/lib/seo";
import { words } from "@/lib/words";

type P = { searchParams: Promise<ShopQuery & { cat?: string }> };

export async function generateMetadata({ searchParams }: P) {
  const q = await searchParams;
  const c = await siteContent();
  const page = Number(q.page) > 1 ? `?page=${Number(q.page)}` : "";
  return meta(c.site, {
    title: words(c.words).shopAllTitle, path: `/shop${page}`, noindex: isFiltered(q),
    description: `Shop ${c.categories.filter((x) => !x.parent).map((x) => x.name.toLowerCase()).join(", ")} from ${c.site.brand}. ${c.site.tagline}.`,
  });
}

export default async function Shop({ searchParams }: P) {
  const { cat, ...q } = await searchParams;
  if (cat) { // old addresses like /shop?cat=rings
    const sp = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]);
    permanentRedirect(`/shop/${encodeURIComponent(cat)}${sp.size ? `?${sp}` : ""}`);
  }
  return <ShopList c={await siteContent()} cat={null} q={q} />;
}
