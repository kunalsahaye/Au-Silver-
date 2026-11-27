import { connectInstagram, disconnectInstagram, importInstagram, saveReels } from "../../content-actions";
import EditorForm from "@/components/admin/EditorForm";
import ListEditor from "@/components/admin/ListEditor";
import { getDraft, getProducts } from "@/lib/store";
import { instagramStatus, latestPosts } from "@/lib/instagram";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Reels({ searchParams }: Q) {
  const q = await searchParams;
  const [{ content: c }, products, ig] = await Promise.all([getDraft(), getProducts(), instagramStatus()]);
  const { posts, error } = ig.connected ? await latestPosts() : { posts: [], error: undefined };
  const added = new Set(c.reels.map((r) => r.instagram));
  return (
    <div className="space-y-8">
      <EditorForm title="Reels" q={q} action={saveReels}
        intro="Vertical videos (9:16) shown as a swipeable row. Add them from Instagram below or upload your own. Use the arrows to set the order, and choose where each one shows.">
        <ListEditor name="items" titleKey="caption" addLabel="Add a reel" empty="No reels yet. Add one from Instagram below, or upload a video."
          items={c.reels.map((x) => ({ ...x }))}
          blank={{ id: "", media: "", poster: "", caption: "", href: "", where: "both", instagram: "" }}
          fields={[
            { key: "instagram", label: "Instagram reel link", type: "text", placeholder: "https://www.instagram.com/reel/…", hint: "Open the reel on Instagram, tap ⋯ › Copy link, and paste it here. It plays on your site through Instagram. Or upload a video below instead." },
            { key: "media", label: "Video (vertical works best)", type: "video" },
            { key: "poster", label: "Cover picture (optional)", type: "photo" },
            { key: "caption", label: "Caption", type: "text", placeholder: "e.g. Styling our new stacking rings" },
            { key: "where", label: "Show on", type: "select", half: true, options: [["both", "Homepage and product pages"], ["home", "Homepage only"], ["product", "Product pages only"]] },
            { key: "href", label: "“Shop this” button goes to (optional)", type: "select", half: true, options: [["", "No button"], ["/shop", "All jewellery"], ...products.map((p) => [`/product/${p.slug}`, p.name] as [string, string])] },
          ]} />
      </EditorForm>

      <section className="max-w-3xl space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-medium">From Instagram</p>
          {ig.connected && !ig.fromEnv && <form action={disconnectInstagram}><button className="text-xs underline opacity-60">Disconnect @{ig.user}</button></form>}
        </div>
        {q.ig && q.ig !== "ok" && <p className="rounded-xl bg-burgundy/10 p-3 text-sm text-burgundy">{q.ig}</p>}
        {q.ig === "ok" && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">Instagram is connected.</p>}
        {!ig.connected ? (
          <>
            <p className="text-sm opacity-70">Connect your Instagram professional (Business or Creator) account once, then pick posts here with one tap. Nothing is posted to Instagram.</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm opacity-70">
              <li>Go to developers.facebook.com, create an app, and add the “Instagram” product (Instagram API with Instagram login).</li>
              <li>Under “Generate access tokens”, add your Instagram account and press Generate token.</li>
              <li>Paste the token below. It is kept private on the server and renewed automatically.</li>
            </ol>
            <form action={connectInstagram} className="flex flex-col gap-2 sm:flex-row">
              <input name="token" required placeholder="Paste your Instagram access token" className="field" autoComplete="off" />
              <button className="btn btn-dark shrink-0">Connect</button>
            </form>
          </>
        ) : error ? (
          <p className="text-sm text-burgundy">Instagram said: {error}. You may need to connect again.</p>
        ) : !posts.length ? (
          <p className="text-sm opacity-60">No posts found on this account yet.</p>
        ) : (
          <>
            <p className="text-sm opacity-60">Tap “Add” to copy a post into your shop as a reel. It lands at the end of the list above as a draft.</p>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
              {[...posts].sort((a, b) => Number(b.type === "VIDEO") - Number(a.type === "VIDEO")).map((p) => (
                <form key={p.id} action={importInstagram} className="text-xs">
                  <input type="hidden" name="id" value={p.id} />
                  <div className="relative overflow-hidden rounded-xl bg-[#f4f2ee]" style={{ aspectRatio: "9/16" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
                    {p.type === "VIDEO" && <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Reel</span>}
                  </div>
                  <button disabled={added.has(p.link)} className="btn btn-line mt-2 w-full !px-2 !py-2 disabled:opacity-40">{added.has(p.link) ? "Added" : "Add"}</button>
                </form>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
