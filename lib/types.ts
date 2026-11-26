/** A category slug, e.g. "rings". The list itself is edited in the admin (Categories). */
export type Category = string;
export type Metal = "gold" | "silver" | "rose";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  metal: Metal;
  price: number;
  description: string;
  material: string;
  finish: string;
  image_url: string | null;
  /** Extra photos shown on the product page, after image_url. */
  images: string[];
  /** Search engine and accessibility details (all optional). */
  seo: ProductSeo;
  featured: boolean;
  bestseller: boolean;
  stock: number;
  created_at: string;
}

export interface ProductSeo { title?: string; description?: string; alt?: string; sku?: string }

export interface SiteSettings {
  brand: string;
  tagline: string;
  announcement: string;
  heroTitle: string;
  heroSub: string;
  storyTitle: string;
  storyBody: string;
  aboutBody: string;
  processTitle: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  currency: string;
  /** Shipping charge per order (number as text, "0" = free). */
  shippingFee: string;
  /** Orders at or above this total ship free (blank = never). */
  freeShippingOver: string;
  img1: string; img2: string; img3: string; img4: string;
  img5: string; img6: string; img7: string; img8: string;
  /** Small photo in the "process" section (blank = drawing). */
  img9: string;
  /** Shown for products without a photo (blank = drawing). */
  productPlaceholder: string;
  logo: string;
  /* ---- search engines and local business ---- */
  siteUrl: string;
  seoTitle: string;
  seoDescription: string;
  shareImage: string;
  googleVerification: string;
  bingVerification: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  latitude: string;
  longitude: string;
  openingHours: string;
  priceRange: string;
  whatsapp: string;
  facebook: string;
  youtube: string;
  pinterest: string;
  returnDays: string;
  deliveryDays: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  product_name: string | null;
  status: "new" | "contacted" | "closed";
  created_at: string;
}

export interface OrderItem { slug: string; name: string; price: number; qty: number }
export interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: "new" | "confirmed" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

export interface PageView { path: string; created_at: string }

/* ---------- editable site content (homepage, slides, customers, categories, pages) ---------- */
export type MediaKind = "image" | "video";
export interface Slide { id: string; media: string; kind: MediaKind; title: string; sub: string; cta: string; href: string }
export interface Customer { id: string; name: string; note: string; media: string; kind: MediaKind; rating: number }
export interface CategoryItem {
  slug: string; name: string; image: string; inMenu: boolean;
  /** Slug of the parent category ("" = top level). */
  parent: string;
  description: string; seoTitle: string; seoDescription: string;
}
export interface PageItem { slug: string; title: string; body: string; inMenu: boolean; seoTitle: string; seoDescription: string; image: string }
export type SectionKey = "slides" | "bestsellers" | "categories" | "story" | "more" | "customers" | "process";
export interface Section { key: SectionKey; on: boolean }

/** Everything the "Publish" button controls. */
export interface Content {
  site: SiteSettings;
  sections: Section[];
  slides: Slide[];
  customers: Customer[];
  categories: CategoryItem[];
  pages: PageItem[];
  /** Small words used around the shop (buttons, headings). Keys in lib/words.ts. */
  words: Record<string, string>;
}
