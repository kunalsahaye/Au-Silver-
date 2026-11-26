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
      intro="The groups your products sit in. A category can sit inside another one (for example Studs inside Earrings). The order here is the order in the shop menu and on the homepage.">
      <ListEditor name="items" titleKey="name" addLabel="Add a category"
        items={c.categories.map((x) => ({ ...x }))}
        blank={{ slug: "", name: "", image: "", inMenu: true, parent: "", description: "", seoTitle: "", seoDescription: "" }}
        fields={[
          { key: "name", label: "Name", type: "text", half: true, placeholder: "e.g. Anklets" },
          { key: "parent", label: "Sits inside", type: "select", half: true, options: [["", "Nothing (main category)"], ...c.categories.filter((x) => !x.parent).map((x): [string, string] => [x.slug, x.name])], hint: "Pick a main category to make this a sub-category, e.g. Studs inside Earrings." },
          { key: "image", label: "Category photo", type: "photo" },
          { key: "description", label: "Short description (shown at the top of the category page and used by Google)", type: "textarea" },
          { key: "slug", label: "Web address", type: "text", half: true, hint: "Made from the name if blank. Changing it moves products out of this category." },
          { key: "inMenu", label: "Show in the top menu", type: "check", half: true },
          { key: "seoTitle", label: "Title on Google (optional, up to 60 letters)", type: "text", half: true },
          { key: "seoDescription", label: "Description on Google (optional, up to 160 letters)", type: "text", half: true },
        ]} />
      <p className="text-sm opacity-60">Products per category: {c.categories.map((x) => `${x.parent ? "— " : ""}${x.name} ${count(x.slug)}`).join(" · ")}</p>
    </EditorForm>
  );
}
