"use client";
import { useState } from "react";
import MediaField from "./MediaField";

export interface ListField {
  key: string;
  label: string;
  type: "text" | "textarea" | "photo" | "video" | "check" | "stars" | "select" | "number" | "date";
  placeholder?: string;
  hint?: string;
  options?: [string, string][];
  /** Shown beside the next field on wide screens. */
  half?: boolean;
}
type Item = Record<string, string | number | boolean>;

/**
 * Edits a list of cards (slides, customers, categories, pages, homepage sections) with
 * big touch targets: add, remove, move up and down. The list is sent as JSON in a hidden input.
 */
export default function ListEditor({ name, fields, items: initial, blank, addLabel, titleKey, titles, fixed, empty }: {
  name: string; fields: ListField[]; items: Item[]; blank?: Item; addLabel?: string;
  /** Field whose value titles each card, or a fixed title per item (titles[item[titleKey]]). */
  titleKey?: string; titles?: Record<string, string>;
  /** Fixed set of items: no add or remove, only reorder and edit. */
  fixed?: boolean; empty?: string;
}) {
  const [items, setItems] = useState<Item[]>(initial.map((x, i) => ({ _k: `k${i}`, ...x })));
  const set = (i: number, k: string, v: Item[string]) => setItems((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const move = (i: number, d: number) => setItems((l) => {
    const n = [...l]; const j = i + d; if (j < 0 || j >= n.length) return l;
    [n[i], n[j]] = [n[j], n[i]]; return n;
  });
  const out = items.map(({ _k, ...x }) => { void _k; return x; });
  const iconBtn = "grid h-11 w-11 place-items-center rounded-xl border border-[#e6dcd2] bg-white text-lg disabled:opacity-25";

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(out)} />
      {!items.length && empty && <p className="rounded-2xl bg-white p-6 text-sm opacity-60">{empty}</p>}
      {items.map((it, i) => {
        const title = titleKey ? (titles?.[String(it[titleKey])] ?? String(it[titleKey] || "")) : "";
        return (
          <div key={String(it._k)} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f2ece6] text-xs">{i + 1}</span>
              <p className="min-w-0 flex-1 truncate font-medium">{title || <span className="opacity-40">New</span>}</p>
              <button type="button" aria-label="Move up" className={iconBtn} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" aria-label="Move down" className={iconBtn} disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</button>
              {!fixed && (
                <button type="button" aria-label="Remove" className={`${iconBtn} text-burgundy`}
                  onClick={() => { if (confirm(`Remove ${title || "this item"}?`)) setItems((l) => l.filter((_, j) => j !== i)); }}>×</button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => {
                const v = it[f.key];
                const wide = f.half ? "" : "sm:col-span-2";
                if (f.type === "photo" || f.type === "video") {
                  return <div key={f.key} className={wide}><MediaField label={f.label} hint={f.hint} video={f.type === "video"} value={String(v ?? "")} onChange={(u) => set(i, f.key, u)} /></div>;
                }
                if (f.type === "check") {
                  return (
                    <label key={f.key} className={`flex min-h-11 cursor-pointer items-center gap-3 text-sm ${wide}`}>
                      <input type="checkbox" className="h-6 w-6 accent-[#6b0f1a]" checked={!!v} onChange={(e) => set(i, f.key, e.target.checked)} />
                      {f.label}
                    </label>
                  );
                }
                if (f.type === "stars") {
                  return (
                    <div key={f.key} className={`text-sm ${wide}`}>
                      <span className="mb-1 block opacity-60">{f.label}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" aria-label={`${n} stars`} onClick={() => set(i, f.key, n)}
                            className={`h-11 w-11 rounded-xl text-2xl ${Number(v) >= n ? "text-[#b8924a]" : "text-black/15"}`}>★</button>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <label key={f.key} className={`block text-sm ${wide}`}>
                    <span className="mb-1 block opacity-60">{f.label}</span>
                    {f.type === "textarea"
                      ? <textarea rows={6} value={String(v ?? "")} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} className="field" />
                      : f.type === "select"
                        ? <select value={String(v ?? "")} onChange={(e) => set(i, f.key, e.target.value)} className="field">{f.options?.map(([val, l]) => <option key={val} value={val}>{l}</option>)}</select>
                        : <input type={f.type === "number" || f.type === "date" ? f.type : "text"} value={String(v ?? "")} placeholder={f.placeholder} onChange={(e) => set(i, f.key, e.target.value)} className="field" />}
                    {f.hint && <span className="mt-1 block text-xs opacity-50">{f.hint}</span>}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
      {!fixed && blank && (
        <button type="button" onClick={() => setItems((l) => [...l, { ...blank, _k: `n${Date.now()}` }])}
          className="w-full rounded-2xl border-2 border-dashed border-[#d9cdc2] p-5 text-sm font-medium hover:bg-white">
          + {addLabel ?? "Add"}
        </button>
      )}
    </div>
  );
}
