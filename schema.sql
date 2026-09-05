-- Run this once in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query).

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'general',
  excerpt text,
  content text not null,
  image_url text,
  author text default 'David Gist Media',
  featured boolean not null default false,
  published_at timestamptz not null default now()
);

-- Row Level Security: anyone can read published articles,
-- but only a logged-in (authenticated) user can create, edit, or delete them.
alter table articles enable row level security;

create policy "Public can read articles"
on articles for select
to anon, authenticated
using (true);

create policy "Authenticated can insert articles"
on articles for insert
to authenticated
with check (true);

create policy "Authenticated can update articles"
on articles for update
to authenticated
using (true);

create policy "Authenticated can delete articles"
on articles for delete
to authenticated
using (true);

-- Helpful index for category filtering and sorting by date.
create index if not exists articles_category_idx on articles (category);
create index if not exists articles_published_at_idx on articles (published_at desc);
