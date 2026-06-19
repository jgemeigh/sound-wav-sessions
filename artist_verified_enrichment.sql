update public.artists
set genre = 'Sound art / experimental',
    bio = 'Alex Jacobsen is a sound artist based in Omaha, Nebraska, whose audio work focuses on the plasticity of sound and on connecting listeners with environments and situations outside ordinary temporal-spatial experience.'
where lower(name) = 'alex jacobsen';

update public.artists
set genre = 'Experimental / dark ambient / drone / noise',
    bio = 'Sener is a sound artist, art researcher, and producer from Silao, Mexico, now based in Omaha, Nebraska, with more than a decade of work in post-digital art and experimental electronic sound.'
where lower(name) = 'sener';

update public.artists
set genre = 'Boom bap / hip-hop / soul-inflected beats',
    bio = 'Static Soul is an Omaha-based MC and producer, originally from Lincoln, whose work centers on boom bap rhythms, soul samples, chopped records, and drum-forward production.'
where lower(name) = 'static soul';
