# CameraGrail.com: Claude Code Build Prompt

Paste everything below the line as your first message to Claude Code. Attach `CameraGrailHome.jsx` (the homepage design) and `CAMERAGRAIL_PROJECT_PLAN.md` (the full plan + pricing architecture) as file references.

---

## WHAT YOU'RE BUILDING

A production-ready Next.js 14 site for **CameraGrail.com**, an entity-catalogue price guide and archive for cameras and lenses. The core unit is a permanent, SEO-optimised page per camera model that answers "what is this worth?" with condition-adjusted values from real sale data, full specs, production history, a price-trend chart, and an affiliate link to current listings. Thousands of these pages aggregate long-tail search traffic. A community-submission layer lets collectors add missing models and log sales.

I've attached:
- `CameraGrailHome.jsx`: the exact homepage design to match (deep navy palette, Inter + Spline Sans fonts, clean and simple).
- `CAMERAGRAIL_PROJECT_PLAN.md`: the full plan, including the layered pricing-data architecture. Read this carefully, especially section 3 on how pricing works.

## TECH STACK (NON-NEGOTIABLE)
- Next.js 14 App Router, React Server Components by default
- TypeScript strict mode
- Tailwind CSS with a custom theme matching the palette below
- Supabase (Postgres + Auth + Storage + Row Level Security)
- Vercel hosting + Vercel Cron for scheduled price refreshes
- eBay APIs: Browse API (active listings, free) at launch; architecture ready for Marketplace Insights API (sold data) once approved
- eBay Partner Network (EPN) affiliate tagging on all listing links
- Plausible Analytics + Microsoft Clarity
- next-sitemap, JSON-LD structured data
- Recharts for price-trend charts

## DESIGN SYSTEM
Match `CameraGrailHome.jsx` exactly.
- Fonts (next/font/google): Inter (body), Spline Sans (headings). Clean, simple, readable. No serif, nothing artistic.
- Palette (tailwind.config.ts):
  - navy #0E1A2B (ink, dark sections), navy2 #16263D (raised dark)
  - blue #2D6CDF (accent), blueSoft #5B8DEF
  - paper #F7F9FC (background), ink #0E1A2B (text), slate #5A6B82 (secondary), line #E4EAF2 (borders)
  - success #1F8A55, down #C24536
- Rounded corners 10-18px cards, 100px pills. Soft shadows. Generous whitespace. No orange anywhere.

## SITE ARCHITECTURE
```
/                                  homepage (match CameraGrailHome.jsx)
/camera/[brand]/[model]            individual camera page (the core SEO unit)
/brand/[brand]                     brand hub (all models for a maker)
/format/[format]                   format hub (35mm-slr, rangefinder, tlr, medium-format, etc)
/price-index                       trending + most-valuable rankings
/value-my-camera                   free valuation tool (email capture)
/submit                            submit a new camera (community)
/log-sale                          log a recent sale (community price data)
/browse                            full catalogue browse with filters
/about, /how-values-work, /contact, /privacy, /terms, /disclaimer
/admin/moderation                  protected: approve/reject submissions
/login                             magic link auth
/account                           user collection + submissions
```

## SUPABASE SCHEMA (single migration)
```sql
create table cameras (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,            -- e.g. 'olympus-om-1'
  brand text not null,
  brand_slug text not null,
  model text not null,
  format text not null,                 -- '35mm SLR', 'Rangefinder', 'TLR', 'Medium Format', etc
  format_slug text not null,
  year_start integer,
  year_end integer,
  country text,
  mount text,
  specs jsonb,                          -- flexible spec sheet
  history text,                         -- 200-400 word production context
  rarity text,                          -- 'Common','Uncommon','Sought-after','Rare'
  hero_image_url text,
  value_low integer,                    -- condition-adjusted, in pence (GBP)
  value_median integer,
  value_high integer,
  value_updated_at timestamptz,
  price_source text default 'ebay_browse', -- abstract source: 'ebay_browse','ebay_insights','community','manual'
  published boolean default false,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table condition_values (         -- value by condition per camera
  id uuid primary key default gen_random_uuid(),
  camera_id uuid references cameras(id) on delete cascade,
  condition text not null,              -- 'mint','excellent','good','for-parts'
  value_low integer, value_high integer,
  unique(camera_id, condition)
);

create table price_history (            -- for trend charts
  id uuid primary key default gen_random_uuid(),
  camera_id uuid references cameras(id) on delete cascade,
  recorded_at date not null,
  median_value integer,
  sample_size integer,
  unique(camera_id, recorded_at)
);

create table sold_listings (            -- raw sold/active data feeding the value calc
  id uuid primary key default gen_random_uuid(),
  camera_id uuid references cameras(id) on delete cascade,
  source text not null,                 -- 'ebay','reverb','community'
  sale_price integer,                   -- pence GBP
  currency text default 'gbp',
  condition_note text,
  sold_date date,
  external_url text,
  is_outlier boolean default false,     -- flagged/excluded from calc
  created_at timestamptz default now()
);

create table submissions (              -- community: new cameras + logged sales
  id uuid primary key default gen_random_uuid(),
  type text not null,                   -- 'new_camera' | 'sale_log'
  submitted_by uuid references auth.users(id),
  camera_id uuid references cameras(id), -- null if brand-new camera
  payload jsonb not null,               -- proposed data
  status text default 'pending',        -- 'pending','approved','rejected'
  moderator_note text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table leads (                    -- email capture from valuation tool
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table user_collection (          -- logged-in users track owned cameras
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  camera_id uuid references cameras(id),
  condition text,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, camera_id)
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique, display_name text,
  contributions_count integer default 0,
  created_at timestamptz default now()
);
```
Enable RLS on user tables. Public read on `cameras`, `condition_values`, `price_history`, approved data. Service role for cron + moderation.

## eBAY INTEGRATION (see plan section 3)
- Build a `lib/ebay.ts` service abstracting the price source behind one interface: `getActiveListings(query)`, `getSoldListings(query)` (insights, behind a feature flag until approved), and `buildAffiliateUrl(itemUrl)` that appends EPN campaign params.
- A Vercel Cron route `/api/cron/refresh-prices` runs on schedule: for each camera (popular weekly, long-tail monthly), pull listings, strip outliers (parts/broken vs working, body-only vs kit), compute condition-adjusted low/median/high, write to `cameras` + `condition_values`, append a `price_history` row.
- Never call eBay live on page render. Pages read cached values from Supabase. Catalogue pages are statically generated and revalidated (ISR) on a schedule.
- All "See current listings" buttons use `buildAffiliateUrl` with the EPN campaign ID from env.

## THE CAMERA PAGE (core SEO unit), must include
- H1 "[Model] Value & Price Guide (year range)"
- Condition-adjusted value table (mint/excellent/good/for-parts) with bar visualisation
- Price-trend chart from `price_history` (Recharts)
- "See current listings on eBay" CTA (EPN affiliate)
- Full specs table from `specs` jsonb
- Production history prose
- Related models (same brand, era, format) for internal linking
- FAQ block + FAQPage JSON-LD ("How much is a [model] worth?", etc)
- Community sales log (approved `sold_listings` where source='community')
- Product + AggregateRating + BreadcrumbList JSON-LD

## COMMUNITY + MODERATION
- `/submit`: form to add a missing camera (brand, model, format, year, specs, photo upload to Supabase Storage). Creates a `submissions` row type='new_camera', status='pending'.
- `/log-sale`: form to report a sale (camera search/select, price, condition, date, source). Creates `submissions` type='sale_log'.
- `/admin/moderation` (protected): queue to approve/reject. Approving a new_camera creates a published `cameras` row; approving a sale_log inserts a `sold_listings` row (source='community') and recomputes that camera's value. Increment submitter `contributions_count`.

## SEO REQUIREMENTS (P0)
- Every catalogue page statically generated (generateStaticParams) + ISR revalidation.
- JSON-LD: Product/Offer/AggregateRating on camera pages, FAQPage on FAQ blocks, BreadcrumbList everywhere, Organization + WebSite+SearchAction on homepage, CollectionPage on hubs.
- Auto sitemap (next-sitemap), robots.txt (disallow /admin, /account, /api, /login).
- Unique title/meta per page, keyword-front-loaded ("Olympus OM-1 Value & Price Guide 2026").
- Internal linking: every camera links to brand hub, format hub, and 4-6 related models. Hubs link to all children.
- next/image WebP, alt text, Core Web Vitals green, fonts preloaded with swap.
- Currency: GBP-first with a currency toggle (GBP/USD/EUR) stored in cookie. This is a differentiator vs US-centric competitors.

## HARD CONSTRAINTS
1. NO em dashes anywhere in code or content. Use commas, full stops, semicolons. En dashes in numeric/date ranges (1954–1966) are fine.
2. Deep navy palette only. No orange.
3. Inter + Spline Sans. No serif, nothing artistic.
4. "Values are estimates based on real sale data and are not formal appraisals" disclaimer sitewide.
5. Affiliate disclosure in footer and near listing CTAs.
6. No fake data in production. Seed/sample data clearly flagged so I can replace it.
7. Mobile-first, WCAG AA, all marketing/catalogue pages pre-rendered.

## ENV (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EBAY_APP_ID=
EBAY_CERT_ID=
EBAY_OAUTH_TOKEN=
EBAY_MARKETPLACE_INSIGHTS_ENABLED=false
EPN_CAMPAIGN_ID=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=cameragrail.com
NEXT_PUBLIC_CLARITY_ID=
NEXT_PUBLIC_SITE_URL=https://cameragrail.com
```

## BUILD ORDER
1. Project setup, Tailwind theme, fonts, layout, nav, footer, UI primitive components.
2. Homepage matching CameraGrailHome.jsx exactly.
3. Supabase schema migration + RLS policies + seed script structure.
4. Camera page template + brand/format hubs + browse page + internal linking + full schema.
5. `lib/ebay.ts` service (Browse API + affiliate URL builder) + price-refresh cron + outlier logic.
6. Seed catalogue importer: accept a structured list of cameras (I will provide or you generate a starter set of ~50 well-known models with fact-checked specs), pull initial prices, publish.
7. Community submission + log-sale forms + Supabase Storage uploads.
8. Admin moderation queue (protected) + value recompute on approval.
9. Auth (magic link), account page, user collection.
10. Valuation tool + email capture + Plausible/Clarity + sitemap + Lighthouse polish.

## QUESTIONS TO ASK ME BEFORE STARTING
1. Do you have eBay Developer credentials yet, or should I build against a mock eBay service first and swap real creds in later?
2. Should I generate a starter catalogue of ~50 popular cameras with fact-checked specs to seed with, or will you provide the list?
3. Filesystem MDX or Supabase for the editorial/about content (recommend Supabase since everything else is DB-driven)?
4. Do you want the currency toggle (GBP/USD/EUR) at launch or GBP-only first?
5. Should the price-history chart show on day one (even with sparse data) or be feature-flagged until enough history accrues?

Wait for my answers, then build in order. Quality over speed.
