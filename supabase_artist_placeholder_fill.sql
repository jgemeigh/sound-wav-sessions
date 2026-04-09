update public.artists
set
  genre = case
    when coalesce(trim(genre), '') = '' then 'TBD'
    else genre
  end,
  bio = case
    when coalesce(trim(bio), '') = '' then 'Sound.Wav artist profile coming soon.'
    else bio
  end,
  updated_at = now()
where
  coalesce(trim(genre), '') = ''
  or coalesce(trim(bio), '') = '';

insert into public.artist_images (artist_id, storage_path, sort_order)
select
  a.id,
  'placeholder://artist',
  0
from public.artists a
where not exists (
  select 1
  from public.artist_images ai
  where ai.artist_id = a.id
);
