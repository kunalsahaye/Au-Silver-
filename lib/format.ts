export const money = (cur: string, n: number) => `${cur}${Math.round(n).toLocaleString("en-IN")}`;

/** Shipping charge for a bag total, from the shop settings ("" free-over = never free). */
export function shippingFor(subtotal: number, s: { shippingFee: string; freeShippingOver: string }): number {
  const fee = Number(s.shippingFee) || 0;
  const freeOver = s.freeShippingOver === "" ? Infinity : Number(s.freeShippingOver);
  return subtotal <= 0 || subtotal >= freeOver ? 0 : fee;
}

/** Short order number customers and the shop both see, e.g. AU-3F9A2C1B. */
export const orderRef = (id: string) => `AU-${id.replace(/[^a-z0-9]/gi, "").slice(0, 8).toUpperCase()}`;

/** Indian mobile number as 10 digits (drops +91, 0 and spaces), or "" if it isn't one. */
export function indianMobile(v: string): string {
  const d = v.replace(/[\s()-]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(d) ? d : "";
}
export const validPincode = (v: string) => /^[1-9]\d{5}$/.test(v.trim());
export const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
