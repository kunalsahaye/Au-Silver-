import { saveCustomers } from "../../../content-actions";
import EditorForm from "@/components/admin/EditorForm";
import ListEditor from "@/components/admin/ListEditor";
import { getDraft } from "@/lib/store";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Customers({ searchParams }: Q) {
  const q = await searchParams;
  const { content: c } = await getDraft();
  return (
    <EditorForm title="Happy customers" q={q} action={saveCustomers}
      intro="Customer photos, videos and kind words, shown on the homepage. Ask customers before you post their photo.">
      <ListEditor name="items" titleKey="name" addLabel="Add a customer" empty="No customers yet. Add your first happy customer."
        items={c.customers.map((x) => ({ ...x }))}
        blank={{ id: "", name: "", note: "", media: "", rating: 5 }}
        fields={[
          { key: "media", label: "Photo or video", type: "video" },
          { key: "name", label: "Name", type: "text", half: true, placeholder: "e.g. Priya, Mumbai" },
          { key: "rating", label: "Stars", type: "stars", half: true },
          { key: "note", label: "What they said", type: "textarea" },
        ]} />
    </EditorForm>
  );
}
