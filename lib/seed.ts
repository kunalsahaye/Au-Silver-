import type { CategoryItem, Content, Customer, HomeBlocks, PageItem, Plugins, Product, Section, SiteSettings, Slide, Theme } from "./types";

export const defaultSettings: SiteSettings = {
  brand: "Au Silver",
  tagline: "Pure 925 silver jewellery, made to be worn every day",
  announcement: "Free shipping on orders above ₹1,999 · Certified 925 silver · Skin-friendly",
  heroTitle: "Silver, made personal.",
  heroSub: "Considered designs in certified 925 sterling silver, finished by hand and made to be worn daily.",
  storyTitle: "Pure silver, honest craft.",
  storyBody:
    "Every Au Silver piece is shaped in small batches from certified 925 sterling silver and finished by skilled artisans. Clean lines, a lasting shine and a fair price, made to be layered, gifted and loved for years.",
  aboutBody:
    "Au Silver is built on a simple idea: real silver jewellery should be beautiful, honest and within reach. Every design is drawn with care and made in certified 925 sterling silver.\n\nOur pieces are cast in small batches and hand-finished, with a polish that lasts and a feel that is light enough to wear from morning to midnight.\n\nAu Silver is not just jewellery. It is silver, worn with intention.",
  processTitle: "We believe in our process",
  email: "hello@au-silver.example",
  phone: "+91 00000 00000",
  address: "Add your store address in the portal",
  instagram: "@ausilver.co.in",
  currency: "₹",
  shippingFee: "0",
  freeShippingOver: "",
  img1: "", img2: "", img3: "", img4: "", img5: "", img6: "", img7: "", img8: "", img9: "",
  productPlaceholder: "",
  logo: "",
  siteUrl: "",
  seoTitle: "",
  seoDescription: "",
  shareImage: "",
  googleVerification: "",
  bingVerification: "",
  city: "",
  region: "",
  postalCode: "",
  country: "IN",
  latitude: "",
  longitude: "",
  openingHours: "",
  mapsLink: "https://maps.app.goo.gl/LsS7K1DsxbbtgDEBA",
  mapEmbed: "",
  priceRange: "₹₹",
  whatsapp: "",
  facebook: "",
  youtube: "",
  pinterest: "",
  returnDays: "7",
  deliveryDays: "3-7",
};

const d = "2026-01-01T00:00:00.000Z";
const p = (
  slug: string, name: string, category: Product["category"],
  price: number, description: string, finish: string,
  featured = false, bestseller = false,
): Product => ({
  id: slug, slug, name, category, metal: "silver", price, description,
  material: "925 Sterling Silver", finish,
  image_url: null, images: [], seo: {}, featured, bestseller, stock: 25, created_at: d,
});

export const seedProducts: Product[] = [
  p("liquid-band-ring", "Liquid Band Ring", "rings", 2490, "A sculptural band with an organic silhouette, inspired by the motion of molten silver.", "High-gloss polish", true, true),
  p("solitaire-ring", "Solitaire Ring", "rings", 3490, "A timeless solitaire on a slim band. Quiet, confident and made to stack.", "Rhodium-sealed", true, true),
  p("twist-ring", "Twist Ring", "rings", 1790, "Two strands of silver wound together. Simple enough for every day.", "Satin gloss"),
  p("aura-drops", "Aura Drops", "earrings", 2400, "Featherlight drops that catch the light and frame the face.", "Mirror finish", true),
  p("everyday-hoops", "Everyday Hoops", "earrings", 1800, "Chunky rounded hoops, light enough to forget you are wearing them.", "Satin gloss", false, true),
  p("pearl-studs", "Pearl Studs", "earrings", 1590, "Freshwater pearl studs set in clean silver. The easiest everyday upgrade.", "Polished"),
  p("link-bracelet", "Link Bracelet", "bracelets", 2790, "Hand-linked chain with an adjustable clasp, made to layer or wear alone.", "High-gloss polish", true),
  p("cuff-bracelet", "Sculpted Cuff", "bracelets", 3190, "An open cuff with a sculpted profile that sits like wearable art.", "Mirror finish"),
  p("bar-bracelet", "Bar Bracelet", "bracelets", 1990, "A slim engraved bar on a fine chain. Easy to personalise.", "Brushed and polished", false, true),
  p("teardrop-necklace", "Teardrop Necklace", "necklaces", 3990, "A single pear-cut stone on a fine chain. Understated and endlessly giftable.", "Rhodium-plated", true, true),
  p("fluid-pendant", "Fluid Pendant", "necklaces", 2890, "A liquid-metal pendant that moves with you. Wear it long or short.", "Mirror finish"),
  p("coin-chain", "Coin Chain", "necklaces", 2490, "A classic coin pendant on a sturdy silver chain.", "Polished"),
];

/* ---------- default editable content (used until the owner edits it) ---------- */
export const defaultSections: Section[] = (
  [["slides", true], ["categories", true], ["newArrivals", true], ["bestsellers", true], ["collection", false], ["story", true],
   ["reels", true], ["reviews", true], ["customers", true], ["gifts", true], ["more", true], ["promo", false], ["badges", true],
   ["process", true], ["faq", true], ["newsletter", false], ["visit", true]] as const
).map(([key, on]) => ({ key, on }));
export const sectionNames: Record<Section["key"], string> = {
  slides: "Slides at the top", bestsellers: "Bestsellers row", categories: "Shop by category",
  story: "Our story (dark section with photos)", more: "Second product row", customers: "Happy customers",
  process: "Our process (photo and About text)", reels: "Reels (vertical videos, e.g. from Instagram)",
  reviews: "Testimonials and reviews", newArrivals: "New arrivals row",
  gifts: "Gift guide (gifts by price)", badges: "Why choose us (trust badges)",
  promo: "Offer banner (big photo, headline, button)", collection: "Featured collection (one category's pieces)",
  faq: "Questions and answers (from your FAQ page)", newsletter: "Email sign-up band", visit: "Visit us (address and map)",
};
export const defaultTheme: Theme = {
  background: "#ffffff", text: "#24140b", soft: "#f4f2ee", soft2: "#eeeae5", dark: "#2a170d", accent: "#24140b", gold: "#b9894f", bar: "#24140b",
  headingFont: "Inter", bodyFont: "Inter", headingWeight: "bold", corners: "square",
};
const tile = (id: string, title: string, text: string, href: string) => ({ id, title, text, image: "", href });
export const defaultHome: HomeBlocks = {
  giftsTitle: "Gift guide",
  gifts: [
    tile("u999", "Under ₹999", "", "/shop?max=999"), tile("u1999", "Under ₹1,999", "", "/shop?max=1999"),
    tile("u2999", "Under ₹2,999", "", "/shop?max=2999"), tile("luxe", "Luxe gifts", "₹3,000 and above", "/shop?min=3000"),
  ],
  badgesTitle: "Why Au Silver",
  badges: [
    { id: "925", icon: "925", title: "Certified 925 silver", text: "Every piece is solid sterling silver." },
    { id: "skin", icon: "✿", title: "Skin-friendly", text: "Made for everyday wear on sensitive skin." },
    { id: "ship", icon: "⇢", title: "Free shipping over ₹1,999", text: "Delivered across India in 3 to 7 days." },
    { id: "returns", icon: "↺", title: "Easy returns", text: "Not right? Send it back within 7 days." },
  ],
  promo: { image: "", eyebrow: "Limited time", title: "The festive edit", text: "Our new pieces for the season, in solid 925 silver.", cta: "Shop the edit", href: "/shop?sort=new" },
  collection: { category: "rings", title: "" },
  faqTitle: "Questions, answered", newsletterTitle: "Be first to see new pieces", newsletterText: "Offers and silver care tips, a few times a month.",
  visitTitle: "Visit us", visitText: "", showMap: true,
};
export const defaultPlugins: Plugins = {
  popup: { on: false, title: "Get 10% off your first order", text: "Join our list for new pieces and silver care tips.", image: "", coupon: "WELCOME10", button: "Shop now", href: "/shop", email: true, delay: 8, exit: true, days: 7 },
  newsletter: { on: true, title: "Join the Au Silver list", text: "New pieces, offers and care tips. No spam." },
  coupons: { on: false },
  upsell: { on: true, productTitle: "Complete the look", cartTitle: "You might also love" },
  shipBar: { on: true },
  whatsapp: { on: false, number: "", text: "Hi! I have a question about a piece on your website." },
  recent: { on: true, title: "Recently viewed" },
  stickyBuy: { on: true },
};
export const defaultSlides: Slide[] = [];
export const defaultCustomers: Customer[] = [];
export const defaultCategories: CategoryItem[] = [
  cat("rings", "Rings", true, "Sterling silver rings: bands, solitaires and stackables in certified 925 silver."),
  cat("earrings", "Earrings", true, "Silver hoops, studs and drops, light enough to wear every day."),
  cat("bracelets", "Bracelets", true, "Chains, cuffs and bar bracelets in 925 sterling silver."),
  cat("necklaces", "Necklaces", false, "Pendants and chains in certified 925 sterling silver."),
];
function cat(slug: string, name: string, inMenu: boolean, description: string): CategoryItem {
  return { slug, name, image: "", inMenu, parent: "", description, seoTitle: "", seoDescription: "" };
}
const page = (slug: string, title: string, body: string): PageItem => ({ slug, title, body, inMenu: false, seoTitle: "", seoDescription: "", image: "" });
/** Help and policy pages every shop needs. Plain starting text: the owner should read and adjust them in Admin › Pages. */
export const helpPages = (s: Pick<SiteSettings, "deliveryDays" | "returnDays" | "brand">): PageItem[] => [
  page("shipping", "Shipping and delivery", `We ship across India. Most orders arrive in ${s.deliveryDays || "3-7"} working days.

## How it is packed
Every piece is packed in a gift box with a care card, ready to give.

## Tracking
Once your order is on its way we send you the tracking details by message or email.

## Delivery charges
Any delivery charge is shown in your bag before you place the order.`),
  page("returns", "Returns and exchanges", `Not quite right? You can return or exchange a piece within ${s.returnDays || "7"} days of delivery.

## How to return
Message us with your order number. We will arrange the pickup or tell you where to send it.

## Condition
Pieces must be unworn, in their original box and with the tag. Earrings cannot be returned for hygiene reasons, unless they arrive damaged.

## Refunds
Once we receive the piece we refund you within 5 to 7 working days, to the way you paid.`),
  page("size-guide", "Size guide", `## Rings (Indian sizes)
Wrap a strip of paper around the base of your finger, mark where it meets and measure the length in millimetres. Or measure the inside of a ring that fits you.

- Size 8: 15.9 mm across, 50 mm around
- Size 10: 16.5 mm across, 52 mm around
- Size 12: 17.2 mm across, 54 mm around
- Size 14: 17.8 mm across, 56 mm around
- Size 16: 18.5 mm across, 58 mm around
- Size 18: 19.1 mm across, 60 mm around
- Size 20: 19.7 mm across, 62 mm around

Between two sizes? Choose the larger one. Many of our rings can be adjusted; just ask.

## Bracelets
Measure around your wrist and add 1 to 2 cm for a comfortable fit.

## Necklaces
- 16 inches: sits at the base of the neck
- 18 inches: rests on the collarbone, the most popular length
- 20 to 22 inches: falls just below the collarbone
- 24 inches and longer: for layering`),
  page("care", "Jewellery care", `Sterling silver darkens a little over time when it meets air and moisture. A few habits keep it bright.

## Every day
- Put your jewellery on last, after perfume, lotion and hairspray
- Take it off before swimming, bathing, the gym or cleaning
- Wipe it with a soft dry cloth after wearing

## Storing
Keep each piece in its pouch or box, away from damp. An airtight zip bag slows tarnish.

## Cleaning
Polish gently with a silver polishing cloth. For deeper cleaning use mild soap in warm water, rinse and dry fully. Avoid harsh chemicals and toothpaste.`),
  page("privacy", "Privacy policy", `This page explains what we collect when you use the ${s.brand} website and why.

## What we collect
When you place an order, send an enquiry, write a review or join our list, we keep the details you give us: your name, email, phone, address and message.

## Why
Only to deliver your order, answer you, and, if you joined our list, send you news and offers. You can unsubscribe at any time.

## Sharing
We share your address and phone only with our delivery partner, and never sell your details.

## Your choices
Write to us to see, correct or delete the details we hold about you.`),
  page("terms", "Terms and conditions", `By ordering from ${s.brand} you agree to these terms.

## Products
Every piece is 925 sterling silver. Handmade pieces can vary slightly, and colours can look a little different on screens.

## Prices and orders
Prices are in Indian rupees. We confirm every order and payment with you before it is shipped. If a piece is no longer available we tell you and refund any payment.

## Delivery, returns and refunds
See our Shipping and delivery and Returns and exchanges pages.

## Contact
Questions about these terms? Get in touch through our Contact page.`),
];

export const defaultPages = (aboutBody: string): PageItem[] => [
  { slug: "about", title: "About us", body: aboutBody, inMenu: true, seoTitle: "", seoDescription: "", image: "" },
  { slug: "contact", title: "Contact", body: "Custom pieces, sizing help or a gift in mind? Send us a note and we will reply within a day.", inMenu: true, seoTitle: "", seoDescription: "", image: "" },
  {
    slug: "faq", title: "FAQ", inMenu: false, seoTitle: "", seoDescription: "", image: "",
    body: "## Is your jewellery real silver?\nYes. Every piece is certified 925 sterling silver.\n\n## How do I care for my silver?\nStore it dry, away from perfume, and polish it with a soft cloth.\n\n## How long does delivery take?\nMost orders arrive in 3 to 7 working days.",
  },
  ...helpPages(defaultSettings),
];
export const defaultContent = (site: SiteSettings = defaultSettings): Content => ({
  site, sections: defaultSections, slides: defaultSlides, customers: defaultCustomers,
  categories: defaultCategories, pages: defaultPages(site.aboutBody), words: {},
  theme: defaultTheme, reels: [], home: defaultHome, reviews: [], coupons: [], plugins: defaultPlugins,
});
