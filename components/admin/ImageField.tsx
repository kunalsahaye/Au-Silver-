"use client";
import { useState } from "react";
import MediaField from "./MediaField";

/** Photo picker for ordinary forms: keeps the uploaded address in a hidden input named `name`. */
export default function ImageField({ name, label, defaultValue = "", hint, video }: {
  name: string; label: string; defaultValue?: string; hint?: string; video?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue);
  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <MediaField label={label} value={url} onChange={setUrl} hint={hint} video={video} />
    </div>
  );
}
