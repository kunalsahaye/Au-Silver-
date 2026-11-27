/** Floating WhatsApp chat button. */
export default function WhatsApp({ number, text }: { number: string; text: string }) {
  const n = number.replace(/\D/g, "");
  if (!n) return null;
  return (
    <a href={`https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`} target="_blank" rel="noopener" aria-label="Chat on WhatsApp"
      className="fixed right-4 bottom-24 z-40 grid h-12 w-12 md:h-14 md:w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg md:bottom-6">
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.9 5.2 2.2.9 3 1 4.1.8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5l-.5-.4Z"/></svg>
    </a>
  );
}
