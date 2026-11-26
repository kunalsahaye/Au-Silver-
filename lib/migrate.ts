import "server-only";
import { Client } from "pg";
import { SCHEMA_SQL } from "./schema";

let done: Promise<void> | null = null;

/**
 * Creates the database tables and functions on first use, so a fresh Supabase database
 * works without anyone pasting SQL. Runs once per server instance; the SQL is idempotent
 * and guarded by an advisory lock so parallel instances don't collide.
 */
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
      "select to_regclass('public.products') is not null and to_regclass('public.page_views') is not null and exists (select 1 from pg_proc where proname = 'adjust_stock') as ok",
    );
    if (!rows[0]?.ok) {
      await client.query(SCHEMA_SQL);
      console.log("[schema] database tables created");
      await new Promise((r) => setTimeout(r, 1500)); // give the API a moment to reload its schema cache
    }
  } finally {
    await client.query("select pg_advisory_unlock(727001)").catch(() => {});
    await client.end();
  }
}
