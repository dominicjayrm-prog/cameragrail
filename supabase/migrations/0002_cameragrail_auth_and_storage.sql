-- Auth + Storage additions for the community/moderation phase.
-- Already applied to the live project via the Supabase MCP tool.

-- Auto-create a cameragrail.profiles row whenever a new auth user appears.
create or replace function cameragrail.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = cameragrail, public
as $$
begin
  insert into cameragrail.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists cameragrail_on_auth_user_created on auth.users;
create trigger cameragrail_on_auth_user_created
  after insert on auth.users
  for each row execute function cameragrail.handle_new_user();

-- Public Storage bucket for submission photos. 5MB cap, image MIME types.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submission-photos',
  'submission-photos',
  true,
  5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "anyone can read submission photos"
  on storage.objects for select
  using (bucket_id = 'submission-photos');

create policy "authenticated users can upload submission photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'submission-photos');

create policy "users can update their own submission photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'submission-photos' and owner = auth.uid())
  with check (bucket_id = 'submission-photos' and owner = auth.uid());

create policy "users can delete their own submission photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'submission-photos' and owner = auth.uid());
