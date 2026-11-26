import { NextResponse } from "next/server";
import { getProducts, usingSupabase } from "@/lib/store";
import { schemaStatus } from "@/lib/migrate";
import { blobEnabled } from "@/lib/uploads";
import { authProblems } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Setup check: says which services are connected. Never returns secrets. */
export async function GET() {
  const { autoSetup } = await schemaStatus();
  let products: number | string = 0;
  try { products = (await getProducts()).length; } catch (e) { products = `error: ${(e as Error).message}`; }
  return NextResponse.json({
    database: usingSupabase ? "supabase" : "demo (temporary)",
    databaseAutoSetup: autoSetup,
    products,
    photoUploads: blobEnabled,
    loginReady: authProblems().length === 0,
  });
}
