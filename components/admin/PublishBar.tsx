import { discard, publish } from "@/app/admin/content-actions";

/** Shown at the top of every admin page while there are unpublished changes. */
export default function PublishBar({ back = "/admin" }: { back?: string }) {
  return (
    <div className="sticky top-0 z-30 -mx-5 mb-6 flex flex-wrap items-center gap-3 border-b border-gold/40 bg-[#fbf3e4] px-5 py-3 md:-mx-10 md:px-10">
      <p className="flex-1 text-sm"><b>You have changes that are not live yet.</b> <span className="opacity-70">Preview them, then press Publish.</span></p>
      <a href="/admin/preview" target="_blank" className="btn btn-line !px-5 !py-2.5">Preview</a>
      <form action={publish}><input type="hidden" name="back" value={back} /><button className="btn btn-dark !px-6 !py-2.5">Publish</button></form>
      <form action={discard}><input type="hidden" name="back" value={back} /><button className="px-2 py-2.5 text-xs underline opacity-60">Undo all changes</button></form>
    </div>
  );
}
