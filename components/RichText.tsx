/** Shows page text written in the admin: blank line = new paragraph, "## " = heading, "- " = bullet. */
export default function RichText({ text, faq = false }: { text: string; faq?: boolean }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (faq) {
    // Each "## Question" starts a new item; the lines after it are the answer.
    const items: { q: string; a: string[] }[] = [];
    for (const line of text.replace(/\r/g, "").split("\n")) {
      if (line.startsWith("## ")) items.push({ q: line.slice(3).trim(), a: [] });
      else if (items.length) items[items.length - 1].a.push(line);
    }
    if (items.length) {
      return (
        <div className="divide-y divide-black/10 border-y border-black/10">
          {items.map((it, i) => (
            <details key={i} className="group py-5" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
                {it.q}<span className="text-2xl font-light transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-3 opacity-75"><RichText text={it.a.join("\n").trim()} /></div>
            </details>
          ))}
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
