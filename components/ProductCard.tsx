import Link from "next/link";
import type { Product } from "@/lib/types";
import ProductArt from "./ProductArt";
import { money } from "@/lib/format";

/** Product tile for lists. Uses the product photo, then the shop's placeholder photo, then a drawing. */
export default function ProductCard({ p, cur, placeholder = "", soldOut = "Sold out" }: { p: Product; cur: string; placeholder?: string; soldOut?: string }) {
  const src = p.image_url || placeholder;
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-[#f4f2ee]">
        {src
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={src} alt={p.seo.alt || p.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          : <div className="h-full w-full p-[12%] transition duration-500 group-hover:scale-105"><ProductArt category={p.category} metal={p.metal} id={`c-${p.id}`} /></div>}
        {p.stock <= 0 && <span className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-[10px] uppercase tracking-wide">{soldOut}</span>}
      </div>
      <h3 className="mt-3 text-[11px] font-semibold tracking-wide uppercase">{p.name}</h3>
      <p className="text-[11px] opacity-50">{money(cur, p.price)}</p>
    </Link>
  );
}
