"use client";
import { useEffect, useRef } from "react";

/** Submits the surrounding form as soon as a dropdown or tick box changes. */
export default function SubmitOnChange() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const go = (e: Event) => { const t = e.target as HTMLInputElement; if (t.tagName === "SELECT" || t.type === "checkbox") form.requestSubmit(); };
    form.addEventListener("change", go);
    return () => form.removeEventListener("change", go);
  }, []);
  return <span ref={ref} hidden />;
}
