import { enquiryStatus } from "../../actions";
import { getEnquiries } from "@/lib/store";

export default async function Enquiries() {
  const list = await getEnquiries();
  return (
    <div className="max-w-4xl">
      <h1 className="serif mb-6 text-4xl italic">Enquiries</h1>
      <div className="space-y-3">
        {list.map((e) => (
          <div key={e.id} className="rounded-2xl bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-medium">{e.name}</p><p className="text-sm opacity-60"><a href={`mailto:${e.email}`} className="underline">{e.email}</a>{e.phone && ` · ${e.phone}`} · {new Date(e.created_at).toLocaleString("en-IN")}</p></div>
              <form action={enquiryStatus} className="flex gap-2">
                <input type="hidden" name="id" value={e.id} />
                <select name="status" defaultValue={e.status} className="field !w-auto !py-1.5 text-sm"><option>new</option><option>contacted</option><option>closed</option></select>
                <button className="btn btn-dark !px-4 !py-1.5">Update</button>
              </form>
            </div>
            <p className="mt-3 text-sm leading-relaxed opacity-80">{e.message}</p>
            {e.product_name && <p className="eyebrow mt-2 text-burgundy">Re: {e.product_name}</p>}
          </div>
        ))}
        {!list.length && <p className="rounded-2xl bg-white p-8 text-center opacity-60">No enquiries yet.</p>}
      </div>
    </div>
  );
}
