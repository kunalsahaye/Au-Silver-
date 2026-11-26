import "server-only";
import { draftMode } from "next/headers";
import { getRole } from "./auth";
import { getContent, getDraft } from "./store";
import type { Content } from "./types";

/** Content for the shop pages: the draft while a signed-in owner is previewing, otherwise what is published. */
export async function siteContent(): Promise<Content & { preview: boolean }> {
  if ((await draftMode()).isEnabled && (await getRole())) {
    return { ...(await getDraft()).content, preview: true };
  }
  return { ...(await getContent()), preview: false };
}
