export const money = (cur: string, n: number) => `${cur}${Math.round(n).toLocaleString("en-IN")}`;
export const cats = ["rings", "earrings", "bracelets", "necklaces"] as const;
