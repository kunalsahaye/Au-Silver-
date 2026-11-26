import Link from "next/link";
import { logout } from "../actions";
import { requireRole } from "@/lib/auth";
import { getDraft, usingSupabase } from "@/lib/store";
import { uploadsEnabled } from "@/lib/uploads";
import PublishBar from "@/components/admin/PublishBar";

export const dynamic = "force-dynamic";

export default async function Portal({ children }: { children: React.ReactNode }) {
  const role = await requireRole();
  const { content, unpublished } = await getDraft();
  const s = content.site;
  const links = [
    ["Home", "/admin"], ["Products", "/admin/products"], ["Orders", "/admin/orders"], ["Enquiries", "/admin/enquiries"],
    ["Homepage", "/admin/homepage"], ["Slides", "/admin/homepage/slides"], ["Happy customers", "/admin/homepage/customers"],
    ["Categories", "/admin/categories"], ["Pages", "/admin/pages"], ["Shop settings", "/admin/settings"],
  ];
  return (
    <div className="min-h-screen bg-[#f2ece6] md:grid md:grid-cols-[230px_1fr]">
      <aside className="bg-[#24160f] p-6 text-ivory md:min-h-screen">
        <p className="serif text-2xl italic">{s.brand}</p>
        <p className="eyebrow mt-1 text-gold">{role === "admin" ? "Admin" : "Client"} portal</p>
        <nav className="mt-8 flex gap-2 overflow-x-auto md:block md:space-y-1">
          {links.map(([l, h]) => <Link key={h} href={h} className="block whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-ivory/10">{l}</Link>)}
          <Link href="/" target="_blank" className="block whitespace-nowrap rounded-xl px-3 py-2 text-sm opacity-60 hover:bg-ivory/10">View site ↗</Link>
        </nav>
        <form action={logout} className="mt-6"><button className="text-xs opacity-60 hover:opacity-100">Sign out</button></form>
      </aside>
      <div className="p-5 md:p-10">
        {!usingSupabase && role === "admin" && (
          <div className="mb-6 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
            <b>Demo mode.</b> No database is connected, so products, orders and content are stored temporarily and can disappear. Connect Supabase to make them permanent.
          </div>
        )}
        {unpublished && <PublishBar />}
        {!uploadsEnabled && role === "admin" && (
          <div className="mb-6 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
            <b>Photo uploads are off.</b> They use Supabase Storage, so connect Supabase (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY). Pasting image links still works.
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
