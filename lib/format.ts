export const money = (cur: string, n: number) => `${cur}${Math.round(n).toLocaleString("en-IN")}`;

/** Shipping charge for a bag total, from the shop settings ("" free-over = never free). */
export function shippingFor(subtotal: number, s: { shippingFee: string; freeShippingOver: string }): number {
  const fee = Number(s.shippingFee) || 0;
  const freeOver = s.freeShippingOver === "" ? Infinity : Number(s.freeShippingOver);
  return subtotal <= 0 || subtotal >= freeOver ? 0 : fee;
}
