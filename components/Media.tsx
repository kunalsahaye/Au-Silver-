import Photo from "./Photo";

/** A photo or a silent looping video, filling its box. Falls back to the soft placeholder. */
export default function Media({ src, kind, className = "", tone = "warm", alt = "" }: {
  src: string; kind?: "image" | "video"; className?: string; tone?: "light" | "dark" | "wine" | "warm"; alt?: string;
}) {
  const video = kind === "video" || /\.(mp4|mov|webm)(\?|$)/i.test(src);
  if (src && video) return <video src={src} autoPlay muted loop playsInline className={`object-cover ${className}`} />;
  return <Photo src={src} alt={alt} tone={tone} className={className} />;
}
