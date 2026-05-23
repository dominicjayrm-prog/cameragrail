-- Bulk-upsert helper for Wikidata / Camera-wiki imports.
-- Already applied via the Supabase MCP tool.
--
-- Accepts a jsonb array of compact records and upserts each into
-- cameragrail.cameras. source_url and source_attribution are derived from
-- the Wikidata Q-id (w field) so the payload stays small.

create or replace function cameragrail.bulk_upsert_cameras(payload jsonb)
returns integer
language plpgsql
security definer
set search_path = cameragrail, public
as $$
declare
  rec jsonb;
  n int := 0;
  wd_id text;
begin
  for rec in select * from jsonb_array_elements(payload) loop
    wd_id := rec->>'w';
    insert into cameragrail.cameras (
      slug, brand, brand_slug, model, format, format_slug,
      year_start, year_end, country, mount, history,
      price_source, published,
      source_url, source_attribution, source_license, external_ids
    ) values (
      rec->>'s', rec->>'b', rec->>'bs', rec->>'m', rec->>'f', rec->>'fs',
      nullif(rec->>'ys','')::int, nullif(rec->>'ye','')::int,
      nullif(rec->>'c',''), nullif(rec->>'mt',''), nullif(rec->>'h',''),
      'manual', true,
      'https://www.wikidata.org/wiki/' || wd_id,
      'Wikidata (' || wd_id || ')',
      'CC0',
      jsonb_build_object('wikidata', wd_id)
    )
    on conflict (slug) do update set
      brand=excluded.brand, brand_slug=excluded.brand_slug,
      model=excluded.model, format=excluded.format, format_slug=excluded.format_slug,
      year_start=coalesce(excluded.year_start, cameragrail.cameras.year_start),
      year_end=coalesce(excluded.year_end, cameragrail.cameras.year_end),
      country=coalesce(excluded.country, cameragrail.cameras.country),
      mount=coalesce(excluded.mount, cameragrail.cameras.mount),
      history=coalesce(excluded.history, cameragrail.cameras.history),
      source_url=excluded.source_url, source_attribution=excluded.source_attribution,
      source_license=excluded.source_license, external_ids=excluded.external_ids,
      updated_at=now();
    n := n + 1;
  end loop;
  return n;
end;
$$;
