"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface CartLine { slug: string; name: string; price: number; qty: number; image?: string }
interface Ctx {
  lines: CartLine[]; count: number; total: number;
  add: (l: Omit<CartLine, "qty">) => void; setQty: (slug: string, q: number) => void; clear: () => void;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setLines(JSON.parse(localStorage.getItem("cart") || "[]")); } catch {}
    setLoaded(true);
  }, []);
  // Only save once the saved bag has been read, so an empty first render never wipes it.
  useEffect(() => { if (loaded) try { localStorage.setItem("cart", JSON.stringify(lines)); } catch {} }, [lines, loaded]);
  const clear = useCallback(() => setLines([]), []);
  const add: Ctx["add"] = (l) => {
    setLines((p) => p.some((x) => x.slug === l.slug) ? p.map((x) => x.slug === l.slug ? { ...x, qty: x.qty + 1, image: l.image || x.image } : x) : [...p, { ...l, qty: 1 }]);
    if (drawer) setOpen(true);
  };
  const setQty: Ctx["setQty"] = (slug, q) => setLines((p) => p.map((x) => x.slug === slug ? { ...x, qty: q } : x).filter((x) => x.qty > 0));
  return (
    <C.Provider value={{
      lines, add, setQty, clear, open, setOpen, drawer,
      count: lines.reduce((a, b) => a + b.qty, 0),
      total: lines.reduce((a, b) => a + b.qty * b.price, 0),
    }}>{children}</C.Provider>
  );
}
