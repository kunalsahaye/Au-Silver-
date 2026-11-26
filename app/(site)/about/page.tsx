import Link from "next/link";
import { getSettings } from "@/lib/store";

export default async function About() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <p className="eyebrow text-burgundy">About us</p>
      <h1 className="serif mt-4 text-6xl leading-tight italic">{s.storyTitle}</h1>
      <div className="mt-10 space-y-6 text-lg leading-relaxed opacity-80 whitespace-pre-line">{s.aboutBody}</div>
      <Link href="/shop" className="btn btn-dark mt-12">Explore the collection</Link>
    </div>
  );
}
