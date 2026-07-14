# توجيه www.bouibacademy.me إلى الموقع الجديد

## سبب المشكلة
الصورة التي أرسلتها تعرض **قالب Blogger الأصلي** لأن الدومين `www.bouibacademy.me` لا يزال مربوطًا في إعدادات Blogger عبر سجلات DNS قديمة. أما الموقع الاحترافي الذي بنيناه فمنشور حاليًا على `edu.bouibacademy.me` فقط.

الحل هو **تحرير الدومين من Blogger وربطه بـ Lovable**، بحيث يعرض `www.bouibacademy.me` و`bouibacademy.me` نفس التصميم الجديد.

---

## الخطوات

### 1) داخل لوحة Blogger (أنت تنفذها)
- افتح Blogger → **Settings → Publishing**.
- احذف الدومين المخصص `www.bouibacademy.me` (سيعود المدونة للعمل على `academybouiba.blogspot.com` — وهذا هو المصدر الذي يجلب منه الموقع الجديد المقالات، فلن يتأثر شيء).

### 2) داخل مزوّد الدومين (حيث اشتريت bouibacademy.me)
احذف سجلات Blogger القديمة (CNAME يشير إلى `ghs.google.com` وسجلات A الأربعة الخاصة بـ Google) وأضِف بدلها:

```text
النوع  الاسم     القيمة
A      @         185.158.133.1
A      www       185.158.133.1
TXT    _lovable  (القيمة التي ستظهر لك في Lovable)
```

### 3) داخل Lovable (أنا أرشدك)
- **Project Settings → Domains → Connect Domain**.
- أضِف `bouibacademy.me` ثم أضِف `www.bouibacademy.me` كمدخل منفصل.
- اختر أحدهما كـ **Primary** (يُنصح `www.bouibacademy.me`) والآخر سيعيد التوجيه إليه.
- اترك النظام يتحقّق من DNS ويُصدر شهادة SSL (قد يستغرق حتى 72 ساعة، عادةً أقل من ساعة).

### 4) بعد التفعيل
- `www.bouibacademy.me` و`bouibacademy.me` سيعرضان الموقع الاحترافي الجديد.
- `edu.bouibacademy.me` يبقى يعمل كما هو (أو يمكن حذفه لاحقًا).
- المقالات ستستمر بالظهور لأنها تُجلب من `academybouiba.blogspot.com` في الخلفية.

---

## ملاحظات مهمة
- **لن يتم أي تغيير في الكود** — المشكلة كلها في إعدادات DNS.
- المقالات الموجودة في Blogger لن تُحذف؛ ستظل مصدر البيانات.
- بعد الانتهاء، سنُعيد إرسال Sitemap الجديد إلى Google Search Console من الدومين الرئيسي.

هل تريد أن أبدأ بتوجيهك خطوة بخطوة عبر إعدادات مزوّد الدومين لديك؟ أخبرني عند من اشتريت `bouibacademy.me` (Namecheap / GoDaddy / OVH / ...).
