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
  instagram: "@aussilver",
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
   ["process", true], ["faq", true], ["newsletter", false], ["visit", false]] as const
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
export const defaultPages = (aboutBody: string): PageItem[] => [
  { slug: "about", title: "About us", body: aboutBody, inMenu: true, seoTitle: "", seoDescription: "", image: "" },
  { slug: "contact", title: "Contact", body: "Custom pieces, sizing help or a gift in mind? Send us a note and we will reply within a day.", inMenu: true, seoTitle: "", seoDescription: "", image: "" },
  {
    slug: "faq", title: "FAQ", inMenu: false, seoTitle: "", seoDescription: "", image: "",
    body: "## Is your jewellery real silver?\nYes. Every piece is certified 925 sterling silver.\n\n## How do I care for my silver?\nStore it dry, away from perfume, and polish it with a soft cloth.\n\n## How long does delivery take?\nMost orders arrive in 3 to 7 working days.",
  },
];
export const defaultContent = (site: SiteSettings = defaultSettings): Content => ({
  site, sections: defaultSections, slides: defaultSlides, customers: defaultCustomers,
  categories: defaultCategories, pages: defaultPages(site.aboutBody), words: {},
  theme: defaultTheme, reels: [], home: defaultHome, reviews: [], coupons: [], plugins: defaultPlugins,
});
