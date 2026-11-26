import { submitEnquiry } from "@/app/actions";
import RichText from "@/components/RichText";
import { siteContent } from "@/lib/site";
import { meta, pageDescription, pageTitle } from "@/lib/seo";
import { words } from "@/lib/words";

export async function generateMetadata() {
  const c = await siteContent();
  const page = c.pages.find((p) => p.slug === "contact");
  const s = c.site;
  return meta(s, {
    title: page ? pageTitle(page) : "Contact", path: "/contact", image: page?.image,
    description: (page && pageDescription(page).trim()) || `Contact ${s.brand}${s.city ? ` in ${s.city}` : ""}. ${[s.phone, s.email].filter(Boolean).join(" · ")}`,
  });
}

export default async function Contact({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string; product?: string }> }) {
  const { sent, error, product } = await searchParams;
  const c = await siteContent();
  const s = c.site, w = words(c.words);
  const page = c.pages.find((p) => p.slug === "contact");
  const wa = s.whatsapp.replace(/\D/g, "");
  const place = [s.address, s.city, s.region, s.postalCode].filter(Boolean).join(", ");
  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:grid-cols-2">
      <div>
        <h1 className="serif text-6xl italic">{page?.title && page.title !== "Contact" ? page.title : w.contactTitle}</h1>
        <div className="mt-6 max-w-sm opacity-75"><RichText text={page?.body ?? ""} /></div>
        <address className="mt-10 space-y-2 text-sm not-italic opacity-80">
          {s.email && <p><a href={`mailto:${s.email}`}>{s.email}</a></p>}
          {s.phone && <p><a href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a></p>}
          {wa && <p><a href={`https://wa.me/${wa}`} target="_blank" rel="noopener">WhatsApp</a></p>}
          {place && <p>{place}</p>}
          {s.openingHours && <p>{s.openingHours}</p>}
          {s.instagram && <p>{s.instagram}</p>}
        </address>
      </div>
      {sent ? (
        <div className="grid place-items-center rounded-[2rem] bg-cream p-12 text-center">
          <div><p className="serif text-4xl italic">{w.contactThanksTitle}</p><p className="mt-3 opacity-70">{w.contactThanks}</p></div>
        </div>
      ) : (
        <form action={submitEnquiry} className="space-y-4 rounded-[2rem] bg-cream p-8">
          {error && <p className="text-sm text-burgundy">Please fill in name, email and message.</p>}
          <input name="name" placeholder="Your name" aria-label="Your name" className="field" required />
          <input name="email" type="email" placeholder="Email" aria-label="Email" className="field" required />
          <input name="phone" placeholder="Phone (optional)" aria-label="Phone" className="field" />
          <input name="product" defaultValue={product} placeholder="Piece you're asking about (optional)" aria-label="Piece" className="field" />
          <textarea name="message" rows={5} placeholder="How can we help?" aria-label="Message" className="field" required />
          <button className="btn btn-dark w-full">{w.contactButton}</button>
        </form>
      )}
    </div>
  );
}
