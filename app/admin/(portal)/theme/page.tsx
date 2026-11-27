import { saveTheme } from "../../content-actions";
import EditorForm from "@/components/admin/EditorForm";
import ThemeFields from "@/components/admin/ThemeFields";
import { getDraft } from "@/lib/store";
import { FONTS, PALETTES } from "@/lib/theme";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function ThemePage({ searchParams }: Q) {
  const q = await searchParams;
  const { content: c } = await getDraft();
  const google = Object.entries(FONTS).filter(([, f]) => !f.local).map(([n]) => `family=${n.replace(/ /g, "+")}:wght@400;700`).join("&");
  return (
    <EditorForm title="Colours and fonts" q={q} action={saveTheme}
      intro="Pick a ready-made palette or set each colour, then choose fonts. Press Save draft and Preview to see the whole shop before publishing.">
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${google}&display=swap`} precedence="default" />
      <ThemeFields theme={c.theme} palettes={PALETTES} fonts={FONTS} />
      <label className="flex items-center gap-2 text-sm opacity-70"><input type="checkbox" name="reset" value="1" className="h-5 w-5" /> Go back to the original colours and fonts</label>
    </EditorForm>
  );
}
