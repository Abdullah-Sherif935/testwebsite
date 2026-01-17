-- Create a table for contact messages
create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Policy: Anyone can insert messages (public contact form)
create policy "Anyone can insert contact messages"
  on public.contact_messages for insert
  with check ( true );

-- Policy: Only authenticated admins can read/update messages
create policy "Admins can view/manage contact messages"
  on public.contact_messages for select
  using ( auth.role() = 'authenticated' );

create policy "Admins can update contact messages"
  on public.contact_messages for update
  using ( auth.role() = 'authenticated' );
