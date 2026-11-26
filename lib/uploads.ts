import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Photos and videos are stored in Supabase Storage (same Supabase project as the database),
 * so the shop works on any host. In local development without Supabase, files go to public/uploads.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || "media";
export const storageEnabled = Boolean(url && key);
/** True when the admin can upload files (always in development). */
export const uploadsEnabled = storageEnabled || process.env.NODE_ENV !== "production";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB (Supabase free plan's upload limit)

const sb = storageEnabled ? createClient(url!, key!, { auth: { persistSession: false } }) : null;

let bucket: Promise<void> | null = null;
/** Creates the public "media" bucket the first time it is needed. */
function ensureBucket(): Promise<void> {
  if (!bucket) {
    bucket = (async () => {
      const { error } = await sb!.storage.getBucket(BUCKET);
      if (!error) return;
      const made = await sb!.storage.createBucket(BUCKET, {
        public: true, fileSizeLimit: MAX_VIDEO_BYTES, allowedMimeTypes: [...IMAGE_TYPES, ...VIDEO_TYPES],
      });
      if (made.error && !/already exists/i.test(made.error.message)) throw new Error(`Could not create the photo storage: ${made.error.message}`);
    })().catch((e) => { bucket = null; throw e; });
  }
  return bucket;
}

const ext = (type: string) => ({ "image/jpeg": "jpg", "video/quicktime": "mov" } as Record<string, string>)[type] ?? type.split("/")[1];
const fileName = (type: string) => `uploads/${new Date().toISOString().slice(0, 7)}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext(type)}`;

/** Checks type and size; returns an error message or null. */
export function checkFile(type: string, size: number): string | null {
  const video = VIDEO_TYPES.includes(type);
  if (!video && !IMAGE_TYPES.includes(type)) return "Please upload a JPG, PNG, WebP, AVIF or GIF photo, or an MP4, MOV or WebM video.";
  if (size > (video ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES)) return video ? "Videos can be up to 50 MB." : "Photos can be up to 10 MB.";
  return null;
}

/** A one-time address the browser uploads the file to directly, plus the file's public address. */
export async function signUpload(type: string): Promise<{ uploadUrl: string; url: string }> {
  await ensureBucket();
  const path = fileName(type);
  const { data, error } = await sb!.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(`Upload could not start: ${error?.message ?? "unknown error"}`);
  return { uploadUrl: data.signedUrl, url: sb!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

/** Copies a file from another address (e.g. Vercel Blob) into Supabase Storage. Returns the new address. */
export async function copyIntoStorage(src: string): Promise<string> {
  await ensureBucket();
  const r = await fetch(src);
  if (!r.ok) throw new Error(`Could not download ${src} (${r.status})`);
  const type = (r.headers.get("content-type") || "image/jpeg").split(";")[0];
  const path = fileName(type);
  const { error } = await sb!.storage.from(BUCKET).upload(path, Buffer.from(await r.arrayBuffer()), { contentType: type });
  if (error) throw new Error(`Could not copy ${src}: ${error.message}`);
  return sb!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
