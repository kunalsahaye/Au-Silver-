"use client";
import { useState } from "react";
import type { Theme } from "@/lib/types";

const COLOURS: [keyof Theme, string, string][] = [
  ["background", "Page background", "Behind everything"],
  ["text", "Text and buttons", "Headings, text, dark buttons"],
  ["soft", "Soft panels", "Product photo backgrounds, filter box"],
  ["soft2", "Second soft panel", "The “Our process” block"],
  ["dark", "Dark section", "The “Our story” block and slides"],
  ["accent", "Button hover and highlights", "Links in the bag, discount lines"],
  ["gold", "Stars and gold details", "Review stars, preview bar"],
  ["bar", "Offer bar and footer", "Top announcement and footer"],
];

/** Colour pickers, ready-made palettes, fonts and corner style, with a live preview. */
export default function ThemeFields({ theme, palettes, fonts }: { theme: Theme; palettes: Record<string, Partial<Theme>>; fonts: Record<string, { css: string; kind: string }> }) {
  const [t, setT] = useState<Theme>(theme);
  const set = (k: keyof Theme, v: string) => setT((x) => ({ ...x, [k]: v }));
  const r = t.corners === "round" ? 999 : t.corners === "soft" ? 10 : 0;
  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <p className="font-medium">Start from a palette</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(palettes).map(([name, p]) => (
            <button key={name} type="button" onClick={() => setT((x) => ({ ...x, ...p }))} className="flex items-center gap-2 rounded-full border border-[#e6dcd2] px-3 py-2 text-xs">
              <span className="flex">{[p.background, p.text, p.soft, p.dark, p.gold].map((c, i) => <span key={i} className="-ml-1 h-5 w-5 rounded-full border border-black/10 first:ml-0" style={{ background: c }} />)}</span>{name}
            </button>
          ))}
        </div>
      </section>
      <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
        <p className="font-medium sm:col-span-2">Colours</p>
        {COLOURS.map(([k, label, hint]) => (
          <label key={k} className="flex items-center gap-3 text-sm">
            <input type="color" name={k} value={String(t[k])} onChange={(e) => set(k, e.target.value)} className="h-12 w-14 shrink-0 cursor-pointer rounded-lg border border-[#e6dcd2] bg-white p-1" />
            <span><span className="block">{label}</span><span className="block text-xs opacity-50">{hint} · {String(t[k])}</span></span>
          </label>
        ))}
      </section>
      <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
        <p className="font-medium sm:col-span-2">Fonts and shape</p>
        {(["headingFont", "bodyFont"] as const).map((k) => (
          <label key={k} className="block text-sm"><span className="mb-1 block opacity-60">{k === "headingFont" ? "Headings" : "Text"}</span>
            <select name={k} value={t[k]} onChange={(e) => set(k, e.target.value)} className="field" style={{ fontFamily: fonts[t[k]]?.css }}>
              {Object.entries(fonts).map(([n, f]) => <option key={n} value={n} style={{ fontFamily: f.css }}>{n} ({f.kind === "serif" ? "classic" : "modern"})</option>)}
            </select>
          </label>
        ))}
        <label className="block text-sm"><span className="mb-1 block opacity-60">Heading weight</span>
          <select name="headingWeight" value={t.headingWeight} onChange={(e) => set("headingWeight", e.target.value)} className="field"><option value="bold">Bold</option><option value="normal">Light / elegant</option></select>
        </label>
        <label className="block text-sm"><span className="mb-1 block opacity-60">Buttons and boxes</span>
          <select name="corners" value={t.corners} onChange={(e) => set("corners", e.target.value)} className="field"><option value="square">Square corners</option><option value="soft">Slightly rounded</option><option value="round">Round (pill buttons)</option></select>
        </label>
      </section>
      <section className="overflow-hidden rounded-2xl shadow-sm" style={{ background: t.background, color: t.text, fontFamily: fonts[t.bodyFont]?.css }}>
        <div className="px-4 py-2 text-center text-[10px] text-white/80" style={{ background: t.bar }}>Free shipping on orders above ₹1,999</div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <p className="text-[10px] tracking-widest uppercase opacity-60">Preview</p>
            <p className="mt-2 text-3xl leading-tight" style={{ fontFamily: fonts[t.headingFont]?.css, fontWeight: t.headingWeight === "bold" ? 700 : 400 }}>Pure 925 silver, made to be worn every day</p>
            <p className="mt-2 text-sm opacity-75">This is how text looks across your shop.</p>
            <span className="mt-4 inline-block px-6 py-3 text-xs tracking-widest uppercase" style={{ background: t.text, color: t.background, borderRadius: r }}>Add to bag</span>
            <p className="mt-3" style={{ color: t.gold }}>★★★★★</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-square" style={{ background: t.soft, borderRadius: Math.min(r, 20) }} />
            <div className="aspect-square p-3 text-xs text-white" style={{ background: t.dark, borderRadius: Math.min(r, 20) }}>Our story</div>
          </div>
        </div>
      </section>
    </div>
  );
}
