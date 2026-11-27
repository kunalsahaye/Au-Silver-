import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-28 md:py-40">
      <p className="mb-4 text-[10px] tracking-[0.22em] uppercase opacity-50">Page not found</p>
      <h1 className="max-w-2xl text-5xl leading-[1] tracking-[-0.045em] md:text-7xl">This page has slipped off the chain.</h1>
      <p className="mt-6 max-w-md text-sm opacity-65">The link may be old or mistyped. Everything we make is still here.</p>
      <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-[12px] tracking-[0.12em] uppercase">
        <Link href="/shop" className="border-b border-ink pb-1">All jewellery →</Link>
        <Link href="/" className="border-b border-ink/40 pb-1 opacity-70">Home</Link>
        <Link href="/contact" className="border-b border-ink/40 pb-1 opacity-70">Contact us</Link>
      </div>
    </div>
  );
}
