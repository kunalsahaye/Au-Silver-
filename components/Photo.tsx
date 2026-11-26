/** Photo slot: shows the image if a URL is set, otherwise a soft placeholder. Lazy-loads unless `eager`. */
export default function Photo({ src, alt = "", className = "", tone = "light", label, eager = false }: {
  src?: string; alt?: string; className?: string; tone?: "light" | "dark" | "wine" | "warm"; label?: string; eager?: boolean;
}) {
  const bg = { light: "from-[#e9dcd6] to-[#d8c7bf]", dark: "from-[#2a2a2a] to-[#0d0d0d]", wine: "from-[#7a1a24] to-[#3a0810]", warm: "from-[#c9a27a] to-[#6a4630]" }[tone];
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`object-cover ${className}`} loading={eager ? "eager" : "lazy"} decoding="async" {...(eager ? { fetchPriority: "high" as const } : {})} />
    );
  }
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${bg} ${className}`} aria-hidden>
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,.55), transparent 55%)" }} />
      {label && <span className="eyebrow relative opacity-40">{label}</span>}
    </div>
  );
}
