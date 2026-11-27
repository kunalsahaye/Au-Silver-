import "server-only";
import { draftMode } from "next/headers";
import { getRole } from "./auth";
import { getContent, getDraft } from "./store";
import type { Content } from "./types";

/** Template sample values that should never show to customers. */
const PLACEHOLDER = /\.example$|example\.|0{5}|^Add your/i;
const clean = (c: Content): Content => {
  const s = { ...c.site };
  for (const k of ["email", "phone", "address", "whatsapp"] as const) if (PLACEHOLDER.test(s[k] ?? "")) s[k] = "";
  return { ...c, site: s };
};

/** Content for the shop pages: the draft while a signed-in owner is previewing, otherwise what is published. */
export async function siteContent(): Promise<Content & { preview: boolean }> {
  if ((await draftMode()).isEnabled && (await getRole())) {
    return { ...clean((await getDraft()).content), preview: true };
  }
  return { ...clean(await getContent()), preview: false };
}
