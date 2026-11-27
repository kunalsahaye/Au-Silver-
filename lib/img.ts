/** True when Next can resize this photo (our own uploads, Supabase Storage, Vercel Blob). */
export function canResize(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return !/\.(svg|gif)(\?|$)/i.test(src);
  try {
    const u = new URL(src);
    return u.protocol === "https:" && (/\.supabase\.co$/.test(u.hostname) && u.pathname.startsWith("/storage/v1/object/public/") || /\.public\.blob\.vercel-storage\.com$/.test(u.hostname)) && !/\.(svg|gif)$/i.test(u.pathname);
  } catch { return false; }
}

/** The short code of an Instagram reel or post link (instagram.com/reel/CODE/…), or "" if it isn't one. */
export function igCode(url: string): string {
  return /^https:\/\/(www\.)?instagram\.com\/(?:[\w.]+\/)?(?:reel|reels|p|tv)\/([\w-]{5,40})/.exec(url.trim())?.[2] ?? "";
}
