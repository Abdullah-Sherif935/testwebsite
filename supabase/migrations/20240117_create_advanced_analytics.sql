-- Create a table to track individual page views
create table if not exists public.page_views (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  user_agent text,
  ip_hash text, -- We store a hash, not the real IP for privacy if needed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.page_views enable row level security;

-- Policy: Everyone can insert (anonymous logging)
create policy "Anonymous insert"
  on public.page_views for insert
  with check ( true );

-- Policy: Only admins can view stats
create policy "Admins can view stats"
  on public.page_views for select
  using ( auth.role() = 'authenticated' );

-- Function to get daily stats for the graph
create or replace function public.get_daily_stats(start_date text, end_date text)
returns table (
  date date,
  count bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    date(created_at) as date,
    count(*) as count
  from page_views
  where created_at >= start_date::timestamp
  and created_at <= end_date::timestamp
  group by date(created_at)
  order by date(created_at);
end;
$$;

-- Function to get total site count (replaces old method)
create or replace function public.get_total_views()
returns bigint
language plpgsql
security definer
as $$
declare
  total bigint;
begin
  select count(*) into total from page_views;
  -- Add the old legacy count (optional, if you want to keep old stats)
  -- select total + (select total_views from site_stats where id = 1) into total;
  return total;
end;
$$;
