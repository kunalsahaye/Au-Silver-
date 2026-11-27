"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Reel } from "@/lib/types";
import { igCode } from "@/lib/img";

/** A reel pasted as an Instagram link, played through Instagram's own embed. */
function InstagramReel({ code, caption }: { code: string; caption: string }) {
  return (
    <figure className="w-[300px] shrink-0 snap-start overflow-hidden rounded-box border border-ink/10 bg-white md:w-[328px]">
      <iframe src={`https://www.instagram.com/reel/${code}/embed/`} title={caption || "Instagram reel"} loading="lazy" allowFullScreen
        className="block h-[560px] w-full border-0 md:h-[600px]" />
    </figure>
  );
}

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
        <video ref={v} src={r.media} poster={r.poster || undefined} muted={muted} loop playsInline preload={r.poster ? "none" : "metadata"} className="absolute inset-0 h-full w-full object-cover" aria-label={r.caption || "Video"} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.media || r.poster} alt={r.caption} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {video && (
        <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Turn sound on" : "Turn sound off"}
          className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M4 9v6h4l5 4V5L8 9H4z" />{muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M17 8.5a5 5 0 010 7M19.5 6a8.5 8.5 0 010 12" />}</svg>
        </button>
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

export default function Reels({ reels, title, eyebrow, follow }: { reels: Reel[]; title: string; eyebrow?: string; follow?: { href: string; label: string } }) {
  if (!reels.length) return null;
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-16">
      {eyebrow && <p className="mb-3 text-[10px] tracking-[0.22em] uppercase opacity-50">{eyebrow}</p>}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-4xl tracking-[-0.045em] md:text-5xl">{title}</h2>
        {follow && <a href={follow.href} target="_blank" rel="noopener" className="border-b border-ink pb-1 text-[11px] tracking-[0.12em] uppercase">Follow {follow.label} →</a>}
      </div>
      <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2">{reels.map((r) => !r.media && !r.poster && igCode(r.instagram) ? <InstagramReel key={r.id} code={igCode(r.instagram)} caption={r.caption} /> : <ReelCard key={r.id} r={r} />)}</div>
    </section>
  );
}
