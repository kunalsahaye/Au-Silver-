import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import Photo from "@/components/Photo";
import RichText from "@/components/RichText";
import { siteContent } from "@/lib/site";
import { baseUrl, breadcrumbLd, faqLd, meta, pageDescription, pageTitle } from "@/lib/seo";

type P = { params: Promise<{ page: string }> };

/** Pages added in the admin (FAQ, Care guide, Returns …), at /<web address>. */
export default async function CustomPage({ params }: P) {
  const { page: slug } = await params;
  const c = await siteContent();
  const page = c.pages.find((p) => p.slug === slug);
  if (!page) notFound();
  const base = await baseUrl(c.site);
  const faq = slug === "faq" ? faqLd(page.body) : null;
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <JsonLd data={breadcrumbLd(base, [["Home", "/"], [page.title, `/${slug}`]])} />
      {faq && <JsonLd data={faq} />}
      <h1 className="serif mb-10 text-5xl leading-tight italic md:text-6xl">{page.title}</h1>
      {page.image && <Photo src={page.image} alt={page.title} eager className="mb-10 aspect-[16/9] w-full rounded-2xl" />}
      <div className="text-lg opacity-85"><RichText text={page.body} faq={slug === "faq"} /></div>
    </div>
  );
}

export async function generateMetadata({ params }: P) {
  const { page: slug } = await params;
  const c = await siteContent();
  const page = c.pages.find((p) => p.slug === slug);
  return page ? meta(c.site, { title: pageTitle(page), description: pageDescription(page), path: `/${slug}`, image: page.image, type: "article" }) : {};
}
