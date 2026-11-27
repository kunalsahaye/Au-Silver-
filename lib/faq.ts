/**
 * FAQ text format (Admin › Pages › FAQ):
 *   # Topic         starts a group (optional)
 *   ## Question     starts a question; the lines below it are the answer
 */
export interface FaqItem { q: string; a: string }
export interface FaqGroup { topic: string; items: FaqItem[] }

export function parseFaq(body: string): FaqGroup[] {
  const groups: FaqGroup[] = [];
  let cur: FaqGroup | null = null;
  let item: { q: string; a: string[] } | null = null;
  const close = () => { if (item && cur) cur.items.push({ q: item.q, a: item.a.join("\n").trim() }); item = null; };
  for (const line of body.replace(/\r/g, "").split("\n")) {
    if (/^# /.test(line)) { close(); cur = { topic: line.slice(2).trim(), items: [] }; groups.push(cur); }
    else if (line.startsWith("## ")) {
      close();
      if (!cur) { cur = { topic: "", items: [] }; groups.push(cur); }
      item = { q: line.slice(3).trim(), a: [] };
    } else if (item) (item as { a: string[] }).a.push(line);
  }
  close();
  return groups.filter((g) => g.items.length);
}

/** Answer as one plain line (for Google and the homepage). */
export const plainAnswer = (a: string) => a.split("\n").map((l) => l.replace(/^- /, "").trim()).filter(Boolean).join(" ");

export const oldDefaultFaq = "## Is your jewellery real silver?\nYes. Every piece is certified 925 sterling silver.\n\n## How do I care for my silver?\nStore it dry, away from perfume, and polish it with a soft cloth.\n\n## How long does delivery take?\nMost orders arrive in 3 to 7 working days.";

/** Starting questions, grouped by topic. The owner should read and adjust them in Admin › Pages › FAQ. */
export const defaultFaq = (s: { deliveryDays?: string; returnDays?: string }) => `# Orders
## How do I place an order?
Add the pieces you like to your bag and fill in your name, email and delivery address. We then contact you to confirm the order and arrange payment before anything is shipped.

## Can I change or cancel my order?
Yes, as long as it has not been shipped yet. Message us on WhatsApp or through the Contact page with your name and the piece you ordered.

## Do you make custom pieces or engraving?
For many pieces, yes. Send us a note through the Contact page with what you have in mind and we will tell you what is possible and the price.

# Shipping
## How long does delivery take?
Most orders arrive in ${s.deliveryDays || "3-7"} working days, anywhere in India. Big cities are usually quicker.

## How much is shipping?
Any delivery charge is shown in your bag before you order. When free shipping applies, the bag tells you how much more to add to get it.

## Will it come gift-ready?
Yes. Every piece is packed in a gift box with a care card, so you can give it straight away.

## How do I track my order?
Once your order is on its way we send you the tracking details by message or email.

# Returns
## Can I return or exchange a piece?
Yes, within ${s.returnDays || "7"} days of delivery. The piece should be unworn, in its original box and with the tag. Earrings cannot be returned for hygiene reasons unless they arrive damaged.

## How do refunds work?
Once we receive the piece, we refund you within 5 to 7 working days to the way you paid. See the Returns and exchanges page for the full details.

## The size is wrong. What can I do?
Message us within ${s.returnDays || "7"} days and we will exchange it for the right size if it is available. The Size guide page helps you measure before you order.

# Silver care
## Is your jewellery real silver?
Yes. Our pieces are 925 sterling silver, which means 92.5% pure silver mixed with a little copper for strength.

## Will my silver tarnish?
All real silver darkens a little over time when it meets air, sweat and perfume. It is natural and easy to clean, and wearing your silver often actually helps keep it bright.

## How do I keep it shining?
Put it on after perfume and lotion, take it off before swimming or showering, and keep it in its box or a zip bag. Wipe it with a soft cloth after wearing. A silver polishing cloth brings back the shine in seconds.

## Is it safe for sensitive skin?
925 sterling silver is a good choice for most sensitive skin. If you react to a particular metal, message us and we will tell you what a piece is made of.

# Payments
## How do I pay?
After you place your order we contact you to confirm it and share the payment details, such as UPI or bank transfer. We ship once the payment is received.

## Is cash on delivery available?
Message us before ordering and we will tell you if cash on delivery is possible for your address.

## Are your prices final?
Yes. Prices are in Indian rupees, and any delivery charge is shown in your bag before you order.`;
