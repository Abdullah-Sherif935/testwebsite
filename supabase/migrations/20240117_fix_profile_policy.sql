-- Allow authenticated users to INSERT into the profile table
-- This is necessary for UPSERT operations even if the row exists, 
-- and definitely needed if the row (id=1) does not exist yet.

create policy "Authenticated users can insert profile"
on public.profile for insert
with check ( auth.role() = 'authenticated' );

-- Ensure the initial row exists (optional, but good for safety)
insert into public.profile (id, cv_url)
values (1, null)
on conflict (id) do nothing;
