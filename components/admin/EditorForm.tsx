import Notice from "./Notice";

/** Page frame for the draft editors: heading, help text, the form and a big sticky Save button. */
export default function EditorForm({ title, intro, action, q, children }: {
  title: string; intro: string; action: (fd: FormData) => Promise<void>;
  q: Record<string, string | undefined>; children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <h1 className="serif text-4xl italic">{title}</h1>
      <p className="mt-2 mb-6 opacity-70">{intro}</p>
      <Notice q={q} />
      <form action={action} className="space-y-6">
        {children}
        <div className="sticky bottom-4 z-20 flex justify-end">
          <button className="btn btn-dark !px-8 !py-4 shadow-lg">Save draft</button>
        </div>
      </form>
    </div>
  );
}
export function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"><p className="font-medium">{title}</p>{children}</section>;
}
export function Text({ name, label, value, area, hint }: { name: string; label: string; value: string; area?: number; hint?: string }) {
  return (
    <label className="block text-sm"><span className="mb-1 block opacity-60">{label}</span>
      {area ? <textarea name={name} rows={area} defaultValue={value} className="field" /> : <input name={name} defaultValue={value} className="field" />}
      {hint && <span className="mt-1 block text-xs opacity-50">{hint}</span>}
    </label>
  );
}
