import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getRole } from "@/lib/auth";
import { blobEnabled, IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/uploads";

/**
 * Image uploads for the admin portal.
 * - With Vercel Blob connected: the browser uploads straight to Blob; this route only hands out
 *   short-lived upload tokens to signed-in portal users (and receives Blob's completion callback).
 * - Without Blob, in local development only: accepts a multipart upload and saves it to public/uploads.
 */
export async function POST(request: Request) {
  if (blobEnabled) {
    const body = (await request.json()) as HandleUploadBody;
    try {
      const result = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => {
          if (!(await getRole())) throw new Error("Not signed in");
          return { allowedContentTypes: IMAGE_TYPES, maximumSizeInBytes: MAX_IMAGE_BYTES, addRandomSuffix: true };
        },
        onUploadCompleted: async () => {},
      });
      return NextResponse.json(result);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Image uploads need a Vercel Blob store. Connect one in Vercel > Storage." }, { status: 503 });
  }
  if (!(await getRole())) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!IMAGE_TYPES.includes(file.type)) return NextResponse.json({ error: "Please upload a JPG, PNG, WebP, AVIF or GIF image." }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Image is larger than 10 MB." }, { status: 400 });
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}
