"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Track() {
  const path = usePathname();
  useEffect(() => {
    if (path.startsWith("/admin")) return;
    fetch("/api/track", { method: "POST", body: JSON.stringify({ path }), keepalive: true }).catch(() => {});
  }, [path]);
  return null;
}
