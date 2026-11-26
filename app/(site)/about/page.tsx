import Link from "next/link";
import Photo from "@/components/Photo";
import RichText from "@/components/RichText";
import { siteContent } from "@/lib/site";

export default async function About() {
  const c = await siteContent();
  const s = c.site;
  const page = c.pages.find((p) => p.slug === "about");
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <p className="eyebrow text-burgundy">{page?.title ?? "About us"}</p>
      <h1 className="serif mt-4 text-6xl leading-tight italic">{s.storyTitle}</h1>
      {s.img8 && <Photo src={s.img8} alt="" className="mt-10 aspect-[16/9] w-full rounded-2xl" />}
      <div className="mt-10 text-lg opacity-80"><RichText text={page?.body ?? s.aboutBody} /></div>
      <Link href="/shop" className="btn btn-dark mt-12">Explore the collection</Link>
    </div>
  );
}
