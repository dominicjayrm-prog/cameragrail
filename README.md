# CameraGrail

The price guide and archive for every camera ever made. Built on Next.js 14
App Router, Supabase, and a clean entity-catalogue SEO model. See
[CAMERAGRAIL_PROJECT_PLAN.md](./CAMERAGRAIL_PROJECT_PLAN.md) for the full
strategy and [CAMERAGRAIL_BUILD_PROMPT.md](./CAMERAGRAIL_BUILD_PROMPT.md) for
the original build brief.

## What is here (phases 1 to 4)

- Next.js 14 App Router project with TypeScript strict mode and Tailwind CSS
- Inter + Spline Sans fonts via next/font/google
- Homepage matching `CameraGrailHome.jsx`, ported to Tailwind
- Camera detail pages at `/camera/[brand]/[model]` with full schema, condition
  table, price-history chart (feature-flagged), affiliate CTA, FAQ, related
  models, and JSON-LD (Product, BreadcrumbList, FAQPage)
- Brand hubs at `/brand/[brand]` and brand index at `/brand`
- Format hubs at `/format/[format]`
- Browse page at `/browse` with brand + format filters and free-text search
- Price index at `/price-index`
- Editorial pages: about, how-values-work, contact, privacy, terms, disclaimer
- Stub pages for submit, log-sale, value-my-camera, account (Phase 5+)
- GBP / USD / EUR currency toggle with cookie persistence
- Supabase schema isolated in a dedicated `cameragrail` schema with RLS on
- Mock eBay service (`lib/ebay.ts`) with affiliate URL builder, ready to swap
  for real Browse + Marketplace Insights credentials
- Dynamic sitemap and robots.txt

## What is not here yet (later phases)

- Community submission forms and moderation queue (Phase 5)
- Magic-link auth and account / collection pages (Phase 9)
- Vercel cron + price refresh job (Phase 3)
- Marketplace Insights wiring (Phase 6, behind a feature flag)

## Running locally

1. Install dependencies.
   ```bash
   npm install
   ```
2. Copy the env template and fill in keys.
   ```bash
   cp .env.example .env.local
   ```
   The Supabase URL and publishable anon key are pre-filled. You still need
   `SUPABASE_SERVICE_ROLE_KEY` for the seed script and any server-side
   operations that bypass RLS.
3. Start the dev server.
   ```bash
   npm run dev
   ```
   The app renders with the bundled seed catalogue out of the box. Once you
   run the seed script, it reads from Supabase instead.

## Expose the schema

CameraGrail lives under the `cameragrail` Postgres schema so it does not
interfere with anything else in this Supabase project. For the Supabase
client to query it via PostgREST you need to expose the schema. In the
Supabase dashboard, go to **Settings → API → Exposed schemas** and add
`cameragrail` to the list. Save. The Next.js client is already configured
with `db: { schema: 'cameragrail' }`.

## Seeding the catalogue

Once the schema is exposed and `SUPABASE_SERVICE_ROLE_KEY` is set, populate
the live database with the curated starter catalogue:

```bash
npx tsx scripts/seed.ts
```

This inserts ten well-known models with fact-checked specs, condition
ranges, and twelve months of synthesised price history per model. The
imported rows are clearly marked `price_source = 'manual'` so you can
replace them with API-driven values once eBay credentials are wired in.

## eBay integration

`src/lib/ebay.ts` abstracts the price source behind one interface:

- `getActiveListings(query)` returns current eBay listings.
- `getSoldListings(query)` returns recent sold listings, gated behind the
  `EBAY_MARKETPLACE_INSIGHTS_ENABLED` flag because the Insights API requires
  application approval.
- `buildAffiliateUrl(itemUrl)` appends EPN campaign tags to any outbound link.
- `buildSearchUrl(query)` constructs a pre-filtered eBay search URL with
  affiliate tagging for the "see current listings" CTA.

When `EBAY_APP_ID` or `EBAY_OAUTH_TOKEN` are missing the service returns
deterministic mock data so the catalogue still renders. Set `EBAY_USE_MOCK=false`
and provide real credentials to switch to live data.

## Design system

Palette and typography match the spec in `CAMERAGRAIL_PROJECT_PLAN.md`
section 9.

- navy `#0E1A2B`, navy2 `#16263D`
- blue `#2D6CDF`, blue-soft `#5B8DEF`
- paper `#F7F9FC`, ink `#0E1A2B`, slate `#5A6B82`, line `#E4EAF2`
- success `#1F8A55`, down `#C24536`
- Fonts: Inter (body), Spline Sans (headings)

No orange anywhere. No em dashes anywhere in copy.

## Project layout

```
src/
  app/                  Next.js routes
  components/           Reusable UI primitives
  lib/                  Data access, eBay service, currency, schema helpers
  styles/               Fonts and global CSS
supabase/migrations/    SQL source of truth for the schema
scripts/seed.ts         Seed-catalogue importer
```
