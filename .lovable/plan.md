## الهدف
تمكين الزائر من تسجيل الدخول، حفظ مباريات مفضلة، واستلام تذكيرات قبل المباراة بـ24 ساعة وساعة عبر البريد + إشعار متصفح.

## المتطلبات المسبقة
- Lovable Cloud (تم تفعيلها).
- إعداد نطاق البريد (يفتح للمستخدم زر Set up email domain). سأبني كل شيء الآن، والبريد يبدأ العمل فور اعتماد النطاق.

## قاعدة البيانات
جدول `match_favorites`:
- `id`, `user_id → auth.users`, `match_id text`, `match_data jsonb` (فرق، ملعب، مجموعة)
- `kickoff_at timestamptz`
- `notify_email bool default true`, `notify_browser bool default true`
- `sent_24h bool`, `sent_1h bool`
- RLS: كل مستخدم يرى/يحرر مفضلاته فقط.

## المصادقة
- Email/Password + Google (الافتراضي في Lovable Cloud).
- صفحة `/auth` بتصميم الموقع.

## واجهة المستخدم
- زر ⭐ في كل بطاقة مباراة (`worldcup`). إذا كان الزائر غير مسجّل → توجيه لطيف إلى `/auth`.
- تبويبة جديدة `/favorites` تعرض المباريات المفضلة مع تحكم في تفعيل/تعطيل البريد والإشعارات.
- زر "تفعيل إشعارات المتصفح" يستدعي `Notification.requestPermission()`.

## إشعارات المتصفح
- عند فتح الموقع: hook يفحص كل دقيقة مفضلات المستخدم، وإذا اقتربت مباراة من (24س ± 5د) أو (1س ± 5د) وسمح المتصفح، يعرض `new Notification(...)`.
- لا service worker (يتطلب VAPID/Web Push، خارج النطاق المجاني البسيط). يعمل عندما يكون الموقع مفتوحًا في تبويب.

## البريد
- `email_domain--setup_email_infra` ثم `scaffold_transactional_email`.
- قالب `match-reminder.tsx` (شعارات المنتخبات، اسم المباراة، الوقت، الملعب، القنوات).
- server route `POST /api/public/hooks/match-reminders`: يجلب المفضلات ضمن نافذة (24س-15د إلى 24س+15د) و(1س-15د إلى 1س+15د)، يستدعي `/lovable/email/transactional/send` داخليًا، يعلّم `sent_24h`/`sent_1h`.
- pg_cron كل 15 دقيقة يستدعي المسار.

## الملفات المتوقعة
- `supabase/migrations/*` — جدول favorites + RLS.
- `src/routes/auth.tsx` — تسجيل/دخول.
- `src/routes/_authenticated/favorites.tsx` — قائمة المفضلة + إعدادات.
- `src/components/favorite-button.tsx` — زر النجمة.
- `src/hooks/use-browser-reminders.ts` — تشغيل إشعارات المتصفح.
- `src/lib/favorites.functions.ts` — server fns (add/remove/list/updatePrefs).
- `src/lib/email-templates/match-reminder.tsx` — قالب البريد.
- `src/routes/api/public/hooks/match-reminders.ts` — نقطة cron.
- تحديث `src/components/site-header.tsx` + `src/routes/worldcup.tsx`.
