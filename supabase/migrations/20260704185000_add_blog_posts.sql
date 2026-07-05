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

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_public_read_published" on public.blog_posts;
drop policy if exists "blog_posts_admin_all" on public.blog_posts;

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant all on public.blog_posts to service_role;

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

create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
  before update on public.blog_posts
  for each row
  execute function public.set_blog_posts_updated_at();
