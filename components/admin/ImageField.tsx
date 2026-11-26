"use client";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

/**
 * Photo picker for portal forms. Uploads to Vercel Blob (or public/uploads in local dev)
 * and keeps the resulting URL in a hidden input named `name`, so the surrounding form saves it.
 */
export default function ImageField({ name, label, defaultValue = "", blob, hint }: {
  name: string; label: string; defaultValue?: string; blob: boolean; hint?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function onFile(f: File | undefined) {
    if (!f) return;
    setErr(""); setBusy(true); setPct(0);
    try {
      if (blob) {
        const safe = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
        const res = await upload(`uploads/${safe}`, f, {
          access: "public", handleUploadUrl: "/api/upload", contentType: f.type,
          onUploadProgress: (p) => setPct(Math.round(p.percentage)),
        });
        setUrl(res.url);
      } else {
        const fd = new FormData(); fd.append("file", f);
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Upload failed");
        setUrl(j.url);
      }
    } catch (e) {
      setErr((e as Error).message || "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="text-sm">
      <span className="mb-1 block opacity-60">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div
        className="flex items-center gap-4 rounded-xl border border-dashed border-[#d9cdc2] bg-white p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
      >
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f2ece6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span className="text-[10px] opacity-40">No photo</span>}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn btn-dark !px-4 !py-1.5 disabled:opacity-50">
              {busy ? `Uploading${pct ? ` ${pct}%` : "…"}` : url ? "Replace photo" : "Upload photo"}
            </button>
            {url && <button type="button" onClick={() => setUrl("")} className="text-xs underline opacity-60">Remove</button>}
            <button type="button" onClick={() => setShowUrl((v) => !v)} className="text-xs underline opacity-60">{showUrl ? "Hide link" : "Use a link"}</button>
          </div>
          {showUrl && <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="field !py-1.5" />}
          {hint && <p className="text-xs opacity-50">{hint}</p>}
          {err && <p className="text-xs text-burgundy">{err}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}
