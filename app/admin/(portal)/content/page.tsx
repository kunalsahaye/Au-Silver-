import { updateContent } from "../../actions";
import ImageField from "@/components/admin/ImageField";
import { getSettings } from "@/lib/store";
import { blobEnabled } from "@/lib/uploads";
import type { SiteSettings } from "@/lib/types";

const photos: [keyof SiteSettings, string][] = [
  ["img1", "Home: big hero photo at the top"],
  ["img2", "Home: large photo beside the story text"],
  ["img3", "Home: story strip, photo 1"], ["img4", "Home: story strip, photo 2"],
  ["img5", "Home: story strip, photo 3"], ["img6", "Home: story strip, photo 4"],
  ["img7", "Home: photo beside “process” section"],
  ["img8", "About page: wide photo under the headline"],
];

function Field({ k, label, area, s }: { k: keyof SiteSettings; label: string; area?: number; s: SiteSettings }) {
  return (
    <label className="block text-sm"><span className="mb-1 block opacity-60">{label}</span>
      {area ? <textarea name={k} rows={area} defaultValue={s[k]} className="field" /> : <input name={k} defaultValue={s[k]} className="field" />}
    </label>
  );
}
function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-4 rounded-2xl bg-white p-7"><p className="font-medium">{title}</p>{children}</section>;
}

export default async function Content({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const s = await getSettings();
  return (
    <div className="max-w-2xl">
      <h1 className="serif mb-6 text-4xl italic">Site content</h1>
      {saved && <p className="mb-4 rounded-xl bg-green-100 p-3 text-sm text-green-900">Saved. Your site is updated.</p>}
      <form action={updateContent} className="space-y-5">
        <Box title="Brand">
          <Field s={s} k="brand" label="Brand name" /><Field s={s} k="tagline" label="Tagline" /><Field s={s} k="announcement" label="Top announcement bar" />
        </Box>
        <Box title="Home page">
          <Field s={s} k="heroTitle" label="Headline" /><Field s={s} k="heroSub" label="Sub-headline" area={2} />
          <Field s={s} k="storyTitle" label="Story headline (also the About page title)" /><Field s={s} k="storyBody" label="Story text" area={3} />
          <Field s={s} k="processTitle" label="Process section headline" />
        </Box>
        <Box title="About page"><Field s={s} k="aboutBody" label="About text (blank line = new paragraph; the first paragraph also shows on the home page)" area={8} /></Box>
        <Box title="Contact and shop details">
          <div className="grid grid-cols-2 gap-4"><Field s={s} k="email" label="Email" /><Field s={s} k="phone" label="Phone" /></div>
          <Field s={s} k="address" label="Address" /><div className="grid grid-cols-2 gap-4"><Field s={s} k="instagram" label="Instagram" /><Field s={s} k="currency" label="Currency symbol" /></div>
        </Box>
        <Box title="Photos">
          <p className="text-sm opacity-60">Upload a photo for each spot. Empty spots show a soft placeholder.</p>
          {photos.map(([k, label]) => <ImageField key={k} name={k} label={label} defaultValue={s[k]} blob={blobEnabled} />)}
        </Box>
        <div className="sticky bottom-4"><button className="btn btn-dark shadow-lg">Save changes</button></div>
      </form>
    </div>
  );
}
