## المشكلة
روابط البث الحالية (yalladown + yallasellit + قنوات Alba/embedsports المضمّنة يدويًا) أصبحت غير مستقرة: كثير منها يعيد صفحات إعلانات أو 404، وقائمة المزوّدات المكتوبة يدويًا في `yalladown.functions.ts` و`yallasellit.functions.ts` قديمة.

## الحل: التحوّل إلى مصادر مجمّعة حيّة + توسيع قائمة المزوّدات

### 1) مصادر بث جديدة تُجلب ديناميكيًا
أضف ثلاثة مزوّدات مجمِّعة معروفة بالاستقرار وتحديث الروابط يوميًا:

- **`streamed.pk`** (API عام مجاني `https://streamed.pk/api/matches/football` + `/api/stream/{source}/{id}`) — يعيد قائمة مباريات مع مصادر متعددة (alpha/bravo/charlie/delta/echo/foxtrot) وروابط `embedUrl` جاهزة.
- **`sportsurge` / `crackstreams` mirror** عبر `https://embedsports.top/embed/{source}/{slug}/{n}` — نستخدمه كـ fallback مبني على اسم المباراة.
- **`daddylive` HD** عبر `https://dlhd.dad/embed/stream-{id}.php` — قائمة القنوات تُجلب من `https://daddylive.mp/24-7-channels.php` وتُخزَّن مؤقتًا 30 دقيقة.

### 2) طبقة موحّدة `src/lib/live-streams.functions.ts`
ملف جديد يجمع كل المزوّدات في دالة واحدة `getLiveStreamsFor(home, away, kickoffIso)` تُعيد `string[]` مرتّبة حسب الجودة:
1. `streamed.pk` (الأولوية القصوى — الأكثر استقرارًا)
2. `daddylive` مطابقة بالقناة (beIN / SSC)
3. `yalladown` (الحالي)
4. `embedsports.top` بأشكال متعددة
5. `yallasellit` (آخر ملاذ)

### 3) تحديث `stream-modal.tsx`
- زيادة `HOST_SCORE` ليشمل `streamed.pk`, `dlhd.dad`, `embedme.top`.
- تقليل مهلة الفشل التلقائي من الحالية إلى **6 ثوانٍ** حتى يتنقّل بين المصادر أسرع.
- زر "المصدر التالي" يدويًا يعمل حتى قبل انتهاء المهلة.
- عند فشل كل المصادر: عرض رسالة عربية واضحة + رابط مباشر لصفحة `streamed.pk/watch/{id}` كبديل خارجي.

### 4) تحديث `match-streams.ts`
دمج مخرجات `getLiveStreamsFor` قبل مصادر yalladown/yallasellit في `buildStreamLookup`، مع إبقاء التطابق الغامض بالأسماء العربية.

### 5) Cache خفيف
`unstable_cache` لمدة 60 ثانية على `streamed.pk` و30 دقيقة على قائمة قنوات daddylive حتى لا نُثقل مزوّداتهم.

## الملفات المتأثرة
- **جديد**: `src/lib/live-streams.functions.ts`
- **تعديل**: `src/lib/match-streams.ts`, `src/components/stream-modal.tsx`, `src/lib/yalladown.functions.ts` (توسيع قائمة providers فقط)
- **بدون تغيير**: قاعدة البيانات، الواجهة، الـ SEO، لوحة التحكم.

## النتيجة المتوقّعة
- زيادة كبيرة في نسبة نجاح تشغيل البث من أول محاولة.
- تنقّل تلقائي أسرع بين المصادر عند الفشل.
- لا تغيير في تجربة المستخدم على الصفحة الرئيسية أو صفحة كأس العالم.

هل تريد أن أضيف أيضًا مزوّد **`sportzonline.si`** (يتطلب parsing HTML خفيف) كمصدر رابع، أم يكفي الثلاثة أعلاه؟
