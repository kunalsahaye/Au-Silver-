import type { Theme } from "./types";

/** Fonts the owner can pick. "local" ones ship with the site; the rest load from Google Fonts. */
export const FONTS: Record<string, { css: string; kind: "sans" | "serif"; local?: boolean }> = {
  Inter: { css: '"Inter Variable", system-ui, sans-serif', kind: "sans", local: true },
  Poppins: { css: '"Poppins", system-ui, sans-serif', kind: "sans" },
  Montserrat: { css: '"Montserrat", system-ui, sans-serif', kind: "sans" },
  "DM Sans": { css: '"DM Sans", system-ui, sans-serif', kind: "sans" },
  Jost: { css: '"Jost", system-ui, sans-serif', kind: "sans" },
  Manrope: { css: '"Manrope", system-ui, sans-serif', kind: "sans" },
  Lato: { css: '"Lato", system-ui, sans-serif', kind: "sans" },
  "Playfair Display": { css: '"Playfair Display Variable", "Playfair Display", Georgia, serif', kind: "serif", local: true },
  "Cormorant Garamond": { css: '"Cormorant Garamond", Georgia, serif', kind: "serif" },
  Lora: { css: '"Lora", Georgia, serif', kind: "serif" },
  "Libre Baskerville": { css: '"Libre Baskerville", Georgia, serif', kind: "serif" },
  Marcellus: { css: '"Marcellus", Georgia, serif', kind: "serif" },
  Cinzel: { css: '"Cinzel", Georgia, serif', kind: "serif" },
};

/** Ready-made colour sets the owner can start from. */
export const PALETTES: Record<string, Partial<Theme>> = {
  "Cocoa (default)": { background: "#ffffff", text: "#24140b", soft: "#f4f2ee", soft2: "#eeeae5", dark: "#2a170d", accent: "#24140b", gold: "#b9894f", bar: "#24140b" },
  "Silver mist": { background: "#ffffff", text: "#1d2430", soft: "#f1f3f6", soft2: "#e6eaf0", dark: "#1d2430", accent: "#3b4a63", gold: "#8a96a8", bar: "#1d2430" },
  "Rose blush": { background: "#fffaf8", text: "#3a1f24", soft: "#fbeeea", soft2: "#f5e1dc", dark: "#4a2329", accent: "#b25a6a", gold: "#c99a7a", bar: "#4a2329" },
  "Emerald": { background: "#fdfcf8", text: "#13241d", soft: "#eef3ef", soft2: "#e2ebe5", dark: "#123326", accent: "#1f5c45", gold: "#b8924a", bar: "#123326" },
  "Midnight": { background: "#fbfbfd", text: "#121521", soft: "#eff0f5", soft2: "#e3e5ee", dark: "#0f1327", accent: "#283a8f", gold: "#c3a465", bar: "#0f1327" },
  "Burgundy": { background: "#fffdfb", text: "#2a0f12", soft: "#f7efec", soft2: "#efe2de", dark: "#4a0b13", accent: "#6b0f1a", gold: "#b8924a", bar: "#4a0b13" },
};

const hex = (v: string, fb: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v : fb);
const font = (name: string) => FONTS[name] ?? FONTS.Inter;

/** CSS variables for the shop wrapper. */
export function themeVars(t: Theme): React.CSSProperties {
  const r = t.corners === "round" ? "999px" : t.corners === "soft" ? "10px" : "0px";
  return {
    "--ivory": hex(t.background, "#ffffff"), "--ink": hex(t.text, "#24140b"), "--cream": hex(t.soft, "#f4f2ee"),
    "--blush": hex(t.soft2, "#eeeae5"), "--wine": hex(t.dark, "#2a170d"), "--burgundy": hex(t.accent, "#24140b"),
    "--gold": hex(t.gold, "#b9894f"), "--bar": hex(t.bar, "#24140b"),
    "--font-head": font(t.headingFont).css, "--font-body": font(t.bodyFont).css,
    "--head-weight": t.headingWeight === "normal" ? "400" : "700", "--radius": r, "--radius-box": t.corners === "square" ? "0px" : t.corners === "soft" ? "12px" : "20px",
  } as React.CSSProperties;
}

/** Google Fonts stylesheet for the chosen fonts, or null when both ship with the site. */
export function fontsHref(t: Theme): string | null {
  const names = [...new Set([t.headingFont, t.bodyFont])].filter((n) => FONTS[n] && !FONTS[n].local);
  if (!names.length) return null;
  return `https://fonts.googleapis.com/css2?${names.map((n) => `family=${n.replace(/ /g, "+")}:wght@400;500;600;700`).join("&")}&display=swap`;
}
