import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
export type Role = "admin" | "client";

const sign = (v: string) => crypto.createHmac("sha256", SECRET).update(v).digest("hex");

/** Two logins: you (admin) and the client. Credentials come from env vars per deployment. */
export function checkLogin(email: string, password: string): Role | null {
  const creds: [string, string, Role][] = [
    [process.env.ADMIN_EMAIL || "admin@demo.com", process.env.ADMIN_PASSWORD || "admin123", "admin"],
    [process.env.CLIENT_EMAIL || "client@demo.com", process.env.CLIENT_PASSWORD || "client123", "client"],
  ];
  for (const [e, p, r] of creds) {
    if (email.trim().toLowerCase() === e.toLowerCase() && password === p) return r;
  }
  return null;
}
export async function startSession(role: Role) {
  const exp = Date.now() + 7 * 864e5;
  const val = `${role}.${exp}`;
  (await cookies()).set("session", `${val}.${sign(val)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 7 * 86400,
  });
}
export async function endSession() { (await cookies()).delete("session"); }
export async function getRole(): Promise<Role | null> {
  const c = (await cookies()).get("session")?.value;
  if (!c) return null;
  const [role, exp, sig] = c.split(".");
  if (!role || !exp || sig !== sign(`${role}.${exp}`) || Date.now() > Number(exp)) return null;
  return role as Role;
}
export async function requireRole(): Promise<Role> {
  const r = await getRole();
  if (!r) redirect("/admin/login");
  return r;
}
