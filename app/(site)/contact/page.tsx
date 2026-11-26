import { submitEnquiry } from "@/app/actions";
import { getSettings } from "@/lib/store";

export default async function Contact({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; product?: string }> }) {
  const { sent, error, product } = await searchParams;
  const s = await getSettings();
  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-2">
      <div>
        <h1 className="serif text-6xl italic">Get in touch</h1>
        <p className="mt-6 max-w-sm leading-relaxed opacity-75">Custom pieces, sizing help or a gift in mind? Send us a note and we will reply within a day.</p>
        <div className="mt-10 space-y-2 text-sm opacity-80"><p>{s.email}</p><p>{s.phone}</p><p>{s.address}</p><p>{s.instagram}</p></div>
      </div>
      {sent ? (
        <div className="grid place-items-center rounded-[2rem] bg-cream p-12 text-center">
          <div><p className="serif text-4xl italic">Thank you.</p><p className="mt-3 opacity-70">Your message is with us. We will be in touch soon.</p></div>
        </div>
      ) : (
        <form action={submitEnquiry} className="space-y-4 rounded-[2rem] bg-cream p-8">
          {error && <p className="text-sm text-burgundy">Please fill in name, email and message.</p>}
          <input name="name" placeholder="Your name" className="field" required />
          <input name="email" type="email" placeholder="Email" className="field" required />
          <input name="phone" placeholder="Phone (optional)" className="field" />
          <input name="product" defaultValue={product} placeholder="Piece you're asking about (optional)" className="field" />
          <textarea name="message" rows={5} placeholder="How can we help?" className="field" required />
          <button className="btn btn-dark w-full">Send message</button>
        </form>
      )}
    </div>
  );
}
