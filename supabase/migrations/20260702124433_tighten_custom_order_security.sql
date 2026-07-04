-- Tighten custom printing order data and uploaded artwork access.
-- Customers can submit orders and upload artwork, but only allow-listed admins
-- can read/manage orders or download uploaded files.

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now(),
  constraint admin_users_identity_check check (user_id is not null or email is not null)
);

alter table public.admin_users enable row level security;

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

drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
grant all on public.admin_users to service_role;

drop policy if exists "custom_orders_insert_all" on public.custom_orders;
drop policy if exists "custom_orders_select_all" on public.custom_orders;
drop policy if exists "custom_orders_update_all" on public.custom_orders;
drop policy if exists "custom_orders_delete_all" on public.custom_orders;
drop policy if exists "full_access_custom_orders" on public.custom_orders;
drop policy if exists "customers_can_submit_custom_orders" on public.custom_orders;
drop policy if exists "admins_can_read_custom_orders" on public.custom_orders;
drop policy if exists "admins_can_update_custom_orders" on public.custom_orders;
drop policy if exists "admins_can_delete_custom_orders" on public.custom_orders;

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

update storage.buckets
set public = false
where id = 'design_uploads';

drop policy if exists "design_uploads_insert_all" on storage.objects;
drop policy if exists "design_uploads_select_all" on storage.objects;
drop policy if exists "design_uploads_update_all" on storage.objects;
drop policy if exists "design_uploads_delete_all" on storage.objects;
drop policy if exists "customers_can_upload_design_files" on storage.objects;
drop policy if exists "admins_can_read_design_files" on storage.objects;
drop policy if exists "admins_can_delete_design_files" on storage.objects;

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
