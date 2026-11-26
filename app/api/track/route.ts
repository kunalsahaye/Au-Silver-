import { trackView } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { path } = await req.json();
    if (typeof path === "string" && path.length < 200) await trackView(path);
  } catch {}
  return new Response(null, { status: 204 });
}
