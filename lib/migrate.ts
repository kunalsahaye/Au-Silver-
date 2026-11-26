import "server-only";
import { Client } from "pg";
import { SCHEMA_SQL } from "./schema";
import { seedProducts } from "./seed";

let done: Promise<void> | null = null;

/**
 * Creates the database tables and functions on first use, so a fresh Supabase database
 * works without anyone pasting SQL. Runs once per server instance; the SQL is idempotent
 * and guarded by an advisory lock so parallel instances don't collide.
 */
/** Current state, for the health check. */
export async function schemaStatus() {
  await ensureSchema();
  return { autoSetup: Boolean(process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL) };
}

export function ensureSchema(): Promise<void> {
  if (!done) done = run().catch((e) => { done = null; console.error("[schema] setup failed:", e); });
  return done;
}

async function run() {
  const raw = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!raw) return; // database set up by hand (see supabase/schema.sql)
  const url = new URL(raw);
  url.searchParams.delete("sslmode"); // we pass ssl options ourselves
  const client = new Client({
    connectionString: url.toString(),
    ssl: /localhost|127\.0\.0\.1/.test(url.hostname) ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  await client.connect();
  try {
    await client.query("select pg_advisory_lock(727001)");
    const { rows } = await client.query(
      "select to_regclass('public.products') is not null and to_regclass('public.page_views') is not null and exists (select 1 from pg_proc where proname = 'adjust_stock') and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'products' and column_name = 'images') as ok",
    );
    if (!rows[0]?.ok) {
      await client.query(SCHEMA_SQL);
      console.log("[schema] database tables created");
      await new Promise((r) => setTimeout(r, 1500)); // give the API a moment to reload its schema cache
    }
    // First run on an empty shop: add the sample pieces once, so the storefront isn't blank.
    const seeded = await client.query("select 1 from settings where key = 'seeded'");
    if (!seeded.rowCount) {
      const count = await client.query("select count(*)::int as n from products");
      if (count.rows[0].n === 0) {
        for (const p of seedProducts) {
          await client.query(
            `insert into products (slug, name, category, metal, price, description, material, finish, image_url, featured, bestseller, stock)
             values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict (slug) do nothing`,
            [p.slug, p.name, p.category, p.metal, p.price, p.description, p.material, p.finish, p.image_url, p.featured, p.bestseller, p.stock],
          );
        }
        console.log(`[schema] added ${seedProducts.length} sample products`);
      }
      await client.query("insert into settings (key, value) values ('seeded', 'true'::jsonb) on conflict do nothing");
    }
  } finally {
    await client.query("select pg_advisory_unlock(727001)").catch(() => {});
    await client.end();
  }
}
