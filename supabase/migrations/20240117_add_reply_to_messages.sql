-- Add reply column to track what was sent
alter table public.contact_messages 
add column if not exists reply_text text,
add column if not exists replied_at timestamp with time zone;
