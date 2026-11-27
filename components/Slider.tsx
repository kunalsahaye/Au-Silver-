"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Slide } from "@/lib/types";

/** Homepage slides: photos or videos that change every 6 seconds, with dots and swipe. */
export default function Slider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [x0, setX0] = useState<number | null>(null);
  const n = slides.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n, i]);
  const go = (d: number) => setI((v) => (v + d + n) % n);
  return (
    <section className="relative h-[560px] overflow-hidden bg-wine md:h-[720px]"
      onTouchStart={(e) => setX0(e.touches[0].clientX)}
      onTouchEnd={(e) => { if (x0 !== null) { const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) go(d < 0 ? 1 : -1); } setX0(null); }}>
      {slides.map((s, k) => (
        <div key={s.id} className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={k !== i}>
          {s.kind === "video"
            ? <video src={s.media} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            // eslint-disable-next-line @next/next/no-img-element
            : s.media ? <img src={s.media} alt={s.title} loading={k === 0 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-[#c9a27a] to-[#6a4630]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-20 px-6 text-center text-white">
            {s.title && <h2 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-[-0.05em] uppercase md:text-7xl">{s.title}</h2>}
            {s.sub && <p className="mx-auto mt-3 max-w-lg text-sm text-white/90">{s.sub}</p>}
            {s.cta && <Link href={s.href || "/shop"} className="mt-5 inline-block border border-white px-7 py-3 text-[11px] tracking-[0.15em] uppercase hover:bg-white hover:text-black">{s.cta}</Link>}
          </div>
        </div>
      ))}
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-8 flex justify-center gap-2">
          {slides.map((s, k) => <button key={s.id} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-2 rounded-full bg-white transition-all ${k === i ? "w-8" : "w-2 opacity-50"}`} />)}
        </div>
      )}
    </section>
  );
}
