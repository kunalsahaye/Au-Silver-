import { saveShopSettings } from "../../content-actions";
import EditorForm, { Box, Text } from "@/components/admin/EditorForm";
import ImageField from "@/components/admin/ImageField";
import MovePhotos from "@/components/admin/MovePhotos";
import { getDraft } from "@/lib/store";

type Q = { searchParams: Promise<Record<string, string | undefined>> };
export default async function Settings({ searchParams }: Q) {
  const q = await searchParams;
  const { content: c } = await getDraft();
  const s = c.site;
  return (
    <>
      <EditorForm title="Shop settings" q={q} action={saveShopSettings}
        intro="Your shop name, offer banner, shipping charges and contact details.">
        <Box title="Shop">
          <Text name="brand" label="Shop name" value={s.brand} />
          <ImageField name="logo" label="Logo (optional; the shop name is shown if empty)" defaultValue={s.logo} hint="A wide PNG with a transparent background works best." />
          <Text name="tagline" label="Tagline" value={s.tagline} />
          <Text name="announcement" label="Offer banner at the very top" value={s.announcement} hint="e.g. Free shipping above ₹1,999 · Use code SILVER10 for 10% off" />
        </Box>
        <Box title="Shipping">
          <div className="grid gap-4 sm:grid-cols-3">
            <Text name="currency" label="Currency symbol" value={s.currency} />
            <Text name="shippingFee" label="Shipping charge per order" value={s.shippingFee} hint="0 = always free" />
            <Text name="freeShippingOver" label="Free shipping from" value={s.freeShippingOver} hint="Bag total. Blank = never free." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="deliveryDays" label="Delivery time in days" value={s.deliveryDays} hint="e.g. 3-7. Used by Google Shopping." />
            <Text name="returnDays" label="Return window in days" value={s.returnDays} hint="0 = no returns. Used by Google Shopping." />
          </div>
        </Box>
        <Box title="Contact and social">
          <div className="grid gap-4 sm:grid-cols-2"><Text name="email" label="Email" value={s.email} /><Text name="phone" label="Phone or WhatsApp" value={s.phone} /></div>
          <Text name="address" label="Address" value={s.address} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text name="instagram" label="Instagram" value={s.instagram} hint="Your handle, e.g. @ausilver" />
            <Text name="whatsapp" label="WhatsApp number" value={s.whatsapp} hint="With country code, e.g. 919876543210" />
            <Text name="facebook" label="Facebook page link" value={s.facebook} />
            <Text name="youtube" label="YouTube channel link" value={s.youtube} />
            <Text name="pinterest" label="Pinterest link" value={s.pinterest} />
          </div>
        </Box>
        <Box title="Photos used across the shop">
          <ImageField name="img8" label="About page: wide photo under the headline" defaultValue={s.img8} />
          <ImageField name="productPlaceholder" label="Products without a photo show this (empty shows a drawing)" defaultValue={s.productPlaceholder} />
        </Box>
      </EditorForm>
      <MovePhotos q={q} />
    </>
  );
}
