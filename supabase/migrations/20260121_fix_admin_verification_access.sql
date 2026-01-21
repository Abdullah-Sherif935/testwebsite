-- Fix: Allow admin to view all verification requests
-- Execute this in Supabase SQL Editor

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Admin can view all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can update all requests" ON public.creator_requests;

-- السماح للأدمين بمشاهدة جميع الطلبات
-- Using auth.jwt() to get user email from JWT token
CREATE POLICY "Admin can view all requests"
  ON public.creator_requests FOR SELECT
  USING (
    (auth.jwt() ->> 'email') = 'eng.abdullah.sherif@gmail.com'
  );

-- السماح للأدمين بتعديل جميع الطلبات (موافقة/رفض)
CREATE POLICY "Admin can update all requests"
  ON public.creator_requests FOR UPDATE
  USING (
    (auth.jwt() ->> 'email') = 'eng.abdullah.sherif@gmail.com'
  );
