-- Add archiving and soft-delete columns
alter table public.contact_messages 
add column if not exists is_archived boolean default false,
add column if not exists is_deleted boolean default false,
add column if not exists deleted_at timestamp with time zone;
