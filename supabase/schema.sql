-- Run this once in Supabase: SQL Editor > New query > paste > Run
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  metal text not null default 'gold',
  price numeric not null,
  description text default '',
  material text default '',
  finish text default '',
  image_url text,
  featured boolean default false,
  bestseller boolean default false,
  stock int default 0,
  created_at timestamptz default now()
);
create table if not exists settings (key text primary key, value jsonb not null);
create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  name text, email text, phone text, message text, product_name text,
  status text default 'new', created_at timestamptz default now()
);
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  name text, email text, phone text, address text,
  items jsonb, total numeric, status text default 'new',
  created_at timestamptz default now()
);
create table if not exists page_views (
  id bigserial primary key, path text, created_at timestamptz default now()
);
-- All access goes through the server with the service-role key, so lock the tables down:
alter table products enable row level security;
alter table settings enable row level security;
alter table enquiries enable row level security;
alter table orders enable row level security;
alter table page_views enable row level security;

-- Checkout: save an order and take its items out of stock in one transaction.
-- Fails with OUT_OF_STOCK:<item name> (and saves nothing) if any item has too little stock.
create or replace function place_order(p_order jsonb) returns uuid
language plpgsql set search_path = public as $$
declare it jsonb; n int; new_id uuid;
begin
  for it in select * from jsonb_array_elements(p_order->'items') loop
    update products set stock = stock - (it->>'qty')::int
      where slug = it->>'slug' and stock >= (it->>'qty')::int;
    get diagnostics n = row_count;
    if n = 0 then raise exception 'OUT_OF_STOCK:%', it->>'name'; end if;
  end loop;
  insert into orders (name, email, phone, address, items, total, status)
  values (p_order->>'name', p_order->>'email', p_order->>'phone', p_order->>'address',
          p_order->'items', (p_order->>'total')::numeric, 'new')
  returning id into new_id;
  return new_id;
end $$;

-- Used when an order is cancelled (puts stock back) or un-cancelled (takes it out again).
create or replace function adjust_stock(p_slug text, p_delta int) returns boolean
language plpgsql set search_path = public as $$
declare n int;
begin
  update products set stock = stock + p_delta where slug = p_slug and stock + p_delta >= 0;
  get diagnostics n = row_count;
  return n > 0 or (p_delta > 0 and not exists (select 1 from products where slug = p_slug));
end $$;

-- Only the server (service role) may call these.
revoke execute on function place_order(jsonb) from public, anon, authenticated;
revoke execute on function adjust_stock(text, int) from public, anon, authenticated;
grant execute on function place_order(jsonb) to service_role;
grant execute on function adjust_stock(text, int) to service_role;
