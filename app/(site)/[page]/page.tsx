import { notFound } from "next/navigation";
import RichText from "@/components/RichText";
import { siteContent } from "@/lib/site";

/** Pages added in the admin (FAQ, Care guide, Returns …), at /<web address>. */
export default async function CustomPage({ params }: { params: Promise<{ page: string }> }) {
  const { page: slug } = await params;
  const c = await siteContent();
  const page = c.pages.find((p) => p.slug === slug);
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="serif mb-10 text-5xl leading-tight italic md:text-6xl">{page.title}</h1>
      <div className="text-lg opacity-85"><RichText text={page.body} faq={slug === "faq"} /></div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const { page: slug } = await params;
  const c = await siteContent();
  const page = c.pages.find((p) => p.slug === slug);
  return page ? { title: `${page.title} · ${c.site.brand}` } : {};
}
