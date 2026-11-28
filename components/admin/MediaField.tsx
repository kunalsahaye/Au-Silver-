"use client";
import { useRef, useState } from "react";
import { isVideo, uploadFile } from "./upload";
import { checkLocal, IMAGE_ACCEPT, usePreviews, useDropZone, VIDEO_ACCEPT } from "./drop";

/**
 * Photo (or video) picker. Drop a file anywhere on the box, or tap to choose one.
 * Shows the picture straight away while it uploads, with a progress bar. Controlled: value + onChange.
 */
export default function MediaField({ label, value, onChange, video = false, hint }: {
  label: string; value: string; onChange: (url: string) => void; video?: boolean; hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [local, setLocal] = useState<{ url: string; video: boolean } | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const preview = usePreviews();
  const noun = video ? "photo or video" : "photo";

  async function onFiles(files: File[]) {
    const f = files[0];
    if (!f || busy) return;
    setErr(""); setNote(files.length > 1 ? `Only one ${noun} fits here, so the first one was used.` : "");
    const bad = checkLocal(f, video);
    if (bad) { setErr(bad); return; }
    setBusy(true); setPct(0);
    setLocal({ url: preview(f), video: f.type.startsWith("video/") });
    try { onChange(await uploadFile(f, setPct)); }
    catch (e) { setErr((e as Error).message || "Upload failed"); }
    finally { setBusy(false); setLocal(null); if (input.current) input.current.value = ""; }
  }
  const { over, bind } = useDropZone(onFiles, busy);
  const shown = local?.url || value;
  const shownVideo = local ? local.video : isVideo(value);

  return (
    <div className="text-sm">
      <span className="mb-1 block opacity-60">{label}</span>
      <div {...bind}
        className={`relative flex items-center gap-4 rounded-xl border border-dashed p-3 transition-colors ${over ? "border-burgundy bg-[#f7efe9]" : "border-[#d9cdc2] bg-white"}`}>
        <button type="button" disabled={busy} onClick={() => input.current?.click()} aria-label={value ? `Change ${noun}` : `Add ${noun}`}
          className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f2ece6] disabled:cursor-wait">
          {shown && shownVideo ? <video src={shown} muted playsInline className="h-full w-full object-cover" />
            // eslint-disable-next-line @next/next/no-img-element
            : shown ? <img src={shown} alt="" className={`h-full w-full object-cover ${busy ? "opacity-60" : ""}`} />
              : <span className="px-2 text-center text-[10px] leading-snug opacity-50">Drop {video ? "a file" : "a photo"} here</span>}
          {busy && (
            <span className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-white/70">
              <span className="block h-full bg-burgundy transition-[width]" style={{ width: `${Math.max(pct, 4)}%` }} />
            </span>
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn btn-dark !px-5 !py-2.5 disabled:opacity-50">
              {busy ? `Uploading${pct ? ` ${pct}%` : "…"}` : value ? `Change ${noun}` : `Add ${noun}`}
            </button>
            {value && !busy && <button type="button" onClick={() => onChange("")} className="py-2 text-xs underline opacity-60">Remove</button>}
            <button type="button" onClick={() => setShowUrl((v) => !v)} className="py-2 text-xs underline opacity-60">{showUrl ? "Hide link" : "Use a link"}</button>
          </div>
          <p className="hidden text-xs opacity-50 sm:block">or drag {video ? "a photo or video" : "a photo"} from your computer onto this box</p>
          {showUrl && <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" className="field !py-1.5" />}
          {hint && <p className="text-xs opacity-50">{hint}</p>}
          {note && !err && <p className="text-xs opacity-60">{note}</p>}
          {err && <p role="alert" className="text-xs text-burgundy">{err}</p>}
        </div>
        {over && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl bg-[#f7efe9]/85">
            <span className="serif text-base italic text-burgundy">Drop to upload</span>
          </div>
        )}
      </div>
      <input ref={input} type="file" accept={video ? `${IMAGE_ACCEPT},${VIDEO_ACCEPT}` : IMAGE_ACCEPT} className="hidden" onChange={(e) => onFiles(Array.from(e.target.files ?? []))} />
    </div>
  );
}
