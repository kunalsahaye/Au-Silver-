"use client";
import { useState } from "react";

/** Product photos: one big photo and small thumbnails to switch between them. */
export default function Gallery({ photos, name }: { photos: string[]; name: string }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-b from-blush to-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[i]} alt={name} className="h-full w-full object-cover" />
      </div>
      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {photos.map((u, k) => (
            <button key={u + k} onClick={() => setI(k)} aria-label={`Photo ${k + 1}`} className={`aspect-square overflow-hidden rounded-xl border-2 ${k === i ? "border-ink" : "border-transparent opacity-70"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
