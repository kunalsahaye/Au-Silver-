import { saveWords } from "../../content-actions";
import EditorForm, { Box } from "@/components/admin/EditorForm";
import { getDraft } from "@/lib/store";
import { WORDS, words, type WordKey } from "@/lib/words";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Words({ searchParams }: Q) {
  const q = await searchParams;
  const { content: c } = await getDraft();
  const w = words(c.words);
  const groups = new Map<string, WordKey[]>();
  for (const k of Object.keys(WORDS) as WordKey[]) {
    const g = WORDS[k][1].split(":")[0];
    groups.set(g, [...(groups.get(g) ?? []), k]);
  }
  return (
    <EditorForm title="Words on the site" q={q} action={saveWords}
      intro="Buttons, small headings and messages around the shop. Clear a box to go back to the original wording.">
      {[...groups].map(([g, keys]) => (
        <Box key={g} title={g}>
          {keys.map((k) => (
            <label key={k} className="block text-sm">
              <span className="mb-1 block opacity-60">{WORDS[k][1].split(": ").slice(1).join(": ")}</span>
              <input name={k} defaultValue={w[k]} placeholder={WORDS[k][0]} className="field" />
            </label>
          ))}
        </Box>
      ))}
    </EditorForm>
  );
}
