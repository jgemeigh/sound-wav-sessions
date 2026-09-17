drop trigger if exists preserve_newsletter_broadcast_lock on public.newsletters;
drop function if exists public.preserve_newsletter_broadcast_lock();
-- Completed sends from the previous implementation are not manual locks.
update public.newsletters set broadcast_started_at = null where sent_at is not null;
