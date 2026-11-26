/** Green confirmation after saving, publishing or undoing. */
export default function Notice({ q }: { q: Record<string, string | undefined> }) {
  const msg = q.published ? "Published. Your changes are now live on the shop."
    : q.discarded ? "Done. Your unpublished changes were removed."
    : q.saved ? "Saved as a draft. Press Preview to check it, then Publish to make it live." : "";
  return msg ? <p className="mb-6 rounded-xl bg-green-100 p-4 text-sm text-green-900">{msg}</p> : null;
}
