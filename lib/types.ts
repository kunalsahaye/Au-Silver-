export type Category = "rings" | "earrings" | "bracelets" | "necklaces";
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
  featured: boolean;
  bestseller: boolean;
  stock: number;
  created_at: string;
}

export interface SiteSettings {
  brand: string;
  tagline: string;
  announcement: string;
  heroTitle: string;
  heroSub: string;
  storyTitle: string;
  storyBody: string;
  aboutBody: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  currency: string;
  img1: string; img2: string; img3: string; img4: string;
  img5: string; img6: string; img7: string; img8: string;
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
