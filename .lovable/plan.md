## المشكلة
`styles-2s3p21Eu.css` بحجم 19.3 KiB يحجب أول عرض للصفحة لمدة ~470ms. سبب التضخم الأساسي: استيراد 6 ملفات `@fontsource` (Cairo × 4 أوزان + Tajawal × 2) داخل `src/styles.css` — كل ملف يضيف `@font-face` مع مسار woff2، فيتحول CSS إلى مورد ثقيل يوقف الرسم.

## الحل الجذري

### 1) نقل الخطوط من CSS إلى `<link>` في `<head>` (يقلص CSS ~60%)
- حذف كل أسطر `@import "@fontsource/..."` من أعلى `src/styles.css`.
- في `src/routes/__root.tsx` داخل `head().links`:
  - `preconnect` إلى `fonts.googleapis.com` و`fonts.gstatic.com` (crossorigin).
  - `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800&family=Tajawal:wght@400;500&display=swap">`.
- إزالة تبعية `@fontsource/*` من `package.json` (تقليل حجم الباندل).

### 2) Preload للـ CSS الرئيسي لتقليل الحجب
في `head().links` بـ `__root.tsx` نضيف قبل الـ `stylesheet` الحالي:
```
{ rel: "preload", as: "style", href: appCss }
```
(يبقى الـ `stylesheet` نفسه، لكن preload يبدأ التحميل مبكرًا فيقلّ زمن الحجب).

### 3) تقليم أوزان الخطوط
الاحتفاظ فقط بالأوزان المستعملة فعليًا (Cairo 700/800 للعناوين، Tajawal 400/500 للنص). كانت 6 أوزان → تصبح 5.

## النتيجة المتوقعة
- CSS ≈ 7-9 KiB بدل 19.3 KiB.
- الخطوط تُحمَّل بالتوازي مع `display=swap` (لا تحجب النص).
- تحسّن LCP/FCP بحوالي 400-800ms.

## الملفات المتأثرة
- `src/styles.css` — حذف 6 أسطر `@import`.
- `src/routes/__root.tsx` — إضافة preconnect + Google Fonts link + preload CSS.
- `package.json` — إزالة `@fontsource/cairo` و`@fontsource/tajawal`.
