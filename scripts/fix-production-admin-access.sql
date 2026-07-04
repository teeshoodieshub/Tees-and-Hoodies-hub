-- Run this in the Supabase SQL editor for the production project used by .env:
-- https://supabase.com/dashboard/project/znprjbvvheqjqsgvrajo/sql
--
-- Replace the email in the final insert with the exact email used to log in to
-- /admin. The row can be email-only; it does not need the auth user id.

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

insert into public.admin_users (email)
values ('tees.hoodies.hub@gmail.com')
on conflict (email) do nothing;
