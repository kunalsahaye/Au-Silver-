import { notFound } from "next/navigation";
import ShopList, { isFiltered, type ShopQuery } from "@/components/ShopList";
import { siteContent } from "@/lib/site";
import { meta } from "@/lib/seo";

type P = { params: Promise<{ category: string }>; searchParams: Promise<ShopQuery> };

export async function generateMetadata({ params, searchParams }: P) {
  const [{ category }, q, c] = await Promise.all([params, searchParams, siteContent()]);
  const cat = c.categories.find((x) => x.slug === category);
  if (!cat) return {};
  const page = Number(q.page) > 1 ? `?page=${Number(q.page)}` : "";
  return meta(c.site, {
    title: cat.seoTitle || `${cat.name}`, path: `/shop/${cat.slug}${page}`, image: cat.image, noindex: isFiltered(q),
    description: cat.seoDescription || cat.description || `Shop ${cat.name.toLowerCase()} from ${c.site.brand}. ${c.site.tagline}.`,
  });
}

export default async function CategoryPage({ params, searchParams }: P) {
  const [{ category }, q, c] = await Promise.all([params, searchParams, siteContent()]);
  const cat = c.categories.find((x) => x.slug === category);
  if (!cat) notFound();
  return <ShopList c={c} cat={cat} q={q} />;
}
