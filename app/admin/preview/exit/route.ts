import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Leaves preview and goes back to the admin. */
export async function GET() {
  (await draftMode()).disable();
  redirect("/admin");
}
