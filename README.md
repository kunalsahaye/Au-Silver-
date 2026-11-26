# Au Silver website (Next.js + Supabase)

Storefront + client/admin portal. Works in demo mode with zero setup; add Supabase for permanent data.

## Run locally
npm install && npm run dev  (demo logins: admin@demo.com / admin123, client@demo.com / client123)

## Go live for a client
1. Supabase: create project, run supabase/schema.sql in the SQL editor.
2. Vercel: import the repo, add the env vars from .env.example (Supabase URL + service-role key, new admin/client logins, SESSION_SECRET).
3. Optional: RESEND_API_KEY + ALERT_EMAIL_TO for email alerts on new enquiries/orders.

## Reskin for a new client
Edit lib/seed.ts (default copy/products), colours in app/globals.css, or use /admin/content and /admin/products after deploy.
