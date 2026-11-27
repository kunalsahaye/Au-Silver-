import { savePages } from "../../content-actions";
import EditorForm from "@/components/admin/EditorForm";
import ListEditor from "@/components/admin/ListEditor";
import { getDraft } from "@/lib/store";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Pages({ searchParams }: Q) {
  const q = await searchParams;
  const { content: c } = await getDraft();
  return (
    <EditorForm title="Pages" q={q} action={savePages}
      intro="About, Contact, FAQ and any page you add (for example a Care guide or Returns).">
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed shadow-sm">
        <b>Writing tips.</b> Leave a blank line between paragraphs. Start a line with <code>## </code> for a heading
        and with <code>- </code> for a bullet point. On the FAQ page, each <code>## </code> line is a question, and a <code># </code> line (one hash) starts a topic such as <code># Shipping</code>.
      </div>
      <ListEditor name="items" titleKey="title" addLabel="Add a page"
        items={c.pages.map((x) => ({ ...x }))}
        blank={{ slug: "", title: "", body: "", inMenu: false, seoTitle: "", seoDescription: "", image: "" }}
        fields={[
          { key: "title", label: "Page title", type: "text", half: true },
          { key: "slug", label: "Web address", type: "text", half: true, hint: "e.g. care-guide opens at /care-guide. Made from the title if blank." },
          { key: "body", label: "Text", type: "textarea" },
          { key: "inMenu", label: "Show in the top menu", type: "check" },
          { key: "seoTitle", label: "Title on Google (optional, up to 60 letters)", type: "text", half: true },
          { key: "seoDescription", label: "Description on Google (optional, up to 160 letters)", type: "text", half: true },
          { key: "image", label: "Picture shown when the page is shared on WhatsApp, Facebook etc. (optional)", type: "photo" },
        ]} />
    </EditorForm>
  );
}
