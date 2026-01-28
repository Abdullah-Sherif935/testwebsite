-- 1. Add column to track last name change (default to allow immediate change)
alter table public.user_profiles 
add column if not exists last_name_update timestamp with time zone default (now() - interval '30 days');

-- 2. Function to Propagate Name Change to All Articles
create or replace function public.sync_author_name_to_articles()
returns trigger
language plpgsql
security definer
as $$
declare
  new_name text;
begin
  -- Check if name changed
  if (new.full_name_ar is distinct from old.full_name_ar) or (new.full_name_en is distinct from old.full_name_en) then
      
      -- Determine the name to use (Logic: Arabic > English)
      new_name := coalesce(new.full_name_ar, new.full_name_en);
      
      if new_name is not null then
          -- Update all articles belonging to this user
          update public.articles
          set author_name = new_name
          where user_id = new.id;
      end if;
      
      -- Update the timestamp of change
      -- We do this via another update or just let the client set it? 
      -- Better to set it here IF it wasn't set by client.
      -- BUT this is an AFTER trigger. We can't update NEW.
      -- So client must set 'last_name_update' or we use a BEFORE trigger.
  end if;
  return new;
end;
$$;

-- 3. Trigger
drop trigger if exists on_profile_name_change on public.user_profiles;
create trigger on_profile_name_change
after update on public.user_profiles
for each row execute function public.sync_author_name_to_articles();
