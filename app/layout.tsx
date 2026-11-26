import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display/wght.css";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "./globals.css";
import { getSettings } from "@/lib/store";
import { baseUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const base = await baseUrl(s);
  return {
    metadataBase: new URL(base),
    title: { default: s.seoTitle || `${s.brand} | ${s.tagline}`, template: `%s | ${s.brand}` },
    description: s.seoDescription || s.heroSub,
    applicationName: s.brand,
    formatDetection: { telephone: false },
    verification: {
      google: s.googleVerification || undefined,
      other: s.bingVerification ? { "msvalidate.01": s.bingVerification } : undefined,
    },
    other: { "geo.region": `${s.country || "IN"}${/^[A-Za-z]{2}$/.test(s.region) ? `-${s.region.toUpperCase()}` : ""}`, ...(s.city ? { "geo.placename": s.city } : {}), ...(s.latitude && s.longitude ? { "geo.position": `${s.latitude};${s.longitude}`, ICBM: `${s.latitude}, ${s.longitude}` } : {}) },
  };
}
export const viewport: Viewport = { themeColor: "#24140b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className="antialiased">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
