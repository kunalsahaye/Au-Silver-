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
  return (
    <EditorForm title="Change the homepage" q={q} action={saveHomepage}
      intro="Turn sections on or off and put them in the order you like. Edit the words and photos below.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/admin/homepage/slides" className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md"><b>Slides at the top →</b><p className="text-sm opacity-60">{c.slides.length} slide{c.slides.length === 1 ? "" : "s"}</p></Link>
        <Link href="/admin/homepage/customers" className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md"><b>Happy customers →</b><p className="text-sm opacity-60">{c.customers.length} customer{c.customers.length === 1 ? "" : "s"}</p></Link>
      </div>
      <Box title="Sections, top to bottom">
        <ListEditor name="items" fixed titleKey="key" titles={sectionNames}
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
        <ImageField name="img7" label="Photo" defaultValue={s.img7} />
      </Box>
    </EditorForm>
  );
}
