alter table public.upcoming_show
add column if not exists draft_id uuid references public.upcoming_drafts(id) on delete set null;

create index if not exists upcoming_show_draft_id_idx
on public.upcoming_show(draft_id);

update public.upcoming_show u
set draft_id = d.id
from public.upcoming_drafts d
where u.id = 1
  and u.draft_id is null
  and lower(trim(coalesce(u.title, ''))) = lower(trim(coalesce(d.title, '')))
  and coalesce(u.show_date, date '0001-01-01') = coalesce(d.show_date, date '0001-01-01')
  and lower(trim(coalesce(u.venue, ''))) = lower(trim(coalesce(d.venue, '')))
  and lower(trim(coalesce(u.address, ''))) = lower(trim(coalesce(d.address, '')));
