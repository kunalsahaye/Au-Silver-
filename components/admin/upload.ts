"use client";

/** Uploads a photo or video and returns its public address. Reports progress from 0 to 100. */
export async function uploadFile(f: File, onProgress: (pct: number) => void): Promise<string> {
  const r = await fetch("/api/upload", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: f.type, size: f.size }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Upload failed");

  if (j.local) { // local development without Supabase
    const fd = new FormData(); fd.append("file", f);
    const r2 = await fetch("/api/upload", { method: "POST", body: fd });
    const j2 = await r2.json().catch(() => ({}));
    if (!r2.ok) throw new Error(j2.error || "Upload failed");
    return j2.url;
  }

  // Straight from the browser to Supabase Storage, with a progress bar.
  await new Promise<void>((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("PUT", j.uploadUrl);
    x.setRequestHeader("content-type", f.type);
    x.setRequestHeader("x-upsert", "false");
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    x.onload = () => (x.status < 300 ? resolve() : reject(new Error(`Upload failed (${x.status})`)));
    x.onerror = () => reject(new Error("Upload failed. Check your internet connection."));
    x.send(f);
  });
  return j.url;
}

export const isVideo = (u: string) => /\.(mp4|mov|webm)(\?|$)/i.test(u);
