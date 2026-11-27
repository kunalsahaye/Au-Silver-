/** True when Next can resize this photo (our own uploads, Supabase Storage, Vercel Blob). */
export function canResize(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return !/\.(svg|gif)(\?|$)/i.test(src);
  try {
    const u = new URL(src);
    return u.protocol === "https:" && (/\.supabase\.co$/.test(u.hostname) && u.pathname.startsWith("/storage/v1/object/public/") || /\.public\.blob\.vercel-storage\.com$/.test(u.hostname)) && !/\.(svg|gif)$/i.test(u.pathname);
  } catch { return false; }
}
