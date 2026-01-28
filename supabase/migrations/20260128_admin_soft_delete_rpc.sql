-- 1. Fix Database Constraint (Allow 'deleted_by_admin' status)
do $$
begin
    -- Handle ENUM type if exists
    if exists (select 1 from pg_type where typname = 'article_status') then
        alter type article_status add value if not exists 'deleted_by_admin';
    end if;

    -- Handle Check Constraint
    if exists (select 1 from pg_constraint where conname = 'articles_status_check') then
        alter table public.articles drop constraint articles_status_check;
    end if;
end $$;

-- Re-Apply Constraint with new allowed value (Only if column allows it, won't duplicate if Enum handles it)
-- We add 'IF NOT EXISTS' logic by catching error or just relying on the fact that we dropped it above.
-- However, if it's an Enum column, adding a Check constraint is fine (status IN ...) 
-- but we must ensure the TEXT value matches.
alter table public.articles add constraint articles_status_check 
    check (status in ('draft', 'published', 'deleted_by_admin'));

-- 2. Create/Update the Soft Delete Function
create or replace function public.admin_soft_delete_article(target_article_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.articles
    set status = 'deleted_by_admin',
        moderation_status = 'rejected',
        moderation_note = 'تم حذف المقال من قبل الإدارة بعد النشر.'
    where id = target_article_id;
end;
$$;

-- 3. Grant Permissions
grant execute on function public.admin_soft_delete_article(uuid) to authenticated;
