"use client";
import { useActionState, useState } from "react";
import { submitReview } from "@/app/actions";

/** "Write a review" on a product page. Reviews wait for the shop's approval before they show. */
export default function ReviewForm({ product }: { product: string }) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [state, act, pending] = useActionState(submitReview, null);
  if (state?.ok) return <p className="py-4 text-sm">{state.msg}</p>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="btn btn-line">Write a review</button>;
  return (
    <form action={act} className="max-w-xl space-y-3">
      <input type="hidden" name="product" value={product} />
      <input type="hidden" name="rating" value={stars} />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={n === stars} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setStars(n)}
            className={`text-2xl leading-none ${n <= stars ? "text-gold" : "opacity-20"}`}>★</button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" aria-label="Your name" className="field" />
        <input name="place" placeholder="City (optional)" aria-label="City" className="field" />
      </div>
      <textarea name="text" required minLength={10} rows={4} placeholder="How do you like it?" aria-label="Your review" className="field" />
      {state && !state.ok && <p className="text-sm text-burgundy">{state.msg}</p>}
      <button disabled={pending} className="btn btn-dark disabled:opacity-50">Send review</button>
    </form>
  );
}
