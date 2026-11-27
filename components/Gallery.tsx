"use client";
import { useState } from "react";
import Image from "next/image";
import { canResize } from "@/lib/img";

/** Product photos: one big photo and small thumbnails to switch between them. */
export default function Gallery({ photos, name }: { photos: string[]; name: string }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-b from-blush to-cream">
        <Image src={photos[i]} alt={name} fill priority sizes="(min-width: 768px) 50vw, 100vw" unoptimized={!canResize(photos[i])} className="object-cover" />
      </div>
      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {photos.map((u, k) => (
            <button key={u + k} onClick={() => setI(k)} aria-label={`Photo ${k + 1}`} className={`aspect-square overflow-hidden rounded-xl border-2 ${k === i ? "border-ink" : "border-transparent opacity-70"}`}>
              <span className="relative block h-full w-full"><Image src={u} alt="" fill sizes="96px" unoptimized={!canResize(u)} className="object-cover" /></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
