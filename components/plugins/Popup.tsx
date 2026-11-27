"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SignupForm from "./SignupForm";
import type { Plugins } from "@/lib/types";

const KEY = "popup-seen";

/** Offer popup: opens after a delay or when the mouse leaves the page, then stays away for a few days. */
export default function Popup({ p, button, placeholder }: { p: Plugins["popup"]; button: string; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState(!p.email);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (location.pathname.startsWith("/cart")) return;
    try { const t = Number(localStorage.getItem(KEY)); if (t && Date.now() - t < p.days * 864e5) return; } catch {}
    const show = () => { setOpen(true); try { localStorage.setItem(KEY, String(Date.now())); } catch {} cleanup(); };
    const timer = setTimeout(show, Math.max(0, p.delay) * 1000);
    const out = (e: MouseEvent) => { if (p.exit && e.clientY <= 0) show(); };
    document.addEventListener("mouseout", out);
    function cleanup() { clearTimeout(timer); document.removeEventListener("mouseout", out); }
    return cleanup;
  }, [p.days, p.delay, p.exit]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={p.title} onClick={() => setOpen(false)}>
      <div className="relative grid w-full max-w-2xl overflow-hidden rounded-box bg-ivory md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt="" className="hidden h-full w-full object-cover md:block" />
        )}
        <div className={`p-8 ${p.image ? "" : "md:col-span-2 text-center"}`}>
          <button onClick={() => setOpen(false)} aria-label="Close" className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-black/5 text-lg">×</button>
          <h2 className="text-3xl tracking-[-0.03em]">{p.title}</h2>
          {p.text && <p className="mt-3 text-sm opacity-75">{p.text}</p>}
          <div className={`mt-6 ${p.image ? "" : "flex flex-col items-center"}`}>
            {!joined ? (
              <SignupForm source="popup" button={button} placeholder={placeholder} onDone={() => setJoined(true)} />
            ) : (
              <>
                {p.coupon && (
                  <button type="button" onClick={() => { navigator.clipboard?.writeText(p.coupon); setCopied(true); }}
                    className="rounded-box border-2 border-dashed border-ink/40 px-6 py-3 text-xl font-bold tracking-widest">
                    {p.coupon} <span className="ml-2 align-middle text-[10px] font-normal tracking-normal opacity-60">{copied ? "Copied" : "Tap to copy"}</span>
                  </button>
                )}
                {p.button && <div className="mt-4"><Link href={p.href || "/shop"} onClick={() => setOpen(false)} className="btn btn-dark">{p.button}</Link></div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
