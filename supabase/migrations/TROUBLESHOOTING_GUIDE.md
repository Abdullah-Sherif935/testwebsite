# 🔍 تشخيص وحل مشكلة عدم ظهور الطلبات

## المشكلة
الطلبات لا تظهر في لوحة تحكم الأدمين رغم تنفيذ SQL.

---

## 📋 خطة التشخيص (خطوة بخطوة)

### الخطوة 1: تحقق من وجود الطلبات
افتح **Supabase → SQL Editor** ونفذ:

```sql
SELECT 
    id,
    user_id,
    status,
    created_at,
    profile_data->>'full_name_ar' as name_ar
FROM public.creator_requests
ORDER BY created_at DESC;
```

**النتيجة المتوقعة:**
- ✅ إذا ظهرت سجلات → **الطلبات موجودة**، المشكلة في RLS
- ❌ إذا لم تظهر سجلات → **لم يتم إرسال الطلب أصلاً**

---

### الخطوة 2: إذا كانت النتيجة ✅ (الطلبات موجودة)

#### جرب الحل رقم 1: تعطيل RLS مؤقتاً (للاختبار فقط)
```sql
ALTER TABLE public.creator_requests DISABLE ROW LEVEL SECURITY;
```

- افتح `/admin/verification`
- لو ظهرت الطلبات → **المشكلة مؤكدة في RLS policies**

#### ثم فعّل RLS مرة أخرى:
```sql
ALTER TABLE public.creator_requests ENABLE ROW LEVEL SECURITY;
```

#### طبق الحل البديل (من ملف `ALTERNATIVE_FIX.sql`):
```sql
-- نسخ محتوى SOLUTION 1 من الملف وتنفيذه
```

---

### الخطوة 3: إذا كانت النتيجة ❌ (لا توجد طلبات)

**معنى هذا:** الطلب لم يُرسل بنجاح من جانب المستخدم.

#### التحقق من الخطأ:
1. افتح المتصفح → **F12** (Developer Tools)
2. اذهب لـ **Console**
3. حاول تقديم طلب جديد
4. راقب الأخطاء

#### الأخطاء الشائعة:
- `permission denied` → مشكلة في RLS policies للـ INSERT
- `user_id required` → المستخدم غير مسجل دخول
- `profile_data required` → السيرة الذاتية فارغة

---

## ⚡ الحل السريع (إذا كنت مستعجل)

### نفذ هذا في Supabase SQL Editor:

```sql
-- 1. تعطيل RLS مؤقتاً
ALTER TABLE public.creator_requests DISABLE ROW LEVEL SECURITY;

-- 2. تحقق من الطلبات
SELECT * FROM public.creator_requests;

-- 3. إعادة تفعيل RLS
ALTER TABLE public.creator_requests ENABLE ROW LEVEL SECURITY;

-- 4. إنشاء سياسات بسيطة جداً
DROP POLICY IF EXISTS "Allow all for admin" ON public.creator_requests;
CREATE POLICY "Allow all for admin"
  ON public.creator_requests
  FOR ALL
  USING (
    LOWER(auth.jwt() ->> 'email') = 'eng.abdullah.sherif@gmail.com'
  );

-- 5. سياسة للمستخدمين العاديين
DROP POLICY IF EXISTS "Users own requests" ON public.creator_requests;
CREATE POLICY "Users own requests"
  ON public.creator_requests
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 🎯 الحل النهائي البديل

إذا استمرت المشكلة، استخدم هذا النهج:

### بدلاً من RLS، استخدم Service Role Key

في ملف `adminSupabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // ⚠️ Service key

export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
```

**لكن:** هذا يتطلب إضافة `VITE_SUPABASE_SERVICE_ROLE_KEY` في `.env`.

⚠️ **تحذير أمني:** Service Role Key يتجاوز كل RLS - استخدمه بحذر ولا تكشفه أبداً!

---

## 📞 التواصل معي

أرسل لي:
1. نتيجة الاستعلام الأول (STEP 1)
2. أي أخطاء من Console
3. لقطة شاشة من SQL Editor بعد تنفيذ التشخيص

وسأحل المشكلة فوراً!
