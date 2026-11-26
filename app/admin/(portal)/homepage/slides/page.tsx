import { saveSlides } from "../../../content-actions";
import EditorForm from "@/components/admin/EditorForm";
import ListEditor from "@/components/admin/ListEditor";
import { getDraft } from "@/lib/store";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Slides({ searchParams }: Q) {
  const q = await searchParams;
  const { content: c } = await getDraft();
  return (
    <EditorForm title="Homepage slides" q={q} action={saveSlides}
      intro="Photos or videos that change at the top of the homepage. Wide photos (landscape) look best. Videos play silently on a loop.">
      <ListEditor name="items" titleKey="title" addLabel="Add a slide" empty="No slides yet. The homepage shows the big top photo instead."
        items={c.slides.map((x) => ({ ...x }))}
        blank={{ id: "", media: "", title: "", sub: "", cta: "Shop now", href: "/shop" }}
        fields={[
          { key: "media", label: "Photo or video", type: "video", hint: "Photos up to 10 MB, videos (MP4 or MOV) up to 50 MB." },
          { key: "title", label: "Headline", type: "text", placeholder: "e.g. The Winter Edit" },
          { key: "sub", label: "Small text", type: "text", placeholder: "Optional" },
          { key: "cta", label: "Button text", type: "text", half: true, placeholder: "e.g. Shop now" },
          { key: "href", label: "Button goes to", type: "text", half: true, placeholder: "/shop/rings", hint: "A page on your shop, e.g. /shop or /shop/rings" },
        ]} />
    </EditorForm>
  );
}
