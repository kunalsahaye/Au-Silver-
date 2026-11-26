import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getRole } from "@/lib/auth";

/** Opens the shop showing the unpublished draft (only for signed-in admin users). */
export async function GET(request: Request) {
  if (!(await getRole())) redirect("/admin/login");
  (await draftMode()).enable();
  const to = new URL(request.url).searchParams.get("to") ?? "/";
  redirect(/^\/(?!\/)[\w\-/?=&]*$/.test(to) ? to : "/");
}
