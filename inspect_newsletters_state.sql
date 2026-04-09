select id::text, subject, is_current, sent_at, recipients_count
from public.newsletters
order by created_at desc;
