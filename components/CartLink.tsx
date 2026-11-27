"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

export default function CartLink() {
  const { count, drawer, setOpen } = useCart();
  const path = usePathname();
  return (
    <Link href="/cart" onClick={(e) => { if (drawer && path !== "/cart") { e.preventDefault(); setOpen(true); } }} className="eyebrow flex items-center gap-2 hover:opacity-60">
      Bag <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] text-ivory">{count}</span>
    </Link>
  );
}
