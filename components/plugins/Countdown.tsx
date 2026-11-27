"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Thin offer bar that counts down to `ends` (a date and time in India time) and disappears afterwards. */
export default function Countdown({ text, ends, href }: { text: string; ends: string; href: string }) {
  const end = new Date(`${ends}:00+05:30`).getTime();
  const [now, setNow] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now || !Number.isFinite(end) || end <= now) return null;
  const s = Math.floor((end - now) / 1000);
  const parts: [number, string][] = [[Math.floor(s / 86400), "d"], [Math.floor(s / 3600) % 24, "h"], [Math.floor(s / 60) % 60, "m"], [s % 60, "s"]];
  const body = (
    <>
      <span>{text}</span>
      <span className="flex gap-1.5 tabular-nums" aria-label="time left">
        {parts.filter(([n, u], i) => i > 0 || n > 0 || u !== "d").map(([n, u]) => <span key={u} className="min-w-[2.6em] bg-white/10 px-1.5 py-0.5 text-center">{String(n).padStart(2, "0")}{u}</span>)}
      </span>
    </>
  );
  const cls = "flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-ink px-4 py-2 text-[10px] tracking-[0.14em] text-ivory uppercase";
  return href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}
