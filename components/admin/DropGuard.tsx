"use client";
import { useEffect } from "react";

/**
 * Stops the browser from opening a file (and losing unsaved edits) when it is dropped
 * outside an upload area. Upload areas handle their own drops before this sees them.
 */
export default function DropGuard() {
  useEffect(() => {
    const files = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const over = (e: DragEvent) => { if (files(e)) { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = "none"; } };
    const drop = (e: DragEvent) => { if (files(e)) e.preventDefault(); };
    window.addEventListener("dragover", over);
    window.addEventListener("drop", drop);
    return () => { window.removeEventListener("dragover", over); window.removeEventListener("drop", drop); };
  }, []);
  return null;
}
