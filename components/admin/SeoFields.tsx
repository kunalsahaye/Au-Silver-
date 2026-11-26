"use client";
import { useState } from "react";

/** Title and description for Google, with character counts and a preview of the search result. */
export default function SeoFields({ title = "", description = "", fallbackTitle, fallbackDescription, url, prefix = "" }: {
  title?: string; description?: string; fallbackTitle: string; fallbackDescription: string; url: string; prefix?: string;
}) {
  const [t, setT] = useState(title);
  const [d, setD] = useState(description);
  const showT = t || fallbackTitle, showD = d || fallbackDescription;
  const count = (n: number, max: number) => <span className={n > max ? "text-burgundy" : "opacity-50"}>{n}/{max}</span>;
  return (
    <div className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 flex justify-between opacity-80"><span className="opacity-75">Title on Google</span>{count(t.length, 60)}</span>
        <input name={`${prefix}seoTitle`} value={t} maxLength={70} onChange={(e) => setT(e.target.value)} placeholder={fallbackTitle} className="field" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 flex justify-between opacity-80"><span className="opacity-75">Description on Google</span>{count(d.length, 160)}</span>
        <textarea name={`${prefix}seoDescription`} value={d} maxLength={170} rows={3} onChange={(e) => setD(e.target.value)} placeholder={fallbackDescription} className="field" />
      </label>
      <div className="rounded-xl border border-[#e6dcd2] bg-white p-4 font-[Arial,sans-serif]">
        <p className="mb-1 text-[11px] text-[#4d5156]">Preview on Google</p>
        <p className="truncate text-xs text-[#202124]">{url}</p>
        <p className="truncate text-lg leading-snug text-[#1a0dab]">{showT}</p>
        <p className="line-clamp-2 text-sm text-[#4d5156]">{showD}</p>
      </div>
      <p className="text-xs opacity-50">Leave blank to use the name and description automatically.</p>
    </div>
  );
}
