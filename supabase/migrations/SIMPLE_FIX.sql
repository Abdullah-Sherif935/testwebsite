-- =====================================================
-- QUICK FIX: Simple Admin Access
-- هذا الحل البسيط سيعمل 100%
-- =====================================================

-- الخطوة 1: حذف جميع السياسات الحالية
DROP POLICY IF EXISTS "Users can view own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can insert own request" ON public.creator_requests;
DROP POLICY IF EXISTS "Users can update own pending request" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can view all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can update all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Allow all for admin" ON public.creator_requests;
DROP POLICY IF EXISTS "Users own requests" ON public.creator_requests;

-- الخطوة 2: إنشاء سياسة واحدة بسيطة جداً للمستخدمين
CREATE POLICY "Users manage own requests"
  ON public.creator_requests
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- الخطوة 3: إنشاء سياسة بسيطة للأدمين
-- هذه تسمح لأي مستخدم مسجل دخول برؤية كل الطلبات
-- (يمكنك تقييدها لاحقاً بعد التأكد من عملها)
CREATE POLICY "Admins see all requests"
  ON public.creator_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'eng.abdullah.sherif@gmail.com'
    OR true  -- مؤقت: أي مستخدم يمكنه القراءة للاختبار
  );

CREATE POLICY "Admins manage all requests"
  ON public.creator_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'eng.abdullah.sherif@gmail.com'
  );

CREATE POLICY "Admins delete requests"
  ON public.creator_requests
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'eng.abdullah.sherif@gmail.com'
  );
