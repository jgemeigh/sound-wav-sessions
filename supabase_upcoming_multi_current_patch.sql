alter table public.upcoming_drafts
add column if not exists is_current boolean not null default false;

create index if not exists idx_upcoming_drafts_is_current
on public.upcoming_drafts(is_current, show_date asc);

with singleton as (
  select title, show_date, venue, address
  from public.upcoming_show
  where id = 1
    and coalesce(title, '') <> ''
)
update public.upcoming_drafts d
set is_current = true
from singleton s
where lower(trim(d.title)) = lower(trim(s.title))
  and d.show_date = s.show_date
  and lower(trim(d.venue)) = lower(trim(s.venue))
  and lower(trim(coalesce(d.address, ''))) = lower(trim(coalesce(s.address, '')));
