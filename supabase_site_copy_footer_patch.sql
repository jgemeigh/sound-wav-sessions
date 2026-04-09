alter table public.site_copy
add column if not exists footer_copy text not null default '',
add column if not exists footer_link_label text not null default 'Back to top';

update public.site_copy
set
  footer_copy = case
    when coalesce(footer_copy, '') = '' then 'SOUND.WAV SESSIONS archives sound, movement, and the nights that make a city feel alive.'
    else footer_copy
  end,
  footer_link_label = case
    when coalesce(footer_link_label, '') = '' then 'Back to top'
    else footer_link_label
  end
where id = 1;
