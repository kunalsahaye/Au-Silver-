"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

/** Saved pieces live in this browser only (no account needed). */
const KEY = "wishlist";
const EVT = "wishlist-change";
function read(): string[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string") : []; } catch { return []; }
}
function write(list: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* private mode: keep it for this page only */ }
  window.dispatchEvent(new Event(EVT));
}
function useWishlist() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setList(read());
    sync();
    window.addEventListener(EVT, sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return list;
}

const Heart = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <path d="M12 20.5s-7.5-4.6-9.5-9.1C1 7.8 3.2 4.5 7 4.5c2.1 0 3.6 1.1 5 2.9 1.4-1.8 2.9-2.9 5-2.9 3.8 0 6 3.3 4.5 6.9-2 4.5-9.5 9.1-9.5 9.1z" />
  </svg>
);

export function WishButton({ slug, name }: { slug: string; name: string }) {
  const list = useWishlist();
  const on = list.includes(slug);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`}
      onClick={() => write(on ? read().filter((x) => x !== slug) : [...read().filter((x) => x !== slug), slug])}
      className="inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase hover:opacity-60">
      <Heart filled={on} /> {on ? "Saved" : "Save to wishlist"}
    </button>
  );
}

export function WishLink() {
  const n = useWishlist().length;
  return (
    <Link href="/wishlist" aria-label={`Wishlist${n ? `, ${n} saved` : ""}`} className="relative hover:opacity-60">
      <Heart filled={n > 0} />
      {n > 0 && <span className="absolute -top-1.5 -right-2 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-ink px-0.5 text-[8px] text-ivory">{n}</span>}
    </Link>
  );
}

export function WishlistView({ products, cur, placeholder, soldOut }: { products: Product[]; cur: string; placeholder: string; soldOut: string }) {
  const list = useWishlist();
  const saved = list.map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => !!p);
  if (!saved.length) return <p className="text-lg opacity-60">Nothing saved yet. Tap “Save to wishlist” on any piece to keep it here. <Link href="/shop" className="underline">All jewellery →</Link></p>;
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
      {saved.map((p) => (
        <div key={p.id}>
          <ProductCard p={p} cur={cur} placeholder={placeholder} soldOut={soldOut} />
          <button type="button" onClick={() => write(read().filter((x) => x !== p.slug))} className="mt-2 text-[11px] underline opacity-60">Remove</button>
        </div>
      ))}
    </div>
  );
}
