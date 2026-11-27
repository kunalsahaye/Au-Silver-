import Image from "next/image";
import { canResize } from "@/lib/img";

/**
 * Photo slot: shows the image if a URL is set, otherwise a soft placeholder.
 * Our own photos are resized to the screen and served as AVIF/WebP. Lazy-loads unless `eager`.
 * `className` sizes the box (e.g. "h-full w-full" or "aspect-[4/5] w-full").
 */
export default function Photo({ src, alt = "", className = "", tone = "light", label, eager = false, sizes = "(min-width: 768px) 50vw, 100vw" }: {
  src?: string; alt?: string; className?: string; tone?: "light" | "dark" | "wine" | "warm"; label?: string; eager?: boolean; sizes?: string;
}) {
  const bg = { light: "from-[#e9dcd6] to-[#d8c7bf]", dark: "from-[#2a2a2a] to-[#0d0d0d]", wine: "from-[#7a1a24] to-[#3a0810]", warm: "from-[#c9a27a] to-[#6a4630]" }[tone];
  if (src) {
    return (
      <span className={`relative block overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={eager} unoptimized={!canResize(src)} className="object-cover" />
      </span>
    );
  }
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${bg} ${className}`} aria-hidden>
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,.55), transparent 55%)" }} />
      {label && <span className="eyebrow relative opacity-40">{label}</span>}
    </div>
  );
}
