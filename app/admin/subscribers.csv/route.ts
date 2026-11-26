import { getRole } from "@/lib/auth";
import { getSubscribers } from "@/lib/store";

export async function GET() {
  if (!(await getRole())) return new Response("Sign in first", { status: 401 });
  const rows = await getSubscribers();
  const q = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = ["email,source,joined", ...rows.map((r) => [q(r.email), q(r.source ?? ""), q(r.created_at)].join(","))].join("\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="email-signups.csv"' } });
}
