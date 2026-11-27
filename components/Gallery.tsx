"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { canResize } from "@/lib/img";

const Chevron = ({ dir }: { dir: 1 | -1 }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d={dir > 0 ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} /></svg>
);

/** Product photos: one big photo, thumbnails to switch, and a full-screen view to look closely (tap the photo). */
export default function Gallery({ photos, name }: { photos: string[]; name: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const go = (d: number) => setI((k) => (k + d + photos.length) % photos.length);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    document.addEventListener("keydown", key); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = ""; };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const btn = "grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white";
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Zoom in on ${name}`} className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[2rem] bg-gradient-to-b from-blush to-cream">
        <Image src={photos[i]} alt={name} fill priority sizes="(min-width: 768px) 50vw, 100vw" unoptimized={!canResize(photos[i])} className="object-cover" />
        <span aria-hidden className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full bg-white/85">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5" /></svg>
        </span>
      </button>
      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {photos.map((u, k) => (
            <button key={u + k} type="button" onClick={() => setI(k)} aria-label={`Photo ${k + 1}`} aria-current={k === i} className={`aspect-square overflow-hidden rounded-xl border-2 ${k === i ? "border-ink" : "border-transparent opacity-70"}`}>
              <span className="relative block h-full w-full"><Image src={u} alt="" fill sizes="96px" unoptimized={!canResize(u)} className="object-cover" /></span>
            </button>
          ))}
        </div>
      )}
      {open && (
        <div role="dialog" aria-modal="true" aria-label={`${name}, photo ${i + 1} of ${photos.length}`} className="fixed inset-0 z-[80] bg-ivory" onClick={() => setOpen(false)}>
          <Image src={photos[i]} alt={name} fill sizes="100vw" unoptimized={!canResize(photos[i])} className="object-contain" />
          <button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Close" className={`absolute top-4 right-4 ${btn}`}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          {photos.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo" className={`absolute top-1/2 left-4 -translate-y-1/2 ${btn}`}><Chevron dir={-1} /></button>
              <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo" className={`absolute top-1/2 right-4 -translate-y-1/2 ${btn}`}><Chevron dir={1} /></button>
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tabular-nums opacity-60">{i + 1} / {photos.length}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
