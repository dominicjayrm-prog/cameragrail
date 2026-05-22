-- Blog CMS table for CameraGrail.
-- Already applied to the live project via the Supabase MCP tool.

create table cameragrail.blog_posts (
  id uuid primary key default gen_random_uuid(),
  site text not null,
  slug text not null,
  title text not null,
  category text,
  excerpt text,
  content text,
  cover_image text,
  cover_image_alt text,
  featured_image text,
  meta_title text,
  meta_description text,
  seo_title text,
  seo_description text,
  author_name text,
  read_time_minutes integer,
  status text not null default 'draft',
  is_published boolean not null default false,
  published boolean not null default false,
  is_featured boolean not null default false,
  tags text[],
  language text default 'en',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (site, slug)
);

create index blog_posts_site_status_idx
  on cameragrail.blog_posts (site, status, published_at desc);

alter table cameragrail.blog_posts enable row level security;

create policy blog_posts_anon_select
  on cameragrail.blog_posts for select
  to anon
  using (published = true or is_published = true);

create policy blog_posts_authenticated_select
  on cameragrail.blog_posts for select
  to authenticated
  using (published = true or is_published = true);

grant select on cameragrail.blog_posts to anon, authenticated;
grant all on cameragrail.blog_posts to service_role;
