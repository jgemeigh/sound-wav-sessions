create table if not exists public.newsletter_signup_events (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  status text not null default 'received',
  error text,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

alter table public.newsletter_signup_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'newsletter_signup_events'
      and policyname = 'authenticated read newsletter signup events'
  ) then
    create policy "authenticated read newsletter signup events"
      on public.newsletter_signup_events
      for select
      to authenticated
      using (true);
  end if;
end $$;
