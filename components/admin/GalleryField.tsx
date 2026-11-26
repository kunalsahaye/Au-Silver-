"use client";
import { useRef, useState } from "react";
import { uploadFile } from "./upload";

/** Several photos for one product. The first one is the main photo. Saved as JSON in a hidden input. */
export default function GalleryField({ name, defaultValue }: { name: string; defaultValue: string[] }) {
  const [list, setList] = useState(defaultValue.filter(Boolean));
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setErr("");
    for (const [i, f] of [...files].entries()) {
      setBusy(`Uploading ${i + 1} of ${files.length}…`);
      try { const u = await uploadFile(f, () => {}); setList((l) => [...l, u]); }
      catch (e) { setErr((e as Error).message); }
    }
    setBusy("");
    if (input.current) input.current.value = "";
  }
  const move = (i: number, d: number) => setList((l) => {
    const n = [...l]; const j = i + d; if (j < 0 || j >= n.length) return l;
    [n[i], n[j]] = [n[j], n[i]]; return n;
  });

  return (
    <div className="text-sm">
      <span className="mb-1 block opacity-60">Photos (the first one is the main photo)</span>
      <input type="hidden" name={name} value={JSON.stringify(list)} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {list.map((u, i) => (
          <div key={u + i} className="overflow-hidden rounded-xl border border-[#e6dcd2] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="aspect-square w-full object-cover" />
            <div className="flex justify-between px-1 py-1 text-base">
              <button type="button" aria-label="Move left" onClick={() => move(i, -1)} className="h-9 w-9 rounded-lg hover:bg-black/5 disabled:opacity-20" disabled={i === 0}>‹</button>
              <button type="button" aria-label="Remove photo" onClick={() => setList((l) => l.filter((_, k) => k !== i))} className="h-9 w-9 rounded-lg text-burgundy hover:bg-black/5">×</button>
              <button type="button" aria-label="Move right" onClick={() => move(i, 1)} className="h-9 w-9 rounded-lg hover:bg-black/5 disabled:opacity-20" disabled={i === list.length - 1}>›</button>
            </div>
            {i === 0 && <p className="pb-1 text-center text-[10px] uppercase tracking-wider opacity-50">Main</p>}
          </div>
        ))}
        <button type="button" disabled={!!busy} onClick={() => input.current?.click()}
          className="grid aspect-square place-items-center rounded-xl border border-dashed border-[#d9cdc2] bg-white text-center text-xs opacity-80 hover:opacity-100 disabled:opacity-50">
          {busy || <span><span className="block text-3xl leading-none">+</span>Add photos</span>}
        </button>
      </div>
      <p className="mt-2 text-xs opacity-50">Square photos look best. JPG, PNG or WebP up to 10 MB each. You can pick several at once.</p>
      {err && <p className="mt-1 text-xs text-burgundy">{err}</p>}
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden" onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}
