import { saveBlocks } from "../../../content-actions";
import EditorForm, { Box, Text } from "@/components/admin/EditorForm";
import ImageField from "@/components/admin/ImageField";
import ListEditor from "@/components/admin/ListEditor";
import { getDraft } from "@/lib/store";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
const tileFields = (where: string) => [
  { key: "image", label: "Picture", type: "photo" as const },
  { key: "title", label: "Title", type: "text" as const, half: true },
  { key: "text", label: "Small text (optional)", type: "text" as const, half: true },
  { key: "href", label: "Goes to", type: "text" as const, placeholder: "/shop/rings", hint: `A page on your shop, e.g. ${where}` },
];

export default async function Blocks({ searchParams }: Q) {
  const q = await searchParams;
  const { content: c } = await getDraft();
  const h = c.home;
  return (
    <EditorForm title="More homepage sections" q={q} action={saveBlocks}
      intro="Words, pictures and links for the extra homepage sections. Turn each section on or off and set its place in Change the homepage.">
      <Box title="Gift guide">
        <Text name="giftsTitle" label="Heading" value={h.giftsTitle} />
        <ListEditor name="gifts" titleKey="title" addLabel="Add a gift idea" items={h.gifts.map((x) => ({ ...x }))}
          blank={{ id: "", title: "", text: "", image: "", href: "/shop?max=1999" }} fields={tileFields("/shop?max=1999 for gifts under ₹1,999")} />
      </Box>
      <Box title="Why choose us (trust badges)">
        <Text name="badgesTitle" label="Heading (optional)" value={h.badgesTitle} />
        <ListEditor name="badges" titleKey="title" addLabel="Add a badge" items={h.badges.map((x) => ({ ...x }))}
          blank={{ id: "", icon: "✓", title: "", text: "" }}
          fields={[
            { key: "icon", label: "Symbol or short text", type: "text", half: true, placeholder: "e.g. 925 or ✓" },
            { key: "title", label: "Title", type: "text", half: true },
            { key: "text", label: "Short line", type: "text" },
          ]} />
        <p className="text-xs opacity-60">Only promise what you offer: check the delivery days, returns and silver claims match your shop.</p>
      </Box>
      <Box title="Offer banner">
        <ImageField name="promo.image" label="Big photo or video" defaultValue={h.promo.image} video />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="promo.eyebrow" label="Small text above" value={h.promo.eyebrow} />
          <Text name="promo.title" label="Headline" value={h.promo.title} />
          <Text name="promo.cta" label="Button text" value={h.promo.cta} />
          <Text name="promo.href" label="Button goes to" value={h.promo.href} />
        </div>
        <Text name="promo.text" label="Text" value={h.promo.text} area={2} />
      </Box>
      <Box title="Featured collection">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm"><span className="mb-1 block opacity-60">Category to show</span>
            <select name="collection.category" defaultValue={h.collection.category} className="field">
              {c.categories.map((x) => <option key={x.slug} value={x.slug}>{x.parent ? "— " : ""}{x.name}</option>)}
            </select>
          </label>
          <Text name="collection.title" label="Heading (empty uses the category name)" value={h.collection.title} />
        </div>
      </Box>
      <Box title="Questions and answers">
        <Text name="faqTitle" label="Heading" value={h.faqTitle} hint="Shows the first five questions from your FAQ page (edit them in Pages)." />
      </Box>
      <Box title="Email sign-up band">
        <Text name="newsletterTitle" label="Heading" value={h.newsletterTitle} />
        <Text name="newsletterText" label="Text" value={h.newsletterText} />
      </Box>
      <Box title="Visit us">
        <Text name="visitTitle" label="Heading" value={h.visitTitle} />
        <Text name="visitText" label="Text (optional)" value={h.visitText} area={2} hint="The address, hours and map position come from Google and SEO." />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showMap" defaultChecked={h.showMap} className="h-5 w-5" /> Show a Google map</label>
      </Box>
    </EditorForm>
  );
}
