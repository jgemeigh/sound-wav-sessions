-- Existing accounts were provisioned through the retired admin bootstrap function.
-- Mark them with server-controlled metadata before narrowing the policies.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
where coalesce((raw_app_meta_data->>'is_admin')::boolean, false) = false;

do $$
declare
  table_name text;
  managed_tables text[] := array[
    'affiliates',
    'artist_images',
    'artist_submissions',
    'artists',
    'donation_methods',
    'newsletters',
    'show_artists',
    'show_media',
    'shows',
    'site_copy',
    'subscribers',
    'upcoming_draft_artists',
    'upcoming_drafts',
    'upcoming_show',
    'upcoming_show_artists'
  ];
begin
  foreach table_name in array managed_tables loop
    execute format('drop policy if exists %I on public.%I', 'authenticated manage ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (coalesce((auth.jwt()->''app_metadata''->>''is_admin'')::boolean, false)) with check (coalesce((auth.jwt()->''app_metadata''->>''is_admin'')::boolean, false))',
      'admins manage ' || table_name,
      table_name
    );
  end loop;
end $$;

drop policy if exists "authenticated read newsletter signup events" on public.newsletter_signup_events;
create policy "admins read newsletter signup events"
on public.newsletter_signup_events for select to authenticated
using (coalesce((auth.jwt()->'app_metadata'->>'is_admin')::boolean, false));

drop policy if exists "public read upcoming_drafts" on public.upcoming_drafts;
drop policy if exists "public read upcoming_draft_artists" on public.upcoming_draft_artists;

drop policy if exists "public read newsletters" on public.newsletters;
create policy "public read current newsletter"
on public.newsletters for select to anon, authenticated
using (is_current = true);

-- Public writes go through validating Edge Functions, not directly through PostgREST.
drop policy if exists "public insert subscribers" on public.subscribers;
drop policy if exists "public update own subscriber rows" on public.subscribers;
drop policy if exists "public insert artist submissions" on public.artist_submissions;

drop policy if exists "authenticated upload storage" on storage.objects;
drop policy if exists "authenticated update storage" on storage.objects;
drop policy if exists "authenticated delete storage" on storage.objects;

create policy "admins upload soundwav media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'soundwav-media'
  and coalesce((auth.jwt()->'app_metadata'->>'is_admin')::boolean, false)
);

create policy "admins update soundwav media"
on storage.objects for update to authenticated
using (
  bucket_id = 'soundwav-media'
  and coalesce((auth.jwt()->'app_metadata'->>'is_admin')::boolean, false)
)
with check (
  bucket_id = 'soundwav-media'
  and coalesce((auth.jwt()->'app_metadata'->>'is_admin')::boolean, false)
);

create policy "admins delete soundwav media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'soundwav-media'
  and coalesce((auth.jwt()->'app_metadata'->>'is_admin')::boolean, false)
);

alter function public.set_updated_at() set search_path = '';
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
