import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display/wght.css";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "./globals.css";
import { getSettings } from "@/lib/store";


export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `${s.brand} — ${s.tagline}`, description: s.heroSub };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
