# Au Silver website (Next.js)

A jewellery storefront with a built-in admin dashboard that works as the site's CMS. Runs on any Node.js host (Hostinger Business or Cloud, Vercel, a VPS).

- **Shop**: homepage (slides, bestsellers, categories, story, happy customers), collections, product pages with photo galleries, bag and checkout with shipping charges (orders are confirmed and paid offline for now), contact form, and any extra pages you add (FAQ, Care guide …).
- **Admin home** (`/admin`): big tap-friendly tiles (made for iPad), then visits, revenue, latest orders, low stock, enquiries.
- **Products**: add, edit, search, filter, several photos each, price, stock, category, featured or bestseller. Changes go live straight away.
- **Homepage**: turn sections on or off and reorder them; edit headlines and photos.
- **Slides**: photos or videos at the top of the homepage, each with a headline and button.
- **Happy customers**: customer photo or video, name, note and stars.
- **Categories**: add, rename, reorder, set a photo, choose which appear in the menu.
- **Pages**: About, Contact, FAQ and your own pages.
- **Shop settings**: name, offer banner, shipping charge and free-shipping amount, currency, contact details, Instagram.
- **Draft and Publish**: homepage, slides, customers, categories, pages and settings save as a draft. Press **Preview** to see the shop with your changes, then **Publish**.
- **Orders** and **Enquiries** with status. Stock is taken out when an order is placed and put back if it is cancelled.
- Two logins: **admin** (can delete products, move photos) and **client** (the shop owner).

## Services used

| Need | Service | Variables |
| --- | --- | --- |
| Database (products, orders, content) | Supabase | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `POSTGRES_URL_NON_POOLING` so tables are created automatically |
| Photo and video uploads | Supabase Storage (same project; a public `media` bucket is created automatically) | none extra |
| Email alerts (optional) | Resend | `RESEND_API_KEY`, `ALERT_EMAIL_TO`, `ALERT_EMAIL_FROM` |

Without a database the site runs in **demo mode** (data in a temporary file that can vanish). Fine for local testing, not for a live shop.

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000/admin and sign in with `admin@demo.com` / `admin123`. These demo logins only exist in `npm run dev` when no logins are set, and never on a production build. Without Supabase, uploads are saved to `public/uploads` (local only).

## Host on Hostinger (Business or Cloud plan)

1. hPanel > **Websites > Add website > Node.js Web App > Import Git repository**. Connect GitHub and pick this repository and the `main` branch.
2. Build settings: framework **Next.js**, Node **22.x**, package manager **npm**, build command `npm run build`. Leave the rest as detected.
3. **Environment variables** (see `.env.example`): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `POSTGRES_URL_NON_POOLING`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_EMAIL`, `CLIENT_PASSWORD`, `SESSION_SECRET`, and the optional Resend ones. Find the Supabase values in Supabase > Project settings > API (URL, service_role key) and > Database > Connection string (direct connection, port 5432).
4. Deploy. Check `https://<temporary address>/api/health`: database should be `supabase` and photoStorage `supabase`.
5. Connect your domain in the website's settings. Every push to `main` redeploys automatically.

Hostinger replaces the app's files on every deploy, which is why photos live in Supabase Storage and not on the server.

## Host on Vercel

Import the repository in Vercel, add the same environment variables (or connect Supabase from Vercel > Storage, which adds them), and deploy.

## Moving photos off Vercel Blob

Older versions stored photos in Vercel Blob. After connecting Supabase, open **Shop settings**: if any photos are still on Vercel, a **Move photos now** button copies them into Supabase Storage and updates every product and page that uses them.

## Updating an existing Supabase database

The site updates its own tables on start-up (it adds the `images` column for product galleries). `supabase/schema.sql` is also safe to run by hand in Supabase's SQL Editor.

## Reskin for a new client

Edit `lib/seed.ts` (default copy, categories, pages and products) and the colours in `app/globals.css`, or change everything from `/admin` after deploying.
