alter table public.newsletters
  add column if not exists broadcast_locked_at timestamptz,
  add column if not exists broadcast_started_at timestamptz;

-- A saved send/lock cannot be cleared through an old admin client.
create or replace function public.preserve_newsletter_broadcast_lock()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.sent_at is not null then new.sent_at := old.sent_at; end if;
  if old.broadcast_locked_at is not null then new.broadcast_locked_at := old.broadcast_locked_at; end if;
  if old.broadcast_started_at is not null then new.broadcast_started_at := old.broadcast_started_at; end if;
  return new;
end;
$$;
revoke all on function public.preserve_newsletter_broadcast_lock() from public;
create trigger preserve_newsletter_broadcast_lock
before update on public.newsletters
for each row execute function public.preserve_newsletter_broadcast_lock();
