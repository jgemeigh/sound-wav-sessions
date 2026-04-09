select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and table_name='subscribers'
order by ordinal_position;
