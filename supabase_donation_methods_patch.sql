create table if not exists public.donation_methods (
  id uuid primary key default gen_random_uuid(),
  label text not null default '',
  handle text not null default '',
  url text not null default '',
  note text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_donation_methods_sort_order
on public.donation_methods(sort_order, created_at desc);

alter table public.donation_methods enable row level security;

drop trigger if exists trg_donation_methods_updated_at on public.donation_methods;
create trigger trg_donation_methods_updated_at before update on public.donation_methods
for each row execute function public.set_updated_at();

drop policy if exists "public read donation_methods" on public.donation_methods;
create policy "public read donation_methods"
on public.donation_methods for select using (true);

drop policy if exists "authenticated manage donation_methods" on public.donation_methods;
create policy "authenticated manage donation_methods"
on public.donation_methods for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

insert into public.donation_methods (label, handle, url, note, sort_order)
select * from (
  values
    ('Venmo', '@soundwavsessions', 'https://venmo.com/soundwavsessions', 'Direct support for artists and room costs.', 0),
    ('Cash App', '$soundwavsessions', 'https://cash.app/$soundwavsessions', 'Help fund flyers, visuals, and backline.', 1),
    ('PayPal', 'paypal.me/soundwavsessions', 'https://paypal.me/soundwavsessions', 'One-time support from near or far.', 2),
    ('Zelle', 'soundwavsessions@email.com', 'mailto:soundwavsessions@email.com', 'Direct transfer for community support.', 3)
) as seed(label, handle, url, note, sort_order)
where not exists (select 1 from public.donation_methods);
