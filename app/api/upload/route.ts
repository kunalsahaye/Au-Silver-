import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getRole } from "@/lib/auth";
import { checkFile, signUpload, storageEnabled } from "@/lib/uploads";

/**
 * Photo and video uploads for the admin.
 * - With Supabase: the browser sends {type, size}; we check it and hand back a one-time upload address
 *   in Supabase Storage, so large videos never pass through this server.
 * - Without Supabase, in local development only: the browser posts the file here and it goes to public/uploads.
 */
export async function POST(request: Request) {
  if (!(await getRole())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  if ((request.headers.get("content-type") || "").includes("application/json")) {
    const { type, size } = (await request.json().catch(() => ({}))) as { type?: string; size?: number };
    const bad = checkFile(String(type ?? ""), Number(size) || 0);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });
    if (!storageEnabled) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Uploads need Supabase. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });
      }
      return NextResponse.json({ local: true });
    }
    try {
      return NextResponse.json(await signUpload(String(type)));
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  }

  if (storageEnabled || process.env.NODE_ENV === "production") return NextResponse.json({ error: "Not available" }, { status: 400 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  const bad = checkFile(file.type, file.size);
  if (bad) return NextResponse.json({ error: bad }, { status: 400 });
  const ext = file.type === "image/jpeg" ? "jpg" : file.type === "video/quicktime" ? "mov" : file.type.split("/")[1];
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}
