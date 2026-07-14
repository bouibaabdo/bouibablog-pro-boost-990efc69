سيتم تطبيق كل التغييرات على مشروعك المنشور على **www.bouibacademy.me** (الدومين المخصص المرتبط بهذا المشروع نفسه) — لن يتغير أي شيء في Blogger.

---

## 1) الصفحة الرئيسية الجديدة `/`

الترتيب المعتمد:

```
Hero (مضغوط)
  ↓
مباريات كأس العالم اليوم (أمس / اليوم / غدًا مع زر بث)
  ↓
أدوات AI (5 بطاقات)
  ↓
اختبار AI (بطاقة CTA بارزة)
  ↓
أحدث المقالات
  ↓
التصنيفات
```

**تصميم الجوال أولاً:**
- Hero مضغوط بدون stats كبيرة في الجوال
- المباريات: تمرير أفقي snap-scroll في الجوال، شبكة في الديسكتوب
- الأدوات: عمود واحد → عمودان → 3
- بطاقة الاختبار أكبر وأوضح
- Bottom quick-nav ثابتة في الجوال فقط (مباريات / أدوات / اختبار / مقالات)

**تعديل:** `src/routes/index.tsx` + loader إضافية لجلب مباريات اليوم.

---

## 2) مصدر البث من yalladown.net

**ملف جديد:** `src/lib/yalladown.functions.ts`
- `scrapeYalladown()` — يجلب الصفحة الرئيسية ويلتقط قائمة المباريات وروابط صفحاتها
- `extractStreamUrls(url)` — يجلب صفحة المباراة ويستخرج جميع روابط `iframe` embed
- كاش 60 ثانية

**الدمج:**
- في `src/routes/worldcup.tsx`: بناء `sources` يضع yalladown **أولًا**، ثم yallasellit، ثم SportSRC
- الاحتفاظ بالـ auto-fallback الحالي (5 ثوانٍ)
- ربط مباريات yalladown بمعرّفات المباريات عبر منطق التطبيع الحالي لأسماء الفرق العربية

---

## 3) شريط مباراة اليوم داخل كل مقال

**مكوّن جديد:** `src/components/match-strip.tsx`
- يظهر في نهاية كل مقال (`src/routes/posts.$id.tsx`) قبل الفوتر
- يعرض المباراة المباشرة/القادمة اليوم فقط — يختفي عند عدم وجودها
- علم الفريقين + النتيجة + الوقت + زر "شاهد البث" يفتح `StreamModal`
- **Sticky bottom bar** في الجوال عند وجود مباراة `LIVE`
- بطاقة inline عادية في الديسكتوب

---

## 4) ملخص الملفات

**ستُعدَّل:**
- `src/routes/index.tsx` — تصميم كامل جديد
- `src/routes/posts.$id.tsx` — إضافة `<MatchStrip />`
- `src/routes/worldcup.tsx` — دمج yalladown في مصادر البث
- `src/components/stream-modal.tsx` — دعم ترتيب yalladown أولًا

**ستُنشأ:**
- `src/lib/yalladown.functions.ts`
- `src/components/match-strip.tsx`
- `src/components/home-matches-rail.tsx` (تمرير المباريات في الجوال)
- `src/components/mobile-quick-nav.tsx` (شريط سفلي للجوال)

**بدون تغيير:** لوحة التحكم، ربط Blogger، Supabase، AdSense.

بعد التطبيق ستحتاج للضغط على **Publish → Update** لينعكس التصميم الجديد على `www.bouibacademy.me`.
