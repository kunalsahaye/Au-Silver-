"use client";
import { createContext, useContext } from "react";

/** Shop-wide choices for product tiles (labels, low stock, quick add), set once in the site layout. */
export interface CardOpts {
  now: number; addToBag: string; added: string;
  badges: { on: boolean; newDays: number };
  lowStock: { on: boolean; threshold: number; text: string };
  quickAdd: boolean;
}
const off: CardOpts = { now: 0, addToBag: "Add to bag", added: "Added", badges: { on: false, newDays: 0 }, lowStock: { on: false, threshold: 0, text: "" }, quickAdd: false };
const Ctx = createContext<CardOpts>(off);
export const useCardOpts = () => useContext(Ctx);
export default function CardOptions({ value, children }: { value: CardOpts; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
