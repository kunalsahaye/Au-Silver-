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
