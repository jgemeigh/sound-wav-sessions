alter table public.affiliates
add column if not exists image_path text not null default '';

