import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/auth";
import { deleteSubscriber, getSubscribers } from "@/lib/store";

async function remove(fd: FormData) {
  "use server";
  if (!(await getRole())) redirect("/admin/login");
  await deleteSubscriber(String(fd.get("id")));
  revalidatePath("/admin/subscribers");
}

export default async function Subscribers() {
  const list = await getSubscribers();
  return (
    <div className="max-w-3xl">
      <h1 className="serif text-4xl italic">Email sign-ups</h1>
      <p className="mt-2 mb-6 opacity-70">People who joined your list from the popup or the footer. Download them to send offers from Mailchimp, Brevo or Gmail.</p>
      <a href="/admin/subscribers.csv" className="btn btn-dark mb-6">Download list (CSV)</a>
      <div className="divide-y divide-black/5 rounded-2xl bg-white">
        {!list.length && <p className="p-6 text-sm opacity-60">No sign-ups yet. Turn on the popup or footer sign-up in Plugins.</p>}
        {list.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <div><p>{s.email}</p><p className="text-xs opacity-50">{s.source.startsWith("restock:") ? `Back in stock: ${s.source.slice(8)}` : s.source || "—"} · {new Date(s.created_at).toLocaleDateString("en-IN")}</p></div>
            <form action={remove}><input type="hidden" name="id" value={s.id} /><button className="text-xs underline opacity-60">Remove</button></form>
          </div>
        ))}
      </div>
    </div>
  );
}
