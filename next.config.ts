import type { NextConfig } from "next";

// Photos are resized and served as AVIF/WebP for the visitor's screen. Only these hosts are resized;
// any other pasted link is shown as it is.
const supabaseHost = (() => { try { return new URL(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").hostname; } catch { return ""; } })();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 200, 256, 320],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
