import Link from "next/link";
import Photo from "@/components/Photo";
import RichText from "@/components/RichText";
import { siteContent } from "@/lib/site";
import { meta, pageDescription, pageTitle } from "@/lib/seo";
import { words } from "@/lib/words";

export async function generateMetadata() {
  const c = await siteContent();
  const page = c.pages.find((p) => p.slug === "about");
  return meta(c.site, { title: page ? pageTitle(page) : "About us", description: page ? pageDescription(page) : c.site.aboutBody, path: "/about", image: page?.image || c.site.img8 });
}

export default async function About() {
  const c = await siteContent();
  const s = c.site;
  const page = c.pages.find((p) => p.slug === "about");
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <p className="eyebrow text-burgundy">{page?.title ?? "About us"}</p>
      <h1 className="serif mt-4 text-6xl leading-tight italic">{s.storyTitle}</h1>
      {(page?.image || s.img8) && <Photo src={page?.image || s.img8} alt={s.storyTitle} eager className="mt-10 aspect-[16/9] w-full rounded-2xl" />}
      <div className="mt-10 text-lg opacity-80"><RichText text={page?.body ?? s.aboutBody} /></div>
      <Link href="/shop" className="btn btn-dark mt-12">{words(c.words).exploreCollection}</Link>
    </div>
  );
}
