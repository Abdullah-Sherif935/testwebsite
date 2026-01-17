-- Function to get device stats
create or replace function public.get_device_stats()
returns table (
  device_type text,
  count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    case 
      when user_agent ilike '%mobile%' then 'Mobile'
      else 'Desktop'
    end as device_type,
    count(*) as count
  from page_views
  group by 1
  order by 2 desc;
end;
$$;

-- Function to get top pages
create or replace function public.get_top_pages(limit_count int default 5)
returns table (
  path text,
  count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    page_views.path,
    count(*) as count
  from page_views
  group by page_views.path
  order by 2 desc
  limit limit_count;
end;
$$;
