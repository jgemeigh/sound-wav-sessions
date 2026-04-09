insert into public.artists (
  name,
  genre,
  bio,
  instagram_url,
  spotify_url,
  soundcloud_url,
  bandcamp_url,
  website_url,
  linktree_url
)
select
  seed.name,
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
from (
  values
    ('Benjamin Gear X'),
    ('Maadcxmannder'),
    ('Kethro'),
    ('Kamakauzzy'),
    ('Madness Apparatus'),
    ('SINAI.'),
    ('Toxic Throb'),
    ('Remody'),
    ('Chill Mac'),
    ('Eliphas'),
    ('Dj Rugburn'),
    ('Revelgy'),
    ('Los from the BX'),
    ('Jay Phatty'),
    ('Antonious'),
    ('Cast off form'),
    ('Phill smith'),
    ('Dj beetlebitch'),
    ('Haunted gauntlet'),
    ('Ogi Kidd'),
    ('Flannel Lewis'),
    ('Reno'),
    ('Nick Mauer'),
    ('CRDJ'),
    ('Powerful Science'),
    ('Xavier'),
    ('Infinite Loop'),
    ('Keeran Wood'),
    ('Sener'),
    ('Alex Jacobsen'),
    ('Chemical Reactor'),
    ('Huxley Maxwell'),
    ('Static Soul'),
    ('Ahrs Ahrtis')
) as seed(name)
where not exists (
  select 1
  from public.artists existing
  where lower(trim(existing.name)) = lower(trim(seed.name))
);
