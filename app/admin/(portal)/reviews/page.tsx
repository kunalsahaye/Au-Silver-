import { saveReviews } from "../../content-actions";
import EditorForm from "@/components/admin/EditorForm";
import ListEditor from "@/components/admin/ListEditor";
import { getDraft, getProducts } from "@/lib/store";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Reviews({ searchParams }: Q) {
  const q = await searchParams;
  const [{ content: c }, products] = await Promise.all([getDraft(), getProducts()]);
  return (
    <EditorForm title="Customer reviews" q={q} action={saveReviews}
      intro="Written testimonials shown as cards on the homepage. Use the arrows to choose the order; the first nine show. Only post real reviews, with the customer's permission.">
      <ListEditor name="items" titleKey="name" addLabel="Add a review" empty="No reviews yet."
        items={c.reviews.map((x) => ({ ...x }))}
        blank={{ id: "", name: "", place: "", text: "", rating: 5, product: "" }}
        fields={[
          { key: "name", label: "Name", type: "text", half: true, placeholder: "e.g. Ananya" },
          { key: "place", label: "City (optional)", type: "text", half: true, placeholder: "e.g. Pune" },
          { key: "rating", label: "Stars", type: "stars", half: true },
          { key: "product", label: "Piece they bought (optional)", type: "select", half: true, options: [["", "None"], ...products.map((p) => [p.slug, p.name] as [string, string])] },
          { key: "text", label: "What they said", type: "textarea" },
        ]} />
    </EditorForm>
  );
}
