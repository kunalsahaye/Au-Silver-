"use client";
import { useActionState } from "react";
import { subscribe } from "@/app/actions";

/** Email sign-up box. Calls `onDone` once the email is saved (the popup uses it to show the code). */
export default function SignupForm({ source, button, placeholder, dark, onDone }: {
  source: string; button: string; placeholder: string; dark?: boolean; onDone?: () => void;
}) {
  const [state, act, pending] = useActionState(async (p: unknown, fd: FormData) => {
    const r = await subscribe(p, fd); if (r.ok) onDone?.(); return r;
  }, null);
  if (state?.ok) return <p className="text-sm">{state.msg}</p>;
  return (
    <form action={act} className="flex w-full max-w-md gap-2">
      <input type="hidden" name="source" value={source} />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input name="email" type="email" required placeholder={placeholder} aria-label={placeholder}
        className={`field flex-1 ${dark ? "!border-white/30 !bg-transparent !text-white placeholder:text-white/50" : ""}`} />
      <button disabled={pending} className={`btn shrink-0 ${dark ? "btn-light" : "btn-dark"} disabled:opacity-50`}>{button}</button>
      {state && !state.ok && <p className="sr-only" role="alert">{state.msg}</p>}
    </form>
  );
}
