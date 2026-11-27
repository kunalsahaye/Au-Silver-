import Link from "next/link";
import { saveHomepage } from "../../content-actions";
import EditorForm, { Box, Text } from "@/components/admin/EditorForm";
import ImageField from "@/components/admin/ImageField";
import ListEditor from "@/components/admin/ListEditor";
import { getDraft } from "@/lib/store";
import { sectionNames } from "@/lib/seed";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Homepage({ searchParams }: Q) {
  const q = await searchParams;
  const { content: c } = await getDraft();
  const s = c.site;
  const needs: Partial<Record<string, boolean>> = {
    reels: !c.reels.some((r) => r.where !== "product"), reviews: !c.reviews.length, customers: !c.customers.length,
    visit: !(s.latitude || s.city || (s.address && !/^Add your/i.test(s.address))), gifts: !c.home.gifts.length, badges: !c.home.badges.length,
  };
  const titles = Object.fromEntries(Object.entries(sectionNames).map(([k, v]) => [k, needs[k] ? `${v} · needs content` : v]));
  return (
    <EditorForm title="Change the homepage" q={q} action={saveHomepage}
      intro="Turn sections on or off and put them in the order you like. Edit the words and photos below.">
      <div className="grid gap-3 sm:grid-cols-2">
        {([
          ["/admin/homepage/slides", "Slides at the top", `${c.slides.length} slide${c.slides.length === 1 ? "" : "s"}`],
          ["/admin/homepage/blocks", "More sections", "Gift guide, badges, offer banner, collection, FAQ, map"],
          ["/admin/reels", "Reels", c.reels.length ? `${c.reels.length} reel${c.reels.length === 1 ? "" : "s"}` : "None yet: the shop shows a Follow on Instagram link until you add some"],
          ["/admin/reviews", "Testimonials and reviews", c.reviews.length ? `${c.reviews.length} testimonial${c.reviews.length === 1 ? "" : "s"} on the homepage` : "None picked yet: approved product reviews show, or an invitation to write one"],
          ["/admin/homepage/customers", "Happy customers", c.customers.length ? `${c.customers.length} customer${c.customers.length === 1 ? "" : "s"}` : "Empty: hidden until you add a photo"],
        ] as const).map(([href, t, sub]) => (
          <Link key={href} href={href} className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md"><b>{t} →</b><p className="text-sm opacity-60">{sub}</p></Link>
        ))}
      </div>
      <Box title="Sections, top to bottom">
        <p className="text-xs opacity-60">Use the arrows to move a section up or down. Sections marked “needs content” show a simple placeholder (reels, testimonials) or stay hidden until you add something.</p>
        <ListEditor name="items" fixed titleKey="key" titles={titles}
          items={c.sections.map((x) => ({ key: x.key, on: x.on }))}
          fields={[{ key: "on", label: "Show on the homepage", type: "check" }]} />
      </Box>
      <Box title="Top of the page (used when there are no slides)">
        <ImageField name="img1" label="Big photo at the top" defaultValue={s.img1} video />
        <Text name="heroSub" label="Small text over the photo" value={s.heroSub} area={2} />
      </Box>
      <Box title="Bestsellers row">
        <Text name="heroTitle" label="Big headline" value={s.heroTitle} />
      </Box>
      <Box title="Our story">
        <Text name="storyTitle" label="Headline (also the About page title)" value={s.storyTitle} />
        <Text name="storyBody" label="Text" value={s.storyBody} area={4} />
        <ImageField name="img2" label="Large photo" defaultValue={s.img2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageField name="img3" label="Small photo 1" defaultValue={s.img3} />
          <ImageField name="img4" label="Small photo 2" defaultValue={s.img4} />
          <ImageField name="img5" label="Small photo 3" defaultValue={s.img5} />
          <ImageField name="img6" label="Small photo 4" defaultValue={s.img6} />
        </div>
      </Box>
      <Box title="Our process">
        <Text name="processTitle" label="Headline" value={s.processTitle} hint="The text beside it is the first paragraph of your About page." />
        <ImageField name="img7" label="Large photo" defaultValue={s.img7} />
        <ImageField name="img9" label="Small photo in the middle (empty shows a ring drawing)" defaultValue={s.img9} />
      </Box>
    </EditorForm>
  );
}
