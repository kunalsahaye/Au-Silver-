import Link from "next/link";
import { savePlugins } from "../../content-actions";
import EditorForm from "@/components/admin/EditorForm";
import ImageField from "@/components/admin/ImageField";
import ListEditor from "@/components/admin/ListEditor";
import { getDraft, getSubscribers } from "@/lib/store";

type Q = { searchParams: Promise<Record<string, string | undefined>> };

function Plugin({ id, on, icon, title, text, children }: { id: string; on: boolean; icon: string; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="flex items-center gap-4 p-5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f4efe9] text-xl">{icon}</span>
        <span className="flex-1"><span className="block font-medium">{title}</span><span className="block text-xs opacity-60">{text}</span></span>
        <label className="flex cursor-pointer items-center p-2">
          <input type="checkbox" name={`${id}.on`} defaultChecked={on} className="peer sr-only" />
          <span className="relative h-8 w-14 rounded-full bg-black/15 transition peer-checked:bg-green-600 peer-focus-visible:ring-2 after:absolute after:top-1 after:left-1 after:h-6 after:w-6 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-6" />
          <span className="sr-only">Switch {title} on</span>
        </label>
      </div>
      {children && (
        <details className="border-t border-black/5" open={on}>
          <summary className="cursor-pointer px-5 py-3 text-sm opacity-70">Settings</summary>
          <div className="space-y-4 px-5 pb-5">{children}</div>
        </details>
      )}
    </div>
  );
}
const T = ({ name, label, value, hint, type = "text" }: { name: string; label: string; value: string | number; hint?: string; type?: string }) => (
  <label className="block text-sm"><span className="mb-1 block opacity-60">{label}</span><input name={name} type={type} defaultValue={value} className="field" />{hint && <span className="mt-1 block text-xs opacity-50">{hint}</span>}</label>
);
const C = ({ name, label, on }: { name: string; label: string; on: boolean }) => (
  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={name} defaultChecked={on} className="h-5 w-5" />{label}</label>
);

export default async function Plugins({ searchParams }: Q) {
  const q = await searchParams;
  const [{ content: c }, subs] = await Promise.all([getDraft(), getSubscribers()]);
  const p = c.plugins;
  return (
    <div className="space-y-8">
      <EditorForm title="Plugins" q={q} action={savePlugins}
        intro="Extra tools for selling more, like the apps on a Shopify store. Switch each one on or off and set it up, then Save draft and Publish.">
        <Plugin id="popup" on={p.popup.on} icon="✉" title="Welcome popup" text="An offer that pops up after a few seconds or when someone is about to leave">
          <T name="popup.title" label="Heading" value={p.popup.title} />
          <T name="popup.text" label="Text" value={p.popup.text} />
          <ImageField name="popup.image" label="Picture (optional)" defaultValue={p.popup.image} />
          <div className="grid gap-4 sm:grid-cols-2">
            <T name="popup.coupon" label="Discount code to show" value={p.popup.coupon} hint="Add the same code under Discount codes below so it works in the bag." />
            <T name="popup.delay" label="Show after (seconds)" value={p.popup.delay} type="number" />
            <T name="popup.button" label="Button text" value={p.popup.button} />
            <T name="popup.href" label="Button goes to" value={p.popup.href} />
            <T name="popup.days" label="Don't show again for (days)" value={p.popup.days} type="number" />
          </div>
          <C name="popup.email" label="Ask for an email before showing the code (adds them to Email sign-ups)" on={p.popup.email} />
          <C name="popup.exit" label="Also show when the mouse leaves the page (computers only)" on={p.popup.exit} />
        </Plugin>

        <Plugin id="newsletter" on={p.newsletter.on} icon="✦" title="Email sign-up in the footer" text="Collect emails for offers and new pieces">
          <T name="newsletter.title" label="Heading" value={p.newsletter.title} />
          <T name="newsletter.text" label="Text" value={p.newsletter.text} />
          <p className="text-sm"><Link href="/admin/subscribers" className="underline">See {subs.length} email sign-up{subs.length === 1 ? "" : "s"} →</Link></p>
        </Plugin>

        <Plugin id="coupons" on={p.coupons.on} icon="%" title="Discount codes" text="Codes customers type in the bag: percent off, amount off or free shipping">
          <ListEditor name="coupons" titleKey="code" addLabel="Add a code" empty="No codes yet."
            items={c.coupons.map((x) => ({ ...x }))}
            blank={{ code: "", kind: "percent", value: 10, minOrder: 0, expires: "", on: true }}
            fields={[
              { key: "code", label: "Code", type: "text", half: true, placeholder: "e.g. WELCOME10" },
              { key: "kind", label: "Type", type: "select", half: true, options: [["percent", "Percent off"], ["amount", "Amount off (₹)"], ["shipping", "Free shipping"]] },
              { key: "value", label: "How much (ignored for free shipping)", type: "number", half: true },
              { key: "minOrder", label: "Minimum order (₹, 0 = none)", type: "number", half: true },
              { key: "expires", label: "Last day (optional)", type: "date", half: true },
              { key: "on", label: "Active", type: "check", half: true },
            ]} />
        </Plugin>

        <Plugin id="upsell" on={p.upsell.on} icon="↗" title="Upsell and cross-sell" text="“Complete the look” on product pages and quick-add suggestions in the bag">
          <div className="grid gap-4 sm:grid-cols-2">
            <T name="upsell.productTitle" label="Heading on product pages" value={p.upsell.productTitle} />
            <T name="upsell.cartTitle" label="Heading in the bag" value={p.upsell.cartTitle} />
          </div>
          <p className="text-xs opacity-60">Bestsellers and featured pieces from other categories are suggested first. Mark products as Bestseller or Featured to steer it.</p>
        </Plugin>

        <Plugin id="shipBar" on={p.shipBar.on} icon="🚚" title="Free-shipping progress bar" text="Shows in the bag how much more to spend for free shipping (amount set in Shop settings)" />
        <Plugin id="whatsapp" on={p.whatsapp.on} icon="💬" title="WhatsApp chat button" text="A green button in the corner that opens a WhatsApp chat with you">
          <div className="grid gap-4 sm:grid-cols-2">
            <T name="whatsapp.number" label="WhatsApp number with country code" value={p.whatsapp.number} hint="e.g. 919812345678. Leave empty to use the one in Shop settings." />
            <T name="whatsapp.text" label="Message it starts with" value={p.whatsapp.text} />
          </div>
        </Plugin>
        <Plugin id="recent" on={p.recent.on} icon="⟲" title="Recently viewed" text="Shows shoppers the pieces they looked at earlier, on product pages">
          <T name="recent.title" label="Heading" value={p.recent.title} />
        </Plugin>
        <Plugin id="stickyBuy" on={p.stickyBuy.on} icon="▁" title="Sticky “Add to bag” on phones" text="Keeps the price and Add to bag button at the bottom of the screen on product pages" />
      </EditorForm>

      <section className="max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <p className="font-medium">Coming next</p>
        <p className="mt-1 text-sm opacity-60">Popular Shopify apps that can be added next, roughly in order of how much they help sales:</p>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {["Product reviews with photos (customers write them)", "Back-in-stock alerts by email", "Abandoned bag emails (needs an email service)", "Online payments: Razorpay or Cashfree (UPI, cards)", "Wishlist", "Buy 2 get 1 / bundle offers", "Gift wrap and gift message", "Size guide popup", "Order tracking page", "Cash on delivery fee and pincode check"].map((x) => <li key={x} className="rounded-xl bg-[#f8f4ef] px-3 py-2">{x}</li>)}
        </ul>
      </section>
    </div>
  );
}
