"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface Mini { slug: string; name: string; price: string; image: string }
const KEY = "recent";

/** Remembers the product being viewed (pass `current`) and shows the other ones this visitor looked at. */
export default function RecentlyViewed({ current, all, title }: { current?: string; all: Mini[]; title: string }) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    let l: string[] = [];
    try { l = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setList(l.filter((s) => s !== current));
    if (current) try { localStorage.setItem(KEY, JSON.stringify([current, ...l.filter((s) => s !== current)].slice(0, 12))); } catch {}
  }, [current]);
  const shown = list.map((s) => all.find((p) => p.slug === s)).filter((p): p is Mini => !!p).slice(0, 6);
  if (!shown.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <h2 className="mb-6 text-2xl tracking-[-0.03em]">{title}</h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto">
        {shown.map((p) => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="w-[140px] shrink-0">
            <div className="aspect-square overflow-hidden bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.image && <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />}
            </div>
            <p className="mt-2 truncate text-[11px]">{p.name}</p><p className="text-[11px] opacity-60">{p.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
