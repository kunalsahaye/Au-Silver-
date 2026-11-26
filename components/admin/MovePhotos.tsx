import { movePhotos } from "@/app/admin/content-actions";
import { findMediaUrls } from "@/lib/store";
import { storageEnabled } from "@/lib/uploads";

/** One-time helper after leaving Vercel: copies old Vercel Blob photos into Supabase Storage. */
export default async function MovePhotos({ q }: { q: Record<string, string | undefined> }) {
  if (q.moved) {
    return (
      <p className="mt-8 max-w-3xl rounded-xl bg-green-100 p-4 text-sm text-green-900">
        {q.moved === "none" ? "Connect Supabase first." : `Moved ${q.moved} photo${q.moved === "1" ? "" : "s"} to Supabase Storage.`}
        {Number(q.failed) > 0 && ` ${q.failed} could not be copied; try again.`}
      </p>
    );
  }
  if (!storageEnabled) return null;
  const old = await findMediaUrls(/\.blob\.vercel-storage\.com\//);
  if (!old.length) return null;
  return (
    <form action={movePhotos} className="mt-8 max-w-3xl rounded-2xl border border-gold/40 bg-gold/10 p-6 text-sm">
      <p><b>{old.length} photo{old.length === 1 ? " is" : "s are"} still stored on Vercel.</b> Copy them to Supabase Storage so the shop no longer depends on Vercel. This takes a minute and changes nothing else.</p>
      <button className="btn btn-dark mt-4 !px-6 !py-3">Move photos now</button>
    </form>
  );
}
