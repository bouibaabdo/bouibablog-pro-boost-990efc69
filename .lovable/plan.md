## المشكل
CLS = 0.645 (سيء جداً). التشخيص من التقارير السابقة يشير إلى مصدرين أساسيين:

1. **رايل المباريات** (`TodayMatchesRail`) على الصفحة الرئيسية — يظهر بعد fetch من Yalladown (~1-3 ثواني) ويدفع كل ما تحته للأسفل رغم skeleton الحالي.
2. **الخطوط (Cairo/Tajawal)** — رغم إضافة `Cairo-fallback`/`Tajawal-fallback` بـ `size-adjust`، القيم تخمينية وقد لا تطابق ميتريكس الخطوط الفعلية، فيبقى shift على العناوين الكبيرة (h1, h2).
3. **إعلانات AdSense** (`adsbygoogle.js`) — تحقن iframes بدون مقاس محجوز في أي مكان يظهر فيه الإعلان.
4. **الصور من طرف ثالث** (yalladown badges 40×40) — width/height مضاف لكن الحاوية نفسها قد تتغير.

## الخطوات

### 1. حجز مساحة ثابتة للـ TodayMatchesRail بدل الاعتماد على skeleton conditional
- إزالة `if (yd.isLoading) return skeleton` وجعل الرايل يحتفظ بارتفاعه دائماً عبر `min-h-[280px]` على `<section>`.
- Skeleton يظهر داخل نفس الحاوية بنفس الأبعاد.
- عند `!matches.length` يبقى العنصر مخفياً بـ CSS (`visibility: hidden`) بدلاً من `return null` **فقط** إذا الـ query نجح وأرجع فارغاً — لتجنب shift عند تأخر fetch.
- بديل أبسط: إخفاء الرايل كلياً حتى `yd.isFetched`، وحجز placeholder بارتفاع 280px قبل ذلك.

### 2. ضبط ميتريكس الـ fallback fonts بدقة
- استخدام قيم مقاسة من [fontsource metrics](https://github.com/fontsource/font-fallbacks) أو أداة Automatic Font Matching:
  - Tajawal (Arabic): `size-adjust: 100%`, `ascent-override: 100%`, `descent-override: 47%`, `line-gap-override: 0%`
  - Cairo: `size-adjust: 108%`, `ascent-override: 97%`, `descent-override: 35%`
- التحقق البصري باستعمال Playwright: قياس ارتفاع h1 قبل/بعد swap.

### 3. حجز مساحة إعلانات AdSense
- إذا كانت هناك `<ins class="adsbygoogle">` في الصفحة، إعطاؤها `min-height` صريح (250px مثلاً).
- إذا الإعلانات auto (`data-ad-format="auto"`) تحقن iframes ديناميكياً في نهاية `<body>` — التحقق من عدم وجود `ins` غير محجوز.

### 4. حجز مساحة `PostCard` featured
- الصورة عندها width/height لكن الحاوية `aspect-[16/9]` قد تنكسر أثناء تحميل الخطوط — التحقق.

### 5. Categories section (labels)
- `{labels.length > 0 && ...}` — إذا `labels` تصل بعد hydration، السيكشن يظهر فجأة. لكن `useSuspenseQuery` مع loader `ensureQueryData` يعني البيانات جاهزة قبل render — آمن.

### 6. Stats section
- نفس الشيء: مدفوع من `data.total` — آمن مع suspense.

## الملفات المعدَّلة
- `src/components/today-matches-rail.tsx` — دائماً يحجز `min-h-[280px]`، skeleton داخلي.
- `src/critical.css` — تحديث override values لـ Cairo/Tajawal بقيم مقاسة.
- التحقق من `src/routes/__root.tsx` — إذا كانت هناك `<ins>` AdSense في layout، إضافة min-height.

## التحقق
- Playwright + Lighthouse CLS قبل/بعد.
- الهدف: CLS < 0.1.

## ملاحظة
لن نلمس منطق الأعمال (fetching، routing، admin) — فقط تصميم وحجز مساحة.
