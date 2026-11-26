import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "admin" | "client";
const isProd = process.env.NODE_ENV === "production";

/**
 * Logins come only from env vars. The demo logins (admin@demo.com / admin123, client@demo.com / client123)
 * exist only in local development (`npm run dev`) and never in a production build.
 */
function accounts(): [string, string, Role][] {
  const list: [string, string, Role][] = [];
  const { ADMIN_EMAIL, ADMIN_PASSWORD, CLIENT_EMAIL, CLIENT_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) list.push([ADMIN_EMAIL, ADMIN_PASSWORD, "admin"]);
  if (CLIENT_EMAIL && CLIENT_PASSWORD) list.push([CLIENT_EMAIL, CLIENT_PASSWORD, "client"]);
  if (!list.length && !isProd) {
    list.push(["admin@demo.com", "admin123", "admin"], ["client@demo.com", "client123", "client"]);
  }
  return list;
}
function secret(): string | null {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  return isProd ? null : "dev-only-secret-not-for-production";
}

/** What is missing before the portal can be used (empty when ready). */
export function authProblems(): string[] {
  const p: string[] = [];
  if (!secret()) p.push("SESSION_SECRET (at least 16 characters)");
  if (!accounts().length) p.push("ADMIN_EMAIL and ADMIN_PASSWORD");
  return p;
}
export const usingDemoLogins = () => !isProd && !process.env.ADMIN_PASSWORD && !process.env.CLIENT_PASSWORD;

const sign = (v: string, key: string) => crypto.createHmac("sha256", key).update(v).digest("hex");
const same = (a: string, b: string) => {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

export function checkLogin(email: string, password: string): Role | null {
  if (!secret()) return null;
  let found: Role | null = null;
  for (const [e, p, r] of accounts()) {
    const ok = same(email.trim().toLowerCase(), e.trim().toLowerCase()) && same(password, p);
    if (ok && !found) found = r;
  }
  return found;
}
export async function startSession(role: Role) {
  const key = secret();
  if (!key) return;
  const exp = Date.now() + 7 * 864e5;
  const val = `${role}.${exp}`;
  (await cookies()).set("session", `${val}.${sign(val, key)}`, {
    httpOnly: true, sameSite: "lax", secure: isProd, path: "/", maxAge: 7 * 86400,
  });
}
export async function endSession() { (await cookies()).delete("session"); }
export async function getRole(): Promise<Role | null> {
  const key = secret();
  const c = (await cookies()).get("session")?.value;
  if (!key || !c) return null;
  const [role, exp, sig] = c.split(".");
  if (role !== "admin" && role !== "client") return null;
  if (!exp || !sig || !same(sig, sign(`${role}.${exp}`, key)) || Date.now() > Number(exp)) return null;
  return role;
}
export async function requireRole(): Promise<Role> {
  const r = await getRole();
  if (!r) redirect("/admin/login");
  return r;
}
