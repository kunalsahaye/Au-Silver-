"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function AddToCart({ slug, name, price, soldOut }: { slug: string; name: string; price: number; soldOut: boolean }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      disabled={soldOut}
      onClick={() => { add({ slug, name, price }); setDone(true); setTimeout(() => setDone(false), 1800); }}
      className="btn btn-dark w-full disabled:opacity-40"
    >
      {soldOut ? "Sold out" : done ? "Added to bag ✓" : "Add to bag"}
    </button>
  );
}
