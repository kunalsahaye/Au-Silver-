import { updateContent } from "../../actions";
import { getSettings } from "@/lib/store";

export default async function Content({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const s = await getSettings();
  const F = ({ k, label, area }: { k: keyof typeof s; label: string; area?: number }) => (
    <label className="block text-sm"><span className="mb-1 block opacity-60">{label}</span>
      {area ? <textarea name={k} rows={area} defaultValue={s[k]} className="field" /> : <input name={k} defaultValue={s[k]} className="field" />}
    </label>
  );
  return (
    <div className="max-w-2xl">
      <h1 className="serif mb-6 text-4xl italic">Site content</h1>
      {saved && <p className="mb-4 rounded-xl bg-green-100 p-3 text-sm text-green-900">Saved. Your site is updated.</p>}
      <form action={updateContent} className="space-y-4 rounded-2xl bg-white p-7">
        <F k="brand" label="Brand name" /><F k="tagline" label="Tagline" /><F k="announcement" label="Top announcement bar" />
        <F k="heroTitle" label="Homepage headline" /><F k="heroSub" label="Homepage sub-headline" area={2} />
        <F k="storyTitle" label="Story headline" /><F k="storyBody" label="Story text" area={3} />
        <F k="aboutBody" label="About page text" area={8} />
        <div className="grid grid-cols-2 gap-4"><F k="email" label="Email" /><F k="phone" label="Phone" /></div>
        <F k="address" label="Address" /><div className="grid grid-cols-2 gap-4"><F k="instagram" label="Instagram" /><F k="currency" label="Currency symbol" /></div>
        <p className="pt-4 font-medium">Photos</p>
        <p className="text-sm opacity-60">Paste an image URL for each slot. Slot 1 is the main hero photo; slots 2 to 8 fill the other large photo areas on the home page, in order. Blank slots show a placeholder.</p>
        {(["img1","img2","img3","img4","img5","img6","img7","img8"] as const).map((k, i) => <F key={k} k={k} label={`Photo ${i + 1}`} />)}
        <button className="btn btn-dark">Save changes</button>
      </form>
    </div>
  );
}
