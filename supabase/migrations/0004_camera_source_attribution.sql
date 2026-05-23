-- Source attribution + external ID tracking for the catalogue.
-- Already applied via the Supabase MCP tool.

alter table cameragrail.cameras
  add column if not exists source_url text,
  add column if not exists source_attribution text,
  add column if not exists source_license text,
  add column if not exists external_ids jsonb default '{}'::jsonb;

comment on column cameragrail.cameras.source_url is
  'Canonical reference URL for the primary data source (Wikidata, Camera-wiki, etc.). Rendered as a "source" link at the bottom of the public page.';
comment on column cameragrail.cameras.source_attribution is
  'Human-readable attribution string for license compliance (e.g. "Camera-wiki.org contributors").';
comment on column cameragrail.cameras.source_license is
  'License identifier (CC0, CC-BY-SA-3.0, etc.) the source was redistributed under.';
comment on column cameragrail.cameras.external_ids is
  'Map of external IDs keyed by source, e.g. {"wikidata": "Q12345"}. Used to deduplicate on re-import.';

create index if not exists cameras_external_ids_wikidata_idx
  on cameragrail.cameras ((external_ids->>'wikidata'));
