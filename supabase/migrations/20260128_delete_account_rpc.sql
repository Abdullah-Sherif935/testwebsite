-- Function to allow users to delete their own account
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The CASCADE constraint on user_profiles.user_id will handle profile deletion
  -- The CASCADE on articles.user_id will handle article deletion
  delete from auth.users where id = auth.uid();
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.delete_own_account() to authenticated;
