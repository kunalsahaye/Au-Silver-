import { moderateReview, saveReviews } from "../../content-actions";
import EditorForm from "@/components/admin/EditorForm";
import ListEditor from "@/components/admin/ListEditor";
import { getDraft, getProducts, getReviews } from "@/lib/store";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Reviews({ searchParams }: Q) {
  const q = await searchParams;
  const [{ content: c }, products, all] = await Promise.all([getDraft(), getProducts(), getReviews()]);
  const name = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug;
  const btn = "rounded-full border border-[#e6dcd2] px-3 py-2 text-xs hover:bg-[#f4efe9]";
  const featured = new Set(c.reviews.map((r) => r.id));
  return (
    <div className="space-y-10">
    <section className="max-w-3xl">
      <h1 className="serif text-4xl italic">Reviews</h1>
      <p className="mt-2 mb-6 opacity-70">Customers write reviews on product pages. New ones wait here until you approve them; approved reviews show on that product (with stars in Google). Press “Show on homepage” to add one to the homepage testimonials below.</p>
      <div className="divide-y divide-black/5 rounded-2xl bg-white shadow-sm">
        {!all.length && <p className="p-6 text-sm opacity-60">No customer reviews yet. They appear here when someone writes one on a product page.</p>}
        {all.map((r) => (
          <div key={r.id} className="space-y-2 p-5">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-[#b8924a]">{"★".repeat(r.rating)}<span className="opacity-25">{"★".repeat(5 - r.rating)}</span></span>
              <b>{r.name}</b>{r.place && <span className="opacity-60">· {r.place}</span>}
              <span className="opacity-60">on {name(r.product)}</span>
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] ${r.status === "pending" ? "bg-amber-100 text-amber-900" : r.status === "approved" ? "bg-green-100 text-green-900" : "bg-black/5"}`}>{r.status === "pending" ? "Waiting" : r.status === "approved" ? "Shown" : "Hidden"}</span>
            </div>
            <p className="text-sm opacity-80">{r.text}</p>
            <form action={moderateReview} className="flex flex-wrap gap-2">
              <input type="hidden" name="id" value={r.id} />
              {r.status !== "approved" && <button name="act" value="approve" className={btn}>Approve</button>}
              {r.status !== "hidden" && <button name="act" value="hidden" className={btn}>Hide</button>}
              {!featured.has(r.id.slice(0, 20)) && <button name="act" value="feature" className={btn}>Show on homepage</button>}
              <button name="act" value="delete" className={`${btn} text-burgundy`}>Delete</button>
            </form>
          </div>
        ))}
      </div>
    </section>
    <EditorForm title="Homepage testimonials" q={q} action={saveReviews}
      intro="The quotes shown on the homepage, in this order: the first one is shown first. Use the arrows to reorder. Add your own from messages or WhatsApp with the customer's permission. For a Google review, open your Google listing, copy the name, stars and words exactly, and choose “Google review”.">
      <ListEditor name="items" titleKey="name" addLabel="Add a review" empty="No reviews yet."
        items={c.reviews.map((x) => ({ ...x }))}
        blank={{ id: "", name: "", place: "", text: "", rating: 5, product: "", source: "" }}
        fields={[
          { key: "name", label: "Name", type: "text", half: true, placeholder: "e.g. Ananya" },
          { key: "place", label: "City (optional)", type: "text", half: true, placeholder: "e.g. Pune" },
          { key: "rating", label: "Stars", type: "stars", half: true },
          { key: "product", label: "Piece they bought (optional)", type: "select", half: true, options: [["", "None"], ...products.map((p) => [p.slug, p.name] as [string, string])] },
          { key: "source", label: "Where it's from", type: "select", half: true, options: [["", "Told to us / our shop"], ["google", "Google review (copy it exactly)"]] },
          { key: "text", label: "What they said", type: "textarea" },
        ]} />
    </EditorForm>
    </div>
  );
}
