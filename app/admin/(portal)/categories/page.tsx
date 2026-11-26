import { saveCategories } from "../../content-actions";
import EditorForm from "@/components/admin/EditorForm";
import ListEditor from "@/components/admin/ListEditor";
import { getProducts, getDraft } from "@/lib/store";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Categories({ searchParams }: Q) {
  const q = await searchParams;
  const [{ content: c }, products] = await Promise.all([getDraft(), getProducts()]);
  const count = (slug: string) => products.filter((p) => p.category === slug).length;
  return (
    <EditorForm title="Categories" q={q} action={saveCategories}
      intro="The groups your products sit in. Their order here is their order in the shop menu and on the homepage.">
      <ListEditor name="items" titleKey="name" addLabel="Add a category"
        items={c.categories.map((x) => ({ ...x }))}
        blank={{ slug: "", name: "", image: "", inMenu: true }}
        fields={[
          { key: "name", label: "Name", type: "text", half: true, placeholder: "e.g. Anklets" },
          { key: "slug", label: "Web address", type: "text", half: true, hint: "Made from the name if blank. Changing it moves products out of this category." },
          { key: "image", label: "Category photo", type: "photo" },
          { key: "inMenu", label: "Show in the top menu", type: "check" },
        ]} />
      <p className="text-sm opacity-60">Products per category: {c.categories.map((x) => `${x.name} ${count(x.slug)}`).join(" · ")}</p>
    </EditorForm>
  );
}
