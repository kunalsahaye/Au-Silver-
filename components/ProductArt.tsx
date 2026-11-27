import type { Category, Metal } from "@/lib/types";

const palettes: Record<Metal, [string, string, string]> = {
  gold: ["#f6dca0", "#c9984a", "#7a5420"],
  silver: ["#ffffff", "#c9ced6", "#6f7682"],
  rose: ["#f7d3c4", "#d99a85", "#8c5646"],
};

/** Stylised product illustration, used until a real photo URL is added in the portal. */
export default function ProductArt({ category, metal, id }: { category: Category; metal: Metal; id: string }) {
  const [a, b, c] = palettes[metal];
  const g = `g-${id}`;
  // New categories added in the admin fall back to the ring drawing.
  const shape = ["rings", "earrings", "bracelets", "necklaces"].includes(category) ? category : "rings";
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`${metal} ${category}`}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} /><stop offset=".5" stopColor={b} /><stop offset="1" stopColor={c} />
        </linearGradient>
        <radialGradient id={`${g}-s`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#cfe3f5" />
        </radialGradient>
      </defs>
      {shape === "rings" && (
        <g>
          <ellipse cx="100" cy="120" rx="46" ry="52" fill="none" stroke={`url(#${g})`} strokeWidth="13" />
          <ellipse cx="100" cy="120" rx="46" ry="52" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" transform="translate(-3 -3)" />
          <path d="M100 56 l15 -18 -15 -14 -15 14z" fill={`url(#${g}-s)`} stroke={c} strokeWidth="1.5" />
          <path d="M100 56 v-32 M85 38 h30" stroke={c} strokeOpacity=".4" strokeWidth=".8" />
        </g>
      )}
      {shape === "earrings" && (
        <g>
          {[62, 138].map((x) => (
            <g key={x}>
              <circle cx={x} cy="42" r="6" fill={`url(#${g})`} />
              <path d={`M${x} 48 C ${x - 22} 90, ${x - 20} 140, ${x} 158 C ${x + 20} 140, ${x + 22} 90, ${x} 48z`} fill={`url(#${g})`} />
              <path d={`M${x - 6} 78 C ${x - 12} 106, ${x - 10} 128, ${x - 3} 140`} stroke="#fff" strokeOpacity=".55" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>
      )}
      {shape === "bracelets" && (
        <g fill="none" stroke={`url(#${g})`} strokeWidth="9">
          {Array.from({ length: 9 }).map((_, i) => {
            // Rounded so the server and the browser print exactly the same numbers.
            const t = (i / 9) * Math.PI * 2, x = Math.round((100 + Math.cos(t) * 56) * 100) / 100, y = Math.round((100 + Math.sin(t) * 56) * 100) / 100;
            return <ellipse key={i} cx={x} cy={y} rx="17" ry="9" transform={`rotate(${i * 40 + 90} ${x} ${y})`} />;
          })}
        </g>
      )}
      {shape === "necklaces" && (
        <g>
          <path d="M30 34 C 60 150, 140 150, 170 34" fill="none" stroke={`url(#${g})`} strokeWidth="3" strokeDasharray="1 4" strokeLinecap="round" />
          <path d="M30 34 C 60 150, 140 150, 170 34" fill="none" stroke={`url(#${g})`} strokeWidth="2" />
          <path d="M100 124 C 82 138, 80 160, 100 176 C 120 160, 118 138, 100 124z" fill={`url(#${g}-s)`} stroke={c} strokeWidth="2" />
          <path d="M94 142 C 90 150, 92 158, 97 164" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
