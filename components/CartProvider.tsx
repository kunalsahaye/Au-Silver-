"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { bagInfo } from "@/app/actions";

export interface CartLine { slug: string; name: string; price: number; qty: number; image?: string; /** Pieces available, when known. */ stock?: number }
interface Ctx {
  lines: CartLine[]; count: number; total: number;
  add: (l: Omit<CartLine, "qty">, qty?: number, quiet?: boolean) => void; setQty: (slug: string, q: number) => void; clear: () => void;
  /** Slide-out bag (when the plugin is on). */
  open: boolean; setOpen: (o: boolean) => void; drawer: boolean;
}
const C = createContext<Ctx>(null as never);
export const useCart = () => useContext(C);

export default function CartProvider({ children, drawer = false }: { children: React.ReactNode; drawer?: boolean }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  // Read the saved bag after hydration so server and browser render the same first frame.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let saved: CartLine[] = [];
    try { const v = JSON.parse(localStorage.getItem("cart") || "[]"); if (Array.isArray(v)) saved = v.filter((l) => l && typeof l.slug === "string"); } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(saved);
    setLoaded(true);
    // Swap in today's prices and stock from the shop (pieces that were removed or sold out drop out).
    if (saved.length) bagInfo(saved.map((l) => l.slug)).then((live) => setLines((cur) => cur
      .filter((l) => live[l.slug] && live[l.slug].stock > 0)
      .map((l) => ({ ...l, name: live[l.slug].name, price: live[l.slug].price, stock: live[l.slug].stock, qty: Math.max(1, Math.min(Math.floor(Number(l.qty)) || 1, live[l.slug].stock, 20)) })))).catch(() => {});
  }, []);
  // Only save once the saved bag has been read, so an empty first render never wipes it.
  useEffect(() => { if (loaded) try { localStorage.setItem("cart", JSON.stringify(lines)); } catch {} }, [lines, loaded]);
  const clear = useCallback(() => setLines([]), []);
  const add: Ctx["add"] = (l, n = 1, quiet = false) => {
    setLines((p) => p.some((x) => x.slug === l.slug) ? p.map((x) => x.slug === l.slug ? { ...x, qty: Math.min(l.stock ?? x.stock ?? 20, 20, x.qty + n), image: l.image || x.image, stock: l.stock ?? x.stock } : x) : [...p, { ...l, qty: Math.min(l.stock ?? 20, 20, n) }]);
    if (drawer && !quiet) setOpen(true);
  };
  const setQty: Ctx["setQty"] = (slug, q) => setLines((p) => p.map((x) => x.slug === slug ? { ...x, qty: Math.min(q, x.stock ?? 20, 20) } : x).filter((x) => x.qty > 0));
  return (
    <C.Provider value={{
      lines, add, setQty, clear, open, setOpen, drawer,
      count: lines.reduce((a, b) => a + b.qty, 0),
      total: lines.reduce((a, b) => a + b.qty * b.price, 0),
    }}>{children}</C.Provider>
  );
}
