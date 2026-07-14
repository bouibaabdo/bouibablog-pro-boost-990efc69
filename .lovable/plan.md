## المشاكل والحلول

### 1. حظر الرندر (940ms) — CSS + Google Fonts
- **السبب:** `<link rel="stylesheet">` للـ CSS وGoogle Fonts يحجبان الرندر.
- **الحل في `src/routes/__root.tsx`:**
  - إضافة `<link rel="preload" as="style" onload="this.rel='stylesheet'">` لخط Google (تحميل غير حاجب) مع `<noscript>` fallback.
  - تقليل أوزان الخطوط المطلوبة (حذف Cairo 800 إن لم يُستخدم) لتصغير طلب CSS.
  - إبقاء `preconnect` كما هو.

### 2. صور Blogger كبيرة (275KB زائدة)
- **السبب:** صور المقالات تُجلب من `blogger.googleusercontent.com` و `manuscdn.com` بأبعاد `1024x639` بينما تُعرض بـ `648x432`، وبدون WebP.
- **الحل في `src/components/post-card.tsx` و `src/lib/blogger.functions.ts`:**
  - تحويل روابط Blogger من `/s1600/` أو بدون مقاس إلى `/w800-h500-c-rw/` (يفرض WebP + قص + مقاس مناسب — ميزة مجانية من googleusercontent).
  - إضافة `width` و `height` و `sizes` و `srcset` للصور لتحسين CLS + LCP.
  - إضافة `loading="eager"` + `fetchPriority="high"` لأول صورة فقط.

### 3. الكاش (31KB) — تنبيه رمادي فقط
- AdSense (14 يوم ثابت من Google) و blogger.googleusercontent.com و `~flock.js`: **خارج تحكمنا**، تنبيه لا يؤثر على النقاط.
- سأترك ملاحظة فقط دون تغيير كود.

## الملفات المعدَّلة
- `src/routes/__root.tsx` — تحميل الخط بشكل غير حاجب.
- `src/lib/blogger.functions.ts` — دالة `optimizeBloggerImage(url, w, h)` لإعادة كتابة رابط الصورة.
- `src/components/post-card.tsx` — استخدام الدالة + `width`/`height`/`sizes`/`srcset`.
- (اختياري) `src/routes/index.tsx` — تمرير `priority` لأول بطاقة لتحسين LCP.

## النتيجة المتوقعة
- LCP أسرع بـ 400–800ms.
- توفير ~275KB على صور المقالات.
- اختفاء تحذير "حظر الرندر" أو انخفاضه إلى <100ms.
