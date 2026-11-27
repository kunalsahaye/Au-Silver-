import { parseFaq } from "@/lib/faq";

/** Shows page text written in the admin: blank line = new paragraph, "## " = heading, "- " = bullet. FAQ mode: "# Topic" groups, "## Question" opens an item. */
export default function RichText({ text, faq = false }: { text: string; faq?: boolean }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (faq) {
    const groups = parseFaq(text);
    if (groups.length) {
      const id = (t: string) => `faq-${t.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const named = groups.filter((g) => g.topic);
      return (
        <div>
          {named.length > 1 && (
            <nav aria-label="FAQ topics" className="no-scrollbar -mx-5 mb-10 flex gap-2 overflow-x-auto px-5">
              {named.map((g) => <a key={g.topic} href={`#${id(g.topic)}`} className="rounded-full border border-ink/20 px-4 py-2 text-[11px] tracking-[0.12em] whitespace-nowrap uppercase hover:border-ink">{g.topic}</a>)}
            </nav>
          )}
          <div className="space-y-14">
            {groups.map((g, gi) => (
              <section key={gi} id={g.topic ? id(g.topic) : undefined} className="scroll-mt-28">
                {g.topic && <h2 className="mb-4 text-[11px] tracking-[0.22em] uppercase opacity-50">{g.topic}</h2>}
                <div className="divide-y divide-ink/10 border-y border-ink/10">
                  {g.items.map((it, i) => (
                    <details key={i} className="group" open={gi === 0 && i === 0}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] leading-snug tracking-[-0.01em] hover:opacity-70 [&::-webkit-details-marker]:hidden">
                        {it.q}
                        <span aria-hidden className="relative h-3 w-3 shrink-0"><span className="absolute top-1/2 left-0 h-px w-3 bg-current" /><span className="absolute top-0 left-1/2 h-3 w-px bg-current transition group-open:rotate-90 group-open:opacity-0" /></span>
                      </summary>
                      <div className="max-w-2xl pb-6 text-[15px] opacity-75"><RichText text={it.a} /></div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      );
    }
  }
  return (
    <div className="space-y-5 leading-relaxed">
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) {
          const [h, ...rest] = b.split("\n");
          return <div key={i} className="space-y-2"><h2 className="pt-4 text-2xl font-bold tracking-tight">{h.slice(3)}</h2>{rest.length > 0 && (rest.every((l) => l.startsWith("- "))
            ? <ul className="list-disc space-y-1 pl-5">{rest.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>
            : <p className="whitespace-pre-line">{rest.join("\n")}</p>)}</div>;
        }
        const lines = b.split("\n");
        if (lines.every((l) => l.startsWith("- "))) return <ul key={i} className="list-disc space-y-1 pl-5">{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
        return <p key={i} className="whitespace-pre-line">{b}</p>;
      })}
    </div>
  );
}
