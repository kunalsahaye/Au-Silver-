import Link from "next/link";
import Image from "next/image";
import { canResize } from "@/lib/img";
import type { Product } from "@/lib/types";
import ProductArt from "./ProductArt";
import { money } from "@/lib/format";

/** Product tile for lists. Uses the product photo, then the shop's placeholder photo, then a drawing. */
export default function ProductCard({ p, cur, placeholder = "", soldOut = "Sold out" }: { p: Product; cur: string; placeholder?: string; soldOut?: string }) {
  const src = p.image_url || placeholder;
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-cream">
        {src
          ? <Image src={src} alt={p.seo.alt || p.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" unoptimized={!canResize(src)} className="object-cover transition duration-700 group-hover:scale-[1.04]" />
          : <div className="h-full w-full p-[12%] transition duration-700 group-hover:scale-[1.04]"><ProductArt category={p.category} metal={p.metal} id={`c-${p.id}`} /></div>}
        {p.stock <= 0 && <span className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-[10px] uppercase tracking-wide">{soldOut}</span>}
      </div>
      <h3 className="mt-3 text-[13px] leading-snug font-medium tracking-[-0.005em]">{p.name}</h3>
      <p className="mt-0.5 text-[12px] tabular-nums opacity-55">{money(cur, p.price)}</p>
    </Link>
  );
}
