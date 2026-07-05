-- Tees & Hoodies Consolidated Production Schema

-- 1. Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_net";

-- 2. Tables

-- Products Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric not null,
  category text not null,
  featured_image_url text,
  image_urls text[] not null default '{}', -- Updated to array
  design_options text[] not null default '{}',
  use_design_selection boolean not null default false,
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  description text not null,
  specs text not null,
  is_new boolean default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Categories Table
create table if not exists public.categories (
  id text primary key,
  name text not null,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

-- Blog Posts Table
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_image_url text,
  author_name text not null default 'Tees & Hoodies Hub',
  is_published boolean not null default false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists blog_posts_published_at_idx
  on public.blog_posts (published_at desc)
  where is_published = true;

-- Hero Images Table
create table if not exists public.hero_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Carts Table
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cart Items Table
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  size text not null,
  color text not null,
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);

create unique index if not exists cart_items_unique
  on public.cart_items (cart_id, product_id, size, color);

-- Store Orders Table (Expanded)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete set null,
  total numeric not null,
  status text not null default 'pending',
  customer_name text,
  phone_number text,
  email text,
  shipping_address text,
  shipping_city text,
  payment_method text,
  payment_status text default 'pending',
  payment_network text,
  payment_reference text,
  created_at timestamptz not null default now()
);

-- Order Items Table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  size text not null,
  color text not null,
  quantity integer not null,
  unit_price numeric not null
);

-- Custom Orders Setup
create type public.order_status as enum ('Pending', 'In Production', 'Ready', 'Delivered', 'Cancelled');

create table if not exists public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone_number text not null,
  email text not null,
  delivery_location text not null,
  product_type text not null,
  product_color text not null,
  sizes text[] not null default '{}', -- Replaced jsonb with text[] for consistency
  quantity integer not null,
  print_placement text not null,
  custom_text text,
  design_file_url text,
  order_notes text,
  status public.order_status not null default 'Pending',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now(),
  constraint admin_users_identity_check check (user_id is not null or email is not null)
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      or (
        email is not null
        and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
      )
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

-- 3. Security (RLS)

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.hero_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.custom_orders enable row level security;
alter table public.admin_users enable row level security;

-- Simple permissive policies
create policy "allow_anon_read" on public.products for select using (true);
create policy "allow_anon_read_cat" on public.categories for select using (true);
create policy "blog_posts_public_read_published"
  on public.blog_posts
  for select
  to anon, authenticated
  using (
    is_published = true
    and (published_at is null or published_at <= now())
  );
create policy "blog_posts_admin_all"
  on public.blog_posts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy "allow_anon_read_hero_images" on public.hero_images for select using (true);
create policy "full_access_products" on public.products for all using (true);
create policy "full_access_categories" on public.categories for all using (true);
create policy "full_access_hero_images" on public.hero_images for all using (true);
create policy "full_access_carts" on public.carts for all using (true);
create policy "full_access_cart_items" on public.cart_items for all using (true);
create policy "full_access_orders" on public.orders for all using (true);
create policy "full_access_order_items" on public.order_items for all using (true);

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
grant all on public.admin_users to service_role;

create policy "admin_users_select_self"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

revoke all on public.custom_orders from anon, authenticated;
grant insert on public.custom_orders to anon, authenticated;
grant select, update, delete on public.custom_orders to authenticated;
grant all on public.custom_orders to service_role;

create policy "customers_can_submit_custom_orders"
  on public.custom_orders
  for insert
  to anon, authenticated
  with check (
    status = 'Pending'
    and quantity >= 10
    and length(trim(customer_name)) > 0
    and length(trim(phone_number)) > 0
    and length(trim(email)) > 0
    and length(trim(delivery_location)) > 0
    and length(trim(product_type)) > 0
    and length(trim(product_color)) > 0
    and length(trim(print_placement)) > 0
  );

create policy "admins_can_read_custom_orders"
  on public.custom_orders
  for select
  to authenticated
  using (public.is_admin());

create policy "admins_can_update_custom_orders"
  on public.custom_orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins_can_delete_custom_orders"
  on public.custom_orders
  for delete
  to authenticated
  using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('design_uploads', 'design_uploads', false)
on conflict (id) do update set public = false;

create policy "customers_can_upload_design_files"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'design_uploads'
    and (storage.foldername(name))[1] in ('studio-orders', 'uploaded-artwork')
  );

create policy "admins_can_read_design_files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'design_uploads'
    and public.is_admin()
  );

create policy "admins_can_delete_design_files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'design_uploads'
    and public.is_admin()
  );

-- 4. Initial Seed for Categories
insert into public.categories (id, name, description) values
('graphic-tees', 'Graphic Tees', 'Premium cotton tees with statement prints.'),
('hoodies', 'Hoodies', 'Heavyweight brushed fleece pullovers.'),
('sleeveless-hoodies', 'Sleeveless Hoodies', 'Street-ready tactical sleeveless cuts.')
on conflict (id) do nothing;

-- 5. Webhooks for Notifications
create or replace function public.webhook_notify_order()
returns trigger as $$
begin
  perform net.http_post(
      url:='https://' || current_setting('request.headers')::json->>'x-forwarded-host' || '/functions/v1/notify-order',
      headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', current_setting('request.headers')::json->>'authorization'
      ),
      body:=jsonb_build_object(
          'record', row_to_json(NEW)
      )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger notify_order_trigger
  after insert on public.custom_orders
  for each row
  execute function public.webhook_notify_order();
