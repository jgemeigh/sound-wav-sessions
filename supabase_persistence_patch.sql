alter table public.shows
add column if not exists address text not null default '';

alter table public.newsletters
add column if not exists is_current boolean not null default false;

create table if not exists public.upcoming_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  show_date date not null,
  venue text not null default '',
  address text not null default '',
  description text not null default '',
  rsvp_link text not null default '',
  banner_path text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.upcoming_draft_artists (
  id uuid primary key default gen_random_uuid(),
  upcoming_draft_id uuid not null references public.upcoming_drafts(id) on delete cascade,
  artist_name text not null,
  sort_order integer not null default 0
);

create index if not exists idx_upcoming_drafts_show_date
on public.upcoming_drafts(show_date desc);

create index if not exists idx_upcoming_draft_artists_draft_id
on public.upcoming_draft_artists(upcoming_draft_id, sort_order);

drop trigger if exists trg_upcoming_drafts_updated_at on public.upcoming_drafts;
create trigger trg_upcoming_drafts_updated_at
before update on public.upcoming_drafts
for each row execute function public.set_updated_at();

alter table public.upcoming_drafts enable row level security;
alter table public.upcoming_draft_artists enable row level security;

drop policy if exists "authenticated manage upcoming_drafts" on public.upcoming_drafts;
create policy "authenticated manage upcoming_drafts"
on public.upcoming_drafts
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "authenticated manage upcoming_draft_artists" on public.upcoming_draft_artists;
create policy "authenticated manage upcoming_draft_artists"
on public.upcoming_draft_artists
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "public read upcoming_drafts" on public.upcoming_drafts;
create policy "public read upcoming_drafts"
on public.upcoming_drafts
for select
using (true);

drop policy if exists "public read upcoming_draft_artists" on public.upcoming_draft_artists;
create policy "public read upcoming_draft_artists"
on public.upcoming_draft_artists
for select
using (true);

update public.newsletters
set is_current = true
where id = (
  select id
  from public.newsletters
  order by created_at desc
  limit 1
)
and not exists (
  select 1 from public.newsletters where is_current = true
);
