"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { canResize } from "@/lib/img";
import type { Product } from "@/lib/types";
import ProductArt from "./ProductArt";
import { money } from "@/lib/format";
import { useCardOpts } from "./CardOptions";
import { useCart } from "./CartProvider";
import { WishHeart } from "./Wishlist";

const SIZES = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

/** Product tile for lists: second photo on hover, labels, sale price, low stock, wishlist heart and quick add. */
export default function ProductCard({ p, cur, placeholder = "", soldOut = "Sold out", eager = false }: { p: Product; cur: string; placeholder?: string; soldOut?: string; eager?: boolean }) {
  const o = useCardOpts();
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const src = p.image_url || placeholder;
  const second = p.image_url ? p.images[0] : undefined;
  const out = p.stock <= 0;
  const was = p.seo.compareAt && p.seo.compareAt > p.price ? p.seo.compareAt : 0;
  const isNew = o.badges.on && o.now > 0 && o.now - new Date(p.created_at).getTime() < o.badges.newDays * 864e5;
  const low = o.lowStock.on && !out && p.stock <= o.lowStock.threshold;
  const labels = out ? [soldOut] : o.badges.on ? [was && `Sale −${Math.round((1 - p.price / was) * 100)}%`, isNew && "New", !was && !isNew && p.bestseller && "Bestseller"].filter(Boolean) as string[] : [];
  const quick = () => {
    cart?.add({ slug: p.slug, name: p.name, price: p.price, image: src || undefined });
    setAdded(true); setTimeout(() => setAdded(false), 1600);
  };
  const href = `/product/${p.slug}`;
  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden bg-cream">
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0">
          {src
            ? <Image src={src} alt={p.seo.alt || p.name} fill sizes={SIZES} priority={eager} unoptimized={!canResize(src)} className={`object-cover transition duration-700 ${second ? "md:group-hover:opacity-0" : "group-hover:scale-[1.04]"}`} />
            : <div className="h-full w-full p-[12%] transition duration-700 group-hover:scale-[1.04]"><ProductArt category={p.category} metal={p.metal} id={`c-${p.id}`} /></div>}
          {second && <Image src={second} alt="" fill sizes={SIZES} unoptimized={!canResize(second)} className="hidden object-cover opacity-0 transition duration-700 md:block md:group-hover:scale-[1.03] md:group-hover:opacity-100" />}
        </Link>
        {labels.length > 0 && (
          <span className="pointer-events-none absolute top-2.5 left-2.5 flex flex-col items-start gap-1">
            {labels.map((l) => <span key={l} className={`px-2 py-1 text-[9px] leading-none tracking-[0.14em] uppercase ${l.startsWith("Sale") ? "bg-ink text-ivory" : "bg-ivory/95 text-ink"}`}>{l}</span>)}
          </span>
        )}
        <span className="absolute top-2 right-2 transition md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"><WishHeart slug={p.slug} name={p.name} /></span>
        {o.quickAdd && !out && cart && (
          <>
            <button type="button" onClick={quick} aria-label={`${o.addToBag}: ${p.name}`}
              className="absolute right-2 bottom-2 grid h-9 w-9 place-items-center rounded-full bg-ivory/95 text-lg leading-none shadow-sm md:hidden">{added ? "✓" : "+"}</button>
            <button type="button" onClick={quick} tabIndex={-1}
              className="absolute inset-x-2.5 bottom-2.5 hidden translate-y-2 bg-ivory/95 py-2.5 text-[10px] tracking-[0.16em] uppercase opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-ink hover:text-ivory md:block">{added ? o.added : `+ ${o.addToBag}`}</button>
          </>
        )}
      </div>
      <Link href={href} className="block">
        <h3 className="mt-3 text-[13px] leading-snug font-medium tracking-[-0.005em]">{p.name}</h3>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[12px] tabular-nums">
          <span className={was ? "" : "opacity-55"}>{money(cur, p.price)}</span>
          {was > 0 && <s className="opacity-40">{money(cur, was)}</s>}
        </p>
        {low && <p className="mt-1 text-[11px] text-[#9a3b2f]">{o.lowStock.text.replace("{n}", String(p.stock))}</p>}
      </Link>
    </div>
  );
}
