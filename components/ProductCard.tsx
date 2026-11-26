import Link from "next/link";
import type { Product } from "@/lib/types";
import ProductArt from "./ProductArt";
import { money } from "@/lib/format";

export default function ProductCard({ p, cur }: { p: Product; cur: string; tone?: "light" | "dark" }) {
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="aspect-square overflow-hidden bg-[#f4f2ee]">
        <div className="h-full w-full p-[12%] transition duration-500 group-hover:scale-105">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <ProductArt category={p.category} metal={p.metal} id={`c-${p.id}`} />}
        </div>
      </div>
      <p className="mt-3 text-[11px] font-semibold tracking-wide uppercase">{p.name}</p>
      <p className="text-[11px] opacity-50">{money(cur, p.price)}</p>
    </Link>
  );
}
