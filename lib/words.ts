/** Every small piece of text on the shop, with its default. Edited in Admin > Words on the site. */
export const WORDS = {
  shopNow: ["Shop now", "Homepage: “Shop now” links"],
  bestsellersEyebrow: ["Bestsellers", "Homepage: small label above the first product row"],
  categoriesTitle: ["Shop by category", "Homepage: category section heading"],
  featuredTitle: ["Featured", "Homepage: second product row heading"],
  customersEyebrow: ["Loved by you", "Homepage: small label above Happy customers"],
  customersTitle: ["Happy customers", "Homepage: Happy customers heading"],
  aboutLink: ["About us →", "Homepage: link to the About page"],
  exploreCollection: ["Explore the collection", "About: button at the bottom"],
  shopAllTitle: ["All jewellery", "Shop: heading when no category is chosen"],
  pieces: ["pieces", "Shop: word after the number of products"],
  emptyList: ["Nothing here yet.", "Shop: text when no products match"],
  searchPlaceholder: ["Search jewellery", "Shop: search box"],
  inStockOnly: ["In stock only", "Shop: filter"],
  addToBag: ["Add to bag", "Product: add button"],
  addedToBag: ["Added to bag ✓", "Product: after adding"],
  soldOut: ["Sold out", "Product: when out of stock"],
  enquire: ["Enquire about this piece", "Product: enquiry button"],
  relatedTitle: ["You may also like", "Product: related products heading"],
  contactTitle: ["Get in touch", "Contact: page heading"],
  contactButton: ["Send message", "Contact: form button"],
  contactThanksTitle: ["Thank you.", "Contact: heading after sending"],
  contactThanks: ["Your message is with us. We will be in touch soon.", "Contact: text after sending"],
  bagTitle: ["Your bag", "Bag: page heading"],
  bagEmpty: ["Your bag is empty.", "Bag: text when empty"],
  placeOrder: ["Place order", "Bag: order button"],
  orderNote: ["We will contact you to confirm and arrange payment.", "Bag: note under the order button"],
  orderPlacedTitle: ["Order received", "Bag: heading after ordering"],
  orderPlaced: ["Thank you. We will confirm your order and payment details shortly.", "Bag: text after ordering"],
  keepShopping: ["Keep shopping", "Bag: button after ordering"],
  footerShop: ["Shop", "Footer: first column heading"],
  footerHelp: ["Help", "Footer: second column heading"],
  footerContact: ["Get in touch", "Footer: third column heading"],
} as const satisfies Record<string, readonly [string, string]>;

export type WordKey = keyof typeof WORDS;
export type Words = Record<WordKey, string>;

/** Saved words with defaults filled in. */
export function words(saved: Record<string, string> | undefined): Words {
  const out = {} as Words;
  for (const k of Object.keys(WORDS) as WordKey[]) out[k] = saved?.[k]?.trim() ? saved[k] : WORDS[k][0];
  return out;
}
