import "server-only";

/** True when a Vercel Blob store is connected (Vercel adds these env vars when you connect one). */
export const blobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
