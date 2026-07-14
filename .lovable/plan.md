## نقل النطاق `www.bouibacademy.me` من Blogger إلى Lovable

الهدف: توجيه النطاق ليُقدَّم من تطبيق Lovable بدل Blogger، ممّا يُصلح تنبيه «مدد التخزين المؤقت» ويجعل موقعك المطوَّر هو الظاهر فعليًا على النطاق المخصص.

---

### الخطوة 1 — فصل النطاق من Blogger (لتفادي تعارض DNS)

1. افتح [Blogger Dashboard](https://www.blogger.com) → مدونة `AcademyBouiba`.
2. **الإعدادات → النشر → النطاق المخصّص** → اضغط **إزالة**.
3. أزل أيضًا **إعادة التوجيه من HTTP إلى HTTPS** إن كانت مفعّلة.

بهذا تبقى مدونتك تعمل على `academybouiba.blogspot.com` (وهذا ما يستخدمه تطبيقنا لجلب المقالات — لن تتأثر).

---

### الخطوة 2 — النشر في Lovable وربط النطاق

سأقوم في وضع البناء بـ:
- **نشر التطبيق** (Publish) على رابط `bouibablog-pro-boost.lovable.app`.
- فتح إعدادات النطاقات لك.

بعدها ستحتاج أنت لخطوة يدوية داخل Lovable:
1. **Project Settings → Domains → Connect Domain**.
2. أدخل `bouibacademy.me`.
3. **فعّل** خانة «Domain uses Cloudflare or a similar proxy» (لأنك تستخدم Cloudflare).
4. كرّر الخطوة لإضافة `www.bouibacademy.me`.
5. اجعل `www.bouibacademy.me` هو الـ **Primary**.

---

### الخطوة 3 — تحديث DNS في Cloudflare

في لوحة Cloudflare للنطاق `bouibacademy.me`:

1. **احذف** كل سجلات Blogger القديمة:
   - أي `CNAME` لـ `www` يشير إلى `ghs.google.com`.
   - أي `A` records على الجذر `@` بالقيم: `216.239.32.21`, `216.239.34.21`, `216.239.36.21`, `216.239.38.21`.
   - أي `TXT` تحقّق قديم من Google Search Console خاص بـ Blogger (احتفظ بتحقّق النطاق الجديد فقط).

2. **أضف السجلات التي يعرضها لك Lovable** (ستكون بصيغة CNAME لأنك اخترت وضع Proxy):
   - سجل CNAME لـ `@` (الجذر).
   - سجل CNAME لـ `www`.
   - سجل TXT للتحقق (`_lovable`).
   - اجعل حالة الـ Proxy: **Proxied (السحابة البرتقالية)** كما تعتمد حاليًا.

3. في Cloudflare → **SSL/TLS → Overview** تأكد أن الوضع = **Full**.

---

### الخطوة 4 — الانتظار والتحقق

- الانتشار قد يستغرق من دقائق إلى 72 ساعة (عادةً أقل من ساعة مع Cloudflare).
- في Lovable ستنتقل حالة النطاق من `Verifying` → `Setting up` → `Active`.
- بعد الوصول لـ `Active`: افتح `https://www.bouibacademy.me` — يجب أن يظهر موقع Lovable الجديد.

---

### الخطوة 5 — بعد التفعيل (تُنفَّذ في وضع البناء)

- تحديث `canonical` و `og:url` من `edu.bouibacademy.me` إلى `www.bouibacademy.me` في كل الصفحات.
- تحديث `sitemap.xml` و `robots.txt` لاستخدام النطاق الجديد.
- إعادة إرسال sitemap إلى Google Search Console و Bing Webmaster Tools.
- التأكد أن `ads.txt` ما زال في الجذر (لن يتأثر — بنفس المسار).

---

### تفاصيل تقنية

| العنصر | القيمة |
|---|---|
| Blogger source (يبقى كما هو) | `academybouiba.blogspot.com` |
| تطبيق Lovable | `bouibablog-pro-boost.lovable.app` |
| DNS mode في Lovable | CNAME (Cloudflare Proxy) |
| ملفات ستُحدَّث في الكود | `src/routes/__root.tsx`, `src/routes/sitemap*.xml.ts`, `src/routes/posts.$id.tsx`, `public/robots.txt` |

### ماذا تفعل الآن؟

**اضغط «Approve plan» ثم أخبرني**:
- هل أزلت النطاق من Blogger؟ (خطوة 1)
- هل تفضّل أن أبدأ بـ **النشر فقط** ثم تُكمل أنت خطوات DNS، أم تريد أن أنتظر حتى تنتهي من Cloudflare ثم أُحدّث الروابط داخل الكود؟
