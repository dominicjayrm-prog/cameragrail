-- CameraGrail initial schema. Isolated from anything else in this Supabase
-- project under the `cameragrail` schema.
--
-- This file is the source of truth for the schema. It has already been
-- applied to the project via the Supabase MCP tool. Run it again with
-- `supabase db push` once you have the Supabase CLI linked, or apply via
-- the SQL editor on a fresh project.

create schema if not exists cameragrail;

create table cameragrail.cameras (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  brand text not null,
  brand_slug text not null,
  model text not null,
  format text not null,
  format_slug text not null,
  year_start integer,
  year_end integer,
  country text,
  mount text,
  specs jsonb,
  history text,
  rarity text,
  hero_image_url text,
  value_low integer,
  value_median integer,
  value_high integer,
  value_updated_at timestamptz,
  price_source text default 'ebay_browse',
  published boolean default false,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index cameras_brand_slug_idx on cameragrail.cameras (brand_slug);
create index cameras_format_slug_idx on cameragrail.cameras (format_slug);
create index cameras_published_idx on cameragrail.cameras (published);

create table cameragrail.condition_values (
  id uuid primary key default gen_random_uuid(),
  camera_id uuid references cameragrail.cameras(id) on delete cascade,
  condition text not null,
  value_low integer,
  value_high integer,
  unique(camera_id, condition)
);

create table cameragrail.price_history (
  id uuid primary key default gen_random_uuid(),
  camera_id uuid references cameragrail.cameras(id) on delete cascade,
  recorded_at date not null,
  median_value integer,
  sample_size integer,
  unique(camera_id, recorded_at)
);

create index price_history_camera_idx on cameragrail.price_history (camera_id, recorded_at);

create table cameragrail.sold_listings (
  id uuid primary key default gen_random_uuid(),
  camera_id uuid references cameragrail.cameras(id) on delete cascade,
  source text not null,
  sale_price integer,
  currency text default 'gbp',
  condition_note text,
  sold_date date,
  external_url text,
  is_outlier boolean default false,
  created_at timestamptz default now()
);

create index sold_listings_camera_idx on cameragrail.sold_listings (camera_id, sold_date);

create table cameragrail.submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  submitted_by uuid references auth.users(id),
  camera_id uuid references cameragrail.cameras(id),
  payload jsonb not null,
  status text default 'pending',
  moderator_note text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table cameragrail.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table cameragrail.user_collection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  camera_id uuid references cameragrail.cameras(id) on delete cascade,
  condition text,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, camera_id)
);

create table cameragrail.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique,
  display_name text,
  contributions_count integer default 0,
  created_at timestamptz default now()
);

alter table cameragrail.cameras enable row level security;
alter table cameragrail.condition_values enable row level security;
alter table cameragrail.price_history enable row level security;
alter table cameragrail.sold_listings enable row level security;
alter table cameragrail.submissions enable row level security;
alter table cameragrail.leads enable row level security;
alter table cameragrail.user_collection enable row level security;
alter table cameragrail.profiles enable row level security;

create policy "public read published cameras"
  on cameragrail.cameras for select
  using (published = true);

create policy "public read condition values"
  on cameragrail.condition_values for select
  using (
    exists (
      select 1 from cameragrail.cameras c
      where c.id = condition_values.camera_id and c.published = true
    )
  );

create policy "public read price history"
  on cameragrail.price_history for select
  using (
    exists (
      select 1 from cameragrail.cameras c
      where c.id = price_history.camera_id and c.published = true
    )
  );

create policy "public read approved community sales"
  on cameragrail.sold_listings for select
  using (
    source = 'community'
    and is_outlier = false
    and exists (
      select 1 from cameragrail.cameras c
      where c.id = sold_listings.camera_id and c.published = true
    )
  );

create policy "user reads own submissions"
  on cameragrail.submissions for select
  using (auth.uid() = submitted_by);

create policy "user creates own submissions"
  on cameragrail.submissions for insert
  with check (auth.uid() = submitted_by);

create policy "user reads own collection"
  on cameragrail.user_collection for select
  using (auth.uid() = user_id);

create policy "user manages own collection"
  on cameragrail.user_collection for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user reads own profile"
  on cameragrail.profiles for select
  using (auth.uid() = id);

create policy "user updates own profile"
  on cameragrail.profiles for update
  using (auth.uid() = id);

create policy "anyone can submit a lead"
  on cameragrail.leads for insert
  with check (true);

grant usage on schema cameragrail to anon, authenticated, service_role;
grant select on cameragrail.cameras, cameragrail.condition_values,
  cameragrail.price_history, cameragrail.sold_listings to anon, authenticated;
grant insert on cameragrail.leads, cameragrail.submissions to anon, authenticated;
grant select, insert, update, delete on cameragrail.user_collection,
  cameragrail.profiles to authenticated;
grant all on all tables in schema cameragrail to service_role;
