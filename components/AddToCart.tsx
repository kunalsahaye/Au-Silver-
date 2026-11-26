"use client";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function AddToCart({ slug, name, price, soldOut, labels = ["Add to bag", "Added to bag ✓", "Sold out"] }: { slug: string; name: string; price: number; soldOut: boolean; labels?: [string, string, string] }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      disabled={soldOut}
      onClick={() => { add({ slug, name, price }); setDone(true); setTimeout(() => setDone(false), 1800); }}
      className="btn btn-dark w-full disabled:opacity-40"
    >
      {soldOut ? labels[2] : done ? labels[1] : labels[0]}
    </button>
  );
}
