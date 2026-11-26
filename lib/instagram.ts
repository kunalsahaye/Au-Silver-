import "server-only";
import { getInstagram, saveInstagram } from "./store";

/**
 * Instagram connection through the official Instagram API (Instagram Login).
 * The owner pastes a long-lived access token from their Meta app once (or sets INSTAGRAM_ACCESS_TOKEN);
 * it lasts 60 days and is renewed here automatically whenever it is more than 30 days old.
 */
const API = "https://graph.instagram.com";

export interface IgPost { id: string; caption: string; type: "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM"; media: string; thumb: string; link: string; date: string }

async function token(): Promise<string | null> {
  const saved = await getInstagram();
  if (!saved) return process.env.INSTAGRAM_ACCESS_TOKEN || null;
  if (Date.now() - new Date(saved.refreshed).getTime() > 30 * 864e5) {
    try {
      const r = await fetch(`${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(saved.token)}`, { cache: "no-store" });
      const j = await r.json();
      if (j.access_token) { await saveInstagram({ ...saved, token: j.access_token, refreshed: new Date().toISOString() }); return j.access_token; }
    } catch (e) { console.error("[instagram] refresh failed", (e as Error).message); }
  }
  return saved.token;
}

/** Checks a token and returns the account's username. */
export async function checkToken(t: string): Promise<string> {
  const r = await fetch(`${API}/me?fields=user_id,username&access_token=${encodeURIComponent(t)}`, { cache: "no-store" });
  const j = await r.json();
  if (!r.ok || !j.username) throw new Error(j.error?.message || "Instagram did not accept this key.");
  return j.username;
}

export async function instagramStatus(): Promise<{ connected: boolean; user: string; fromEnv: boolean }> {
  const saved = await getInstagram();
  return { connected: !!saved || !!process.env.INSTAGRAM_ACCESS_TOKEN, user: saved?.user ?? "", fromEnv: !saved && !!process.env.INSTAGRAM_ACCESS_TOKEN };
}

/** Latest posts (videos and reels first in the picker). */
export async function latestPosts(limit = 30): Promise<{ posts: IgPost[]; error?: string }> {
  const t = await token();
  if (!t) return { posts: [] };
  try {
    const r = await fetch(`${API}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}&access_token=${encodeURIComponent(t)}`, { cache: "no-store" });
    const j = await r.json();
    if (!r.ok) return { posts: [], error: j.error?.message || `Instagram error ${r.status}` };
    type Raw = { id: string; caption?: string; media_type: IgPost["type"]; media_url?: string; thumbnail_url?: string; permalink: string; timestamp: string };
    return {
      posts: (j.data as Raw[]).filter((x) => x.media_url).map((x) => ({
        id: x.id, caption: x.caption ?? "", type: x.media_type, media: x.media_url!, thumb: x.thumbnail_url || x.media_url!, link: x.permalink, date: x.timestamp,
      })),
    };
  } catch (e) { return { posts: [], error: (e as Error).message }; }
}

/** One post, fetched fresh so its media address has not expired. */
export async function getPost(id: string): Promise<IgPost | null> {
  const { posts } = await latestPosts(50);
  return posts.find((p) => p.id === id) ?? null;
}
