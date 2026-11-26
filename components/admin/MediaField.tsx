"use client";
import { useRef, useState } from "react";
import { isVideo, uploadFile } from "./upload";

const IMG = "image/jpeg,image/png,image/webp,image/avif,image/gif";
const VID = "video/mp4,video/quicktime,video/webm";

/** Photo (or video) picker with a big touch-friendly button. Controlled: value + onChange. */
export default function MediaField({ label, value, onChange, video = false, hint }: {
  label: string; value: string; onChange: (url: string) => void; video?: boolean; hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const noun = video ? "photo or video" : "photo";

  async function onFile(f: File | undefined) {
    if (!f) return;
    setErr(""); setBusy(true); setPct(0);
    try { onChange(await uploadFile(f, setPct)); }
    catch (e) { setErr((e as Error).message || "Upload failed"); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }

  return (
    <div className="text-sm">
      <span className="mb-1 block opacity-60">{label}</span>
      <div
        className="flex items-center gap-4 rounded-xl border border-dashed border-[#d9cdc2] bg-white p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
      >
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f2ece6]">
          {value && isVideo(value) ? <video src={value} muted playsInline className="h-full w-full object-cover" />
            // eslint-disable-next-line @next/next/no-img-element
            : value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span className="text-[10px] opacity-40">Empty</span>}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn btn-dark !px-5 !py-2.5 disabled:opacity-50">
              {busy ? `Uploading${pct ? ` ${pct}%` : "…"}` : value ? `Change ${noun}` : `Add ${noun}`}
            </button>
            {value && <button type="button" onClick={() => onChange("")} className="py-2 text-xs underline opacity-60">Remove</button>}
            <button type="button" onClick={() => setShowUrl((v) => !v)} className="py-2 text-xs underline opacity-60">{showUrl ? "Hide link" : "Use a link"}</button>
          </div>
          {showUrl && <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" className="field !py-1.5" />}
          {hint && <p className="text-xs opacity-50">{hint}</p>}
          {err && <p className="text-xs text-burgundy">{err}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept={video ? `${IMG},${VID}` : IMG} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}
