"use client";
import { useRef, useState } from "react";
import { uploadFile } from "./upload";
import { checkLocal, IMAGE_ACCEPT, usePreviews, useDropZone } from "./drop";

type Pending = { id: string; preview: string; pct: number };

/**
 * Several photos for one product. The first one is the main photo. Saved as JSON in a hidden input.
 * Drop photos anywhere on the grid (or tap to choose), and drag the tiles to change the order.
 */
export default function GalleryField({ name, defaultValue }: { name: string; defaultValue: string[] }) {
  const [list, setList] = useState(defaultValue.filter(Boolean));
  const [pending, setPending] = useState<Pending[]>([]);
  const [errs, setErrs] = useState<string[]>([]);
  const [dragI, setDragI] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const preview = usePreviews();

  async function onFiles(files: File[]) {
    if (!files.length) return;
    const bad: string[] = [];
    const ok = files.filter((f) => { const m = checkLocal(f, false); if (m) bad.push(m); return !m; });
    setErrs(bad);
    const jobs = ok.map((f, i) => ({ f, p: { id: `${Date.now()}-${i}-${f.name}`, preview: preview(f), pct: 0 } }));
    setPending((l) => [...l, ...jobs.map((j) => j.p)]);
    if (input.current) input.current.value = "";
    // One at a time, so the photos keep the order they were picked in.
    for (const { f, p } of jobs) {
      try {
        const u = await uploadFile(f, (pct) => setPending((l) => l.map((x) => (x.id === p.id ? { ...x, pct } : x))));
        setList((l) => [...l, u]);
      } catch (e) {
        setErrs((l) => [...l, `${f.name}: ${(e as Error).message || "Upload failed"}`]);
      }
      setPending((l) => l.filter((x) => x.id !== p.id));
    }
  }
  const { over, bind } = useDropZone(onFiles);

  const move = (i: number, d: number) => setList((l) => {
    const n = [...l]; const j = i + d; if (j < 0 || j >= n.length) return l;
    [n[i], n[j]] = [n[j], n[i]]; return n;
  });
  const moveTo = (from: number, to: number) => setList((l) => {
    if (from === to) return l;
    const n = [...l]; const [x] = n.splice(from, 1); n.splice(to, 0, x); return n;
  });
  const busy = pending.length > 0;

  return (
    <div className="text-sm">
      <span className="mb-1 block opacity-60">Photos (the first one is the main photo)</span>
      <input type="hidden" name={name} value={JSON.stringify(list)} />
      <div {...bind} className={`relative rounded-2xl border border-dashed p-3 transition-colors ${over ? "border-burgundy bg-[#f7efe9]" : "border-transparent"}`}>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {list.map((u, i) => (
            <div key={u + i} draggable
              onDragStart={(e) => { setDragI(i); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/x-au-photo", String(i)); }}
              onDragOver={(e) => { if (dragI !== null) e.preventDefault(); }}
              onDrop={(e) => { if (dragI === null) return; e.preventDefault(); moveTo(dragI, i); setDragI(null); }}
              onDragEnd={() => setDragI(null)}
              className={`cursor-grab overflow-hidden rounded-xl border bg-white active:cursor-grabbing ${dragI === i ? "border-burgundy opacity-40" : "border-[#e6dcd2]"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" draggable={false} className="aspect-square w-full object-cover" />
              <div className="flex justify-between px-1 py-1 text-base">
                <button type="button" aria-label="Move left" onClick={() => move(i, -1)} className="h-9 w-9 rounded-lg hover:bg-black/5 disabled:opacity-20" disabled={i === 0}>‹</button>
                <button type="button" aria-label="Remove photo" onClick={() => setList((l) => l.filter((_, k) => k !== i))} className="h-9 w-9 rounded-lg text-burgundy hover:bg-black/5">×</button>
                <button type="button" aria-label="Move right" onClick={() => move(i, 1)} className="h-9 w-9 rounded-lg hover:bg-black/5 disabled:opacity-20" disabled={i === list.length - 1}>›</button>
              </div>
              {i === 0 && <p className="pb-1 text-center text-[10px] uppercase tracking-wider opacity-50">Main</p>}
            </div>
          ))}
          {pending.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-[#e6dcd2] bg-white" aria-label="Uploading photo">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt="" className="aspect-square w-full object-cover opacity-60" />
                <span className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-white/80">
                  <span className="block h-full bg-burgundy transition-[width]" style={{ width: `${Math.max(p.pct, 4)}%` }} />
                </span>
              </div>
              <p className="py-3 text-center text-[11px] opacity-60">{p.pct ? `Uploading ${p.pct}%` : "Waiting…"}</p>
            </div>
          ))}
          <button type="button" onClick={() => input.current?.click()}
            className="grid aspect-square place-items-center rounded-xl border border-dashed border-[#d9cdc2] bg-white px-2 text-center text-xs opacity-80 hover:opacity-100">
            <span><span className="block text-3xl leading-none">+</span>Add photos<span className="mt-1 hidden text-[10px] opacity-60 sm:block">or drop them here</span></span>
          </button>
        </div>
        {over && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-[#f7efe9]/85">
            <span className="serif text-lg italic text-burgundy">Drop photos to add them</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs opacity-50">
        Drag photos from your computer onto this area, or tap Add photos. Drag a photo to move it; the first is the main photo.
        Square photos look best. JPG, PNG or WebP up to 10 MB each.{busy ? " Please wait for uploads to finish before saving." : ""}
      </p>
      {errs.map((m, i) => <p key={i} role="alert" className="mt-1 text-xs text-burgundy">{m}</p>)}
      <input ref={input} type="file" multiple accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => onFiles(Array.from(e.target.files ?? []))} />
    </div>
  );
}
