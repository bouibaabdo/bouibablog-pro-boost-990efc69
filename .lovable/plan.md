## المشكل
CLS = 0.721 المجموع. المصادر (من صورة PageSpeed):
1. **قسم أدوات AI** ينزاح 0.405 + 0.315 = 0.720 — لأن `TodayMatchesRail` قبله يغير ارتفاعه بين skeleton (280px) والحالة الفعلية (heading + rail ≈ 340px+)، وأحياناً `return null` بعد fetch يحذف كل المساحة.
2. **رايل المباريات** نفسه ينزاح 0.277 — عناصر الهيدر داخله تتحرك.
3. **الخطوط** (Cairo/Tajawal woff2) — `display=swap` كايدير shift حتى مع fallback metrics.

## الخطوات

### 1. `src/components/today-matches-rail.tsx` — حجز ارتفاع ثابت وموحّد
- إزالة الفرع `if (!yd.isFetched && !hasContent) return skeleton section`. عوضاً منه: **دائماً** نرندري نفس الـ `<section>` بنفس الأبعاد الخارجية (heading + rail container)، والـ skeleton يحل محل بطاقات المباريات داخل نفس الحاوية.
- إزالة `if (yd.isFetched && !hasContent) return null`. عوضاً: نخلي الـ `<section>` بارتفاع 0 عبر `hidden` **فقط بعد** ما تكون البيانات جات فارغة (ديمة نادر، والـ shift يبقى بسيط). أو الأفضل: نخلي رسالة "لا مباريات اليوم" داخل نفس الحاوية باش الارتفاع يبقى ثابت.
- الحاوية الخارجية `<section>` تاخد `min-h-[340px] md:min-h-[360px]` — يشمل heading + rail — باش أي محتوى تحتها ما ينزاحش.
- الـ heading يرندري دائماً حتى قبل الـ fetch (بدل ما يظهر مع البيانات).

### 2. `src/critical.css` — تحسين خطوط
- تغيير استراتيجية الخط: بدل `display=swap` كايسبب shift عند وصول الخط، نستعمل `display=optional` في رابط Google Fonts (يعني: إذا الخط ما وصلش في 100ms، يبقى fallback نهائياً — بلا shift أبداً).
- Fallback metrics موجودة كافية.

### 3. `src/routes/__root.tsx` — تحديث URL الخطوط
- تبديل `&display=swap` بـ `&display=optional` في preload + stylesheet + noscript.

## الملفات المعدَّلة
- `src/components/today-matches-rail.tsx`
- `src/routes/__root.tsx`

## التحقق
- بعد deploy: PageSpeed جديد. الهدف CLS < 0.1.

## ملاحظة
لن نمس المنطق (fetching, routing, admin) — فقط layout reservation + font strategy.
