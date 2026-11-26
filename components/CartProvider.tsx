"use client";
import { createContext, useContext, useEffect, useState } from "react";

export interface CartLine { slug: string; name: string; price: number; qty: number }
interface Ctx {
  lines: CartLine[]; count: number; total: number;
  add: (l: Omit<CartLine, "qty">) => void; setQty: (slug: string, q: number) => void; clear: () => void;
}
const C = createContext<Ctx>(null as never);
export const useCart = () => useContext(C);

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => { try { setLines(JSON.parse(localStorage.getItem("cart") || "[]")); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("cart", JSON.stringify(lines)); } catch {} }, [lines]);
  const add: Ctx["add"] = (l) =>
    setLines((p) => p.some((x) => x.slug === l.slug) ? p.map((x) => x.slug === l.slug ? { ...x, qty: x.qty + 1 } : x) : [...p, { ...l, qty: 1 }]);
  const setQty: Ctx["setQty"] = (slug, q) => setLines((p) => p.map((x) => x.slug === slug ? { ...x, qty: q } : x).filter((x) => x.qty > 0));
  return (
    <C.Provider value={{
      lines, add, setQty, clear: () => setLines([]),
      count: lines.reduce((a, b) => a + b.qty, 0),
      total: lines.reduce((a, b) => a + b.qty * b.price, 0),
    }}>{children}</C.Provider>
  );
}
