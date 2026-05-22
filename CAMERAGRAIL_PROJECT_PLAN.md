# CameraGrail.com: Project Plan & Data Architecture

This document explains WHAT the project is, HOW the pricing engine works, and the build/monetisation plan. Read this first, then use the separate build prompt to start in Claude Code.

---

## 1. What this is

CameraGrail is an entity-catalogue price-guide and archive for cameras and lenses. One permanent, SEO-optimised page per camera model (film, digital, vintage, lenses). Each page answers the single most-searched question in the niche: "what is this camera worth?" plus full specs, production history, and a live link to current listings.

The business model mirrors a programmatic-SEO slot-game-page strategy: thousands of permanent entity pages, each capturing branded long-tail searches like "[model] value", "[model] price", "[model] specs", "[model] review", which individually get small traffic but aggregate into significant volume. The catalogue is the SEO moat; affiliate links and ads are the monetisation on top.

This is NOT a marketplace (no payments, no escrow, no seller onboarding liability). It is a catalogue + price guide + affiliate site, with a community-submission layer so collectors can fill gaps in the catalogue.

## 2. Why it can work (the gap)

Existing players are weak: CollectiBlend (dated, opaque pricing), Camera-wiki (no pricing), McKeown's (dying print guide of 40,000 cameras with no digital successor), Lens$db (Canon-only), UKCamera (jumbled multi-currency). Demand is huge and evergreen: "what's my camera worth" is the single most common question in vintage camera communities. No modern, clean, well-monetised, UK-GBP-first database exists.

## 3. HOW PRICING ACTUALLY WORKS (the core question)

Claude/LLMs do not know live prices, and there is no single official "camera price" API. Real camera price guides build their pricing from sold-listing data. Here is the layered approach, in priority order:

### Layer 1: eBay sold/completed listings (primary price source)
- eBay is where the majority of real camera transactions happen, so eBay SOLD prices are the truth source for "market value".
- Use the eBay Marketplace Insights API (sold items) or eBay Browse API (active listings) via the eBay Developers Program. Marketplace Insights requires an application/approval; Browse API (active listings) is freely available with a developer key.
- For each camera model, query recent sold listings, collect the sale prices, strip outliers (broken/parts vs working, body-only vs kit), then compute a condition-adjusted range (low/median/high).
- Cache results in the database. Refresh on a schedule (weekly for popular models, monthly for the long tail) via a cron job. Do NOT query live on every page load (rate limits + speed).
- Store price history over time so each page can show a trend chart (this is a key differentiator and a reason for repeat visits).

### Layer 2: eBay Partner Network affiliate links (active listings + monetisation)
- The same eBay integration powers the "See current listings" button. These are affiliate-tagged via eBay Partner Network (EPN), so clicks that convert earn commission.
- Active listings also give a secondary signal for current asking prices (not as reliable as sold, but useful for thin models).

### Layer 3: Community submissions (fills gaps + builds EEAT)
- A "Log a sale" form lets users report what they bought/sold a model for (price, condition, date, source). These submissions feed into the price calculation for models where eBay data is thin, and create the structured data Google and LLMs lack.
- A "Submit a camera" form lets users add models missing from the catalogue entirely (specs, year, maker, photos).
- Both go through a moderation queue (you approve before publish) for quality control and to learn the niche.

### Layer 4: Reverb API (optional, for higher-end / lens data)
- Reverb (owned by Etsy) has an API and is strong for higher-end cameras, lenses, and music-adjacent gear. Use as a supplementary price source and a second affiliate stream where its commissions beat eBay.

### Layer 5: Seed data (to launch with a non-empty catalogue)
- To avoid the cold-start "empty database" problem, seed the initial catalogue (specs, years, makers) from public reference data: camera-wiki content (CC-licensed, attribute properly), manufacturer archives, and Claude-generated spec sheets that you fact-check.
- Pricing for seed models comes from an initial batch eBay sold-listings pull.

### The honest constraint
- eBay's Marketplace Insights (sold data) API requires approval and has usage limits; until approved, you can launch with Browse API (active listings) + community-submitted sold prices + a manual/batch sold-data process. Plan the schema so the price source is abstracted (a `price_source` field) and you can swap/add sources without rebuilding.

## 4. Page structure (the SEO engine)

Every camera gets a page at `/camera/[brand]/[model-slug]` containing:
- H1: "[Model] Value & Price Guide ([year range])"
- Market value range (low/median/high), condition-adjusted table (mint/excellent/good/for-parts)
- Price-trend chart (from stored history)
- "See current listings" CTA (eBay Partner Network affiliate)
- Full specs table (type, format, mount, years, country, production notes)
- Production history / context (prose, 200-400 words, genuinely useful)
- Related models (same brand, same era, same format) for internal linking
- FAQ block with FAQ schema ("How much is a [model] worth?", "Is the [model] a good camera?", "When was the [model] made?")
- Community sales log for that model (approved submissions)

Brand hub pages at `/brand/[brand]` list all models, rank by value/popularity, link to every model page.
Format hub pages at `/format/[type]` (35mm SLR, rangefinder, TLR, medium format, etc).
A `/price-index` page showing trending/most-valuable cameras (the homepage already previews this).

## 5. Monetisation stack (priority order)
1. eBay Partner Network (primary): "see listings" on every page, 1-4% of sale, cameras £50-3,000.
2. Display ads (Mediavine/Raptive at ~50k sessions/month, ~£8-15 RPM hobby/tech).
3. MPB + KEH affiliate (used-camera retailers, higher trust).
4. Amazon Associates for accessories (film, batteries, straps, adapters).
5. Email capture via free valuation tool, light newsletter with affiliate placements.
6. Year 2+: premium tier (£3-5/mo: collection tracker, price alerts, full history), sponsored placements.

## 6. Realistic 12-month expectation (parallel asset, ~2-3 hrs/week)
- 300-600 catalogue pages, domain aging through Google trust period.
- 3,000-10,000 monthly visitors by month 12.
- £150-500/month (EPN + early display once Mediavine threshold hit).
- If pushed harder (1,000-2,000 pages, community submissions take off): 15,000-40,000 visitors, £600-2,000/month, sellable at 30-45x monthly profit.
- Year 2-3 is the compounding payoff: evergreen content + growing catalogue + community flywheel toward a £2-5k/month near-autopilot asset.

## 7. Tech stack
Next.js 14 (App Router, SSG for catalogue pages), TypeScript, Tailwind, Supabase (Postgres + Auth + Storage + RLS), Vercel hosting + cron, eBay APIs (Browse + Marketplace Insights), eBay Partner Network for affiliate tags, Plausible + Microsoft Clarity analytics, next-sitemap + JSON-LD schema. Claude Code as the build tool.

## 8. Build phases
- Phase 1 (wk 1-2): Next.js + Supabase schema + homepage (from CameraGrailHome.jsx) + design system.
- Phase 2 (wk 2-3): camera page template, brand/format hubs, internal linking, full schema markup.
- Phase 3 (wk 3-4): eBay Browse API integration (active listings + EPN affiliate tags), price-caching cron.
- Phase 4 (wk 4-5): seed catalogue (200-500 models) via batch import + Claude-generated spec/history, fact-checked.
- Phase 5 (wk 5-6): submission + "log a sale" forms with moderation queue; valuation tool with email capture.
- Phase 6 (wk 6+): apply for eBay Marketplace Insights (sold data); add price-history charts; SEO/Lighthouse polish; submit sitemap.
- Then: publish steadily, let it age, revisit when WarmerCoast is profitable.

## 9. Hard rules
- No em dashes anywhere in code or content (use commas, full stops, semicolons). En dashes in numeric/date ranges (1954–1966) are fine.
- Deep navy palette (#0E1A2B ink, #2D6CDF accent blue, #F7F9FC paper). No orange.
- Clean simple sans fonts (Inter body, Spline Sans headings). Nothing fancy/artistic.
- "Values are estimates from real sale data, not formal appraisals" disclaimer sitewide.
- Affiliate disclosure in footer and on listing CTAs (FTC/ASA compliance).
- Mobile-first, Core Web Vitals green, all catalogue pages statically generated for SEO.
