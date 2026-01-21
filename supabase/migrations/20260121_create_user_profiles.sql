-- Create user_profiles table for comprehensive CV/Professional Profile data
-- This extends the basic profile with detailed educational and professional information

create table if not exists public.user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  
  -- Personal Information
  full_name_ar text,
  full_name_en text,
  birth_date date,
  governorate text,
  
  -- Education
  education_status text check (education_status in ('student', 'graduate')),
  university text,
  faculty text,
  department text,
  
  -- Professional Data (JSONB for flexibility)
  projects jsonb default '[]'::jsonb,  -- Array of {title, description, link}
  experiences jsonb default '[]'::jsonb,  -- Array of {title, company, description, from, to}
  skills text[] default array[]::text[],  -- Array of skill strings
  
  -- About & Links
  about_me text,
  linkedin_url text,
  
  -- CV File Upload
  cv_file_url text,
  cv_file_name text,
  cv_file_size bigint,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on user_id for faster lookups
create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;

-- RLS Policies
-- Users can view their own profile
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- Users can delete their own profile
create policy "Users can delete own profile"
  on public.user_profiles for delete
  using (auth.uid() = user_id);

-- Create storage bucket for CV PDFs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cv-uploads',
  'cv-uploads',
  false,  -- Private bucket
  5242880,  -- 5MB max file size
  array['application/pdf']  -- Only PDF files
)
on conflict (id) do nothing;

-- Storage Policies for cv-uploads bucket
-- Users can upload to their own folder
create policy "Users can upload own CV"
  on storage.objects for insert
  with check (
    bucket_id = 'cv-uploads' 
    and auth.uid()::text = (storage.foldername(name))[1]
    and auth.role() = 'authenticated'
  );

-- Users can view their own CV files
create policy "Users can view own CV"
  on storage.objects for select
  using (
    bucket_id = 'cv-uploads' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own CV files
create policy "Users can update own CV"
  on storage.objects for update
  using (
    bucket_id = 'cv-uploads' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own CV files
create policy "Users can delete own CV"
  on storage.objects for delete
  using (
    bucket_id = 'cv-uploads' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger set_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();
