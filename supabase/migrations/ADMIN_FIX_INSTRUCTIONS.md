# إصلاح مشكلة عدم ظهور طلبات التوثيق للأدمين

## المشكلة
عند تقديم طلب توثيق من المستخدم، لا يظهر في لوحة تحكم الأدمين بسبب قيود الحماية (RLS).

## الحل السريع ⚡

### الخطوة 1: معرفة بريدك الإلكتروني الأدمين
تأكد من أنك تعرف البريد الإلكتروني الذي تستخدمه كأدمين.

### الخطوة 2: تنفيذ الـ SQL التالي في Supabase
1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. انسخ والصق الكود التالي، **ولكن استبدل `your_admin_email@example.com` ببريدك الإلكتروني الفعلي**:

```sql
-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Admin can view all requests" ON public.creator_requests;
DROP POLICY IF EXISTS "Admin can update all requests" ON public.creator_requests;

-- السماح للأدمين بمشاهدة جميع الطلبات
CREATE POLICY "Admin can view all requests"
  ON public.creator_requests FOR SELECT
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'your_admin_email@example.com'
  );

-- السماح للأدمين بتعديل جميع الطلبات (موافقة/رفض)
CREATE POLICY "Admin can update all requests"
  ON public.creator_requests FOR UPDATE
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'your_admin_email@example.com'
  );
```

### الخطوة 3: استبدل البريد الإلكتروني
**مهم جداً:** في السطور التي تحتوي على `'your_admin_email@example.com'`، استبدل هذا النص ببريدك الإلكتروني الحقيقي.

مثال:
```sql
= 'admin@mywebsite.com'  -- بدلاً من 'your_admin_email@example.com'
```

### الخطوة 4: تنفيذ الكود
اضغط على "Run" أو "Execute" في SQL Editor.

### الخطوة 5: التحديث
1. ارجع للوحة التحكم `/admin/verification`
2. اعمل Refresh للصفحة
3. ستظهر الطلبات الآن! ✅

## ملاحظات مهمة
- تأكد أن البريد الإلكتروني المستخدم في SQL **يطابق تماماً** البريد المستخدم في `.env` (في `VITE_ADMIN_EMAIL`)
- الحروف الكبيرة والصغيرة مهمة
- لا تنسى علامات الاقتباس المفردة `'` حول البريد الإلكتروني

## تحقق من نجاح التنفيذ
بعد تنفيذ الـ SQL، يمكنك التحقق بالذهاب إلى:
1. Database → Tables → `creator_requests`
2. Policies → يجب أن ترى السياسات الجديدة

---

## حل بديل (إذا لم ينجح الأول)

إذا استمرت المشكلة، يمكنك استخدام هذا الحل المؤقت الذي يسمح لأي مستخدم مسجل برؤية جميع الطلبات:

```sql
DROP POLICY IF EXISTS "Admin can view all requests" ON public.creator_requests;
CREATE POLICY "Admin can view all requests"
  ON public.creator_requests FOR SELECT
  USING (auth.role() = 'authenticated');
```

**تحذير:** هذا الحل غير آمن ويجب استخدامه للتجربة فقط!
