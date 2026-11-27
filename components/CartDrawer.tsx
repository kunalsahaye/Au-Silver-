"use client";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { money } from "@/lib/format";

/** The bag sliding in from the right after "Add to bag", so shoppers can carry on or check out. */
export default function CartDrawer({ cur, freeOver, shipBar, labels }: {
  cur: string; freeOver: number | null; shipBar: boolean;
  labels: { title: string; empty: string; checkout: string; keep: string; left: string; done: string };
}) {
  const { lines, total, open, setOpen, setQty } = useCart();
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path, setOpen]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open, setOpen]);
  const fmt = (n: number) => money(cur, n);
  const pct = freeOver ? Math.min(100, (total / freeOver) * 100) : 0;
  return (
    <div className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside role="dialog" aria-modal="true" aria-label={labels.title} inert={!open}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-ivory shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <p className="text-[11px] tracking-[0.18em] uppercase">{labels.title} <span className="opacity-50">({lines.reduce((a, b) => a + b.qty, 0)})</span></p>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close bag" className="-mr-2 grid h-10 w-10 place-items-center hover:opacity-60">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        {shipBar && freeOver !== null && freeOver > 0 && lines.length > 0 && (
          <div className="border-b border-ink/10 px-6 py-4 text-xs">
            <p>{total >= freeOver ? labels.done : labels.left.replace("{amount}", fmt(freeOver - total))}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/10"><div className="h-full bg-ink transition-all duration-500" style={{ width: `${pct}%` }} /></div>
          </div>
        )}
        <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
          {!lines.length && <li className="py-10 text-sm opacity-60">{labels.empty}</li>}
          {lines.map((l) => (
            <li key={l.slug} className="flex gap-4 py-5">
              <Link href={`/product/${l.slug}`} className="block h-24 w-20 shrink-0 overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.image && <img src={l.image} alt="" className="h-full w-full object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/product/${l.slug}`} className="text-[13px] leading-snug font-medium">{l.name}</Link>
                <p className="mt-1 text-[12px] tabular-nums opacity-60">{fmt(l.price)}</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center border border-ink/15">
                    <button type="button" onClick={() => setQty(l.slug, l.qty - 1)} aria-label={`One less ${l.name}`} className="h-8 w-8">−</button>
                    <span className="w-6 text-center text-xs tabular-nums">{l.qty}</span>
                    <button type="button" onClick={() => setQty(l.slug, l.qty + 1)} aria-label={`One more ${l.name}`} className="h-8 w-8">+</button>
                  </div>
                  <button type="button" onClick={() => setQty(l.slug, 0)} className="text-[11px] underline opacity-60">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="space-y-3 border-t border-ink/10 px-6 py-5">
          {lines.length > 0 && <div className="flex justify-between text-sm"><span>Subtotal</span><span className="tabular-nums">{fmt(total)}</span></div>}
          {lines.length > 0 && <Link href="/cart" className="btn btn-dark w-full">{labels.checkout}</Link>}
          <button type="button" onClick={() => setOpen(false)} className="btn btn-line w-full">{labels.keep}</button>
        </div>
      </aside>
    </div>
  );
}
