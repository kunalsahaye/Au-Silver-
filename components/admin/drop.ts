"use client";
import { useEffect, useRef, useState } from "react";

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";
export const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/webm";
const IMAGES = IMAGE_ACCEPT.split(",");
const VIDEOS = VIDEO_ACCEPT.split(",");
const MB = 1024 * 1024;

/** Same rules as the server (lib/uploads.ts), checked before uploading so mistakes show at once. */
export function checkLocal(f: File, video: boolean): string {
  const name = f.name || "This file";
  if (IMAGES.includes(f.type)) return f.size > 10 * MB ? `${name} is over 10 MB. Please use a smaller photo.` : "";
  if (video && VIDEOS.includes(f.type)) return f.size > 50 * MB ? `${name} is over 50 MB. Please use a shorter or smaller video.` : "";
  if (/heic|heif/i.test(f.type) || /\.hei[cf]$/i.test(f.name)) return `${name} is an iPhone HEIC photo. Please save it as JPG first.`;
  return video ? `${name} is not a photo or video. Use JPG, PNG, WebP, MP4 or MOV.` : `${name} is not a photo. Use JPG, PNG or WebP.`;
}

const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

/**
 * Turns any element into a drop target for files. Spread `bind` on it; `over` is true while files hover.
 * Only reacts to files from the computer, so dragging things around inside the page is left alone.
 */
export function useDropZone(onFiles: (files: File[]) => void, disabled = false) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);
  const bind = {
    onDragEnter: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault(); e.stopPropagation();
      depth.current++; if (!disabled) setOver(true);
    },
    onDragOver: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault(); e.stopPropagation();
      e.dataTransfer.dropEffect = disabled ? "none" : "copy";
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.stopPropagation();
      depth.current = Math.max(0, depth.current - 1);
      if (!depth.current) setOver(false);
    },
    onDrop: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault(); e.stopPropagation();
      depth.current = 0; setOver(false);
      if (!disabled) onFiles(Array.from(e.dataTransfer.files));
    },
  };
  return { over, bind };
}

/** A local preview address for a file that is still uploading. Freed when the component goes away. */
export function usePreviews() {
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);
  return (f: File) => { const u = URL.createObjectURL(f); urls.current.push(u); return u; };
}
