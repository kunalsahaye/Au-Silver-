import type { Product, SiteSettings } from "./types";

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
  img1: "", img2: "", img3: "", img4: "", img5: "", img6: "", img7: "", img8: "",
};

const d = "2026-01-01T00:00:00.000Z";
const p = (
  slug: string, name: string, category: Product["category"],
  price: number, description: string, finish: string,
  featured = false, bestseller = false,
): Product => ({
  id: slug, slug, name, category, metal: "silver", price, description,
  material: "925 Sterling Silver", finish,
  image_url: null, featured, bestseller, stock: 25, created_at: d,
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
