# Au Silver website (Next.js on Vercel)

A jewellery storefront with a built-in admin dashboard that works as the site's CMS.

- **Shop**: home, collections, product pages, bag and checkout (orders are confirmed and paid offline for now), contact form.
- **Dashboard** (`/admin`): visits, revenue, latest orders, low stock, enquiries.
- **Products**: add, edit, search, filter, upload a photo, set price and stock, mark featured or bestseller.
- **Orders**: filter by status and update it. Stock is taken out when an order is placed and put back if it is cancelled.
- **Enquiries**: messages from the contact form, with status.
- **Site content**: brand, all home and about page text, contact details, currency, and eight uploadable photos.
- Two logins: **admin** (you, can delete products) and **client** (the shop owner).

## Services used

| Need | Service | How it connects |
| --- | --- | --- |
| Hosting | Vercel | Import the Git repository |
| Database (products, orders, content) | Supabase via Vercel Marketplace | Vercel > Storage > Create > Supabase. Adds the env vars |
| Image uploads | Vercel Blob | Vercel > Storage > Create > Blob. Adds `BLOB_READ_WRITE_TOKEN` |
| Email alerts (optional) | Resend | `RESEND_API_KEY`, `ALERT_EMAIL_TO` |

Without a database the site runs in **demo mode** (data in a temporary file that can vanish). Fine for local testing, not for a live shop.

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000/admin and sign in with `admin@demo.com` / `admin123`. These demo logins only exist in `npm run dev` when no logins are set, and never on a production build. Without Blob, uploaded photos are saved to `public/uploads` (local only).

## Go live on Vercel

1. Push this repository to GitHub and import it in Vercel (Add New > Project). The defaults for Next.js are correct.
2. In the Vercel project, **Storage > Create Database > Supabase**, connect it to the project. Then open the Supabase dashboard, SQL Editor, paste `supabase/schema.sql` and run it.
3. **Storage > Create > Blob**, connect it to the project (public access).
4. **Settings > Environment Variables**: add `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_EMAIL`, `CLIENT_PASSWORD`, `SESSION_SECRET` (see `.env.example`).
5. Redeploy. Sign in at `https://<your-site>/admin`, add products and photos, and edit the site content.

If the login page says "The portal is not set up yet", one of the step 4 variables is missing.
If the dashboard says "Photo uploads are off", the Blob store is not connected.

## Updating an existing Supabase database

`supabase/schema.sql` is safe to run again. It adds the `place_order` and `adjust_stock` functions used by checkout.

## Reskin for a new client

Edit `lib/seed.ts` (default copy and products) and the colours in `app/globals.css`, or change everything from `/admin/content` and `/admin/products` after deploying.
