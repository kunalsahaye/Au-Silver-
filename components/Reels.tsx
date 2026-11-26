"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/types";

/** One 9:16 video that plays only while on screen; tap for sound. */
function ReelCard({ r }: { r: Reel }) {
  const v = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const el = v.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.play().catch(() => {}); else el.pause(); }, { threshold: 0.6 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const video = /\.(mp4|mov|webm)(\?|$)/i.test(r.media) || r.media.includes("video");
  return (
    <figure className="relative w-[200px] shrink-0 snap-start overflow-hidden rounded-box bg-wine md:w-[240px]" style={{ aspectRatio: "9/16" }}>
      {video ? (
        <video ref={v} src={r.media} poster={r.poster || undefined} muted={muted} loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" aria-label={r.caption || "Video"} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.media || r.poster} alt={r.caption} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {video && (
        <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn sound on" : "Turn sound off"}
          className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-sm text-white backdrop-blur">{muted ? "🔇" : "🔊"}</button>
      )}
      {(r.caption || r.href) && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
          {r.caption && <p className="line-clamp-2 text-xs leading-snug">{r.caption}</p>}
          {r.href && <Link href={r.href} className="mt-2 inline-block border border-white px-3 py-1.5 text-[10px] tracking-widest uppercase">Shop this</Link>}
        </figcaption>
      )}
    </figure>
  );
}

export default function Reels({ reels, title, eyebrow }: { reels: Reel[]; title: string; eyebrow?: string }) {
  if (!reels.length) return null;
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-16">
      {eyebrow && <p className="mb-2 text-[10px]">{eyebrow}</p>}
      <h2 className="mb-8 text-4xl tracking-[-0.045em] md:text-5xl">{title}</h2>
      <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2">{reels.map((r) => <ReelCard key={r.id} r={r} />)}</div>
    </section>
  );
}
