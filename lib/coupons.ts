import type { Coupon } from "./types";

export type CouponResult = { ok: true; code: string; discount: number; freeShipping: boolean; label: string } | { ok: false; error: string };

/** Checks a discount code against the shop's codes. `today` is YYYY-MM-DD. */
export function applyCoupon(list: Coupon[], raw: string, subtotal: number, cur = "", today = new Date().toISOString().slice(0, 10)): CouponResult {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code." };
  const c = list.find((x) => x.on && x.code.toUpperCase() === code);
  if (!c) return { ok: false, error: "That code isn't valid." };
  if (c.expires && c.expires < today) return { ok: false, error: "That code has expired." };
  if (c.minOrder > 0 && subtotal < c.minOrder) return { ok: false, error: `This code needs an order of at least ${cur}${c.minOrder.toLocaleString("en-IN")}.` };
  if (c.kind === "shipping") return { ok: true, code, discount: 0, freeShipping: true, label: "Free shipping" };
  const discount = Math.min(subtotal, Math.round(c.kind === "percent" ? (subtotal * Math.min(100, c.value)) / 100 : c.value));
  return { ok: true, code, discount, freeShipping: false, label: c.kind === "percent" ? `${c.value}% off` : `${cur}${c.value} off` };
}
