## الهدف
تحويل عناصر التنقل في `SiteHeader` إلى قوائم منسدلة (Dropdown) تفاعلية لتحسين الاحترافية والتصفح، مع إعادة تسمية "دروس فيديو" إلى **دورات**.

## التغييرات

### 1. إعادة التسمية
- `دروس فيديو` → **دورات** في كل مكان (Header, Footer, breadcrumbs) — الرابط `/lessons` يبقى كما هو.

### 2. قائمة منسدلة: المقالات
- عند المرور بالماوس (desktop) أو النقر (mobile) على "المقالات" تظهر قائمة تحتوي:
  - "جميع المقالات" (رابط لـ `/posts`)
  - أهم التصنيفات (أول 8 labels) — تُجلب ديناميكياً عبر `getLabels()` من `blogger.functions.ts` مع تخزين مؤقت.
  - رابط "عرض الكل ←" في الأسفل.

### 3. قائمة منسدلة: دورات (Lessons)
- تحتوي:
  - "كل الدورات" (`/lessons`)
  - قائمة التصنيفات المتوفرة (categories المميزة من `listLessons()`).

### 4. قائمة منسدلة: أدوات AI
- عناصر ثابتة:
  - نظرة عامة (`/tools`)
  - نص → صورة (`/tools/image`)
  - تلخيص (`/tools/summarize`)
  - ترجمة (`/tools/translate`)
  - توليد أفكار (`/tools/ideas`)
  - مساعد SEO (`/tools/seo`)

### 5. التنفيذ التقني
- إنشاء مكون جديد `src/components/nav-dropdown.tsx`:
  - يستعمل Radix UI (`@radix-ui/react-navigation-menu` المتوفر بالفعل عبر shadcn، أو `DropdownMenu`).
  - تصميم: بطاقة مع `shadow-elegant` وحدود `border-border`، تحرك برفق (fade+slide).
  - يدعم RTL كاملاً.
- تعديل `src/components/site-header.tsx`:
  - استبدال العناصر الثلاثة (`المقالات`, `دورات`, `أدوات AI`) بمكون `NavDropdown`.
  - على الجوال: توسيع/طي داخل القائمة (accordion-style) بدون تعقيد.
- إضافة hooks خفيفة لجلب categories في الـ header:
  - `useQuery` مع staleTime كبير (10 دقائق) لتفادي التحميل المتكرر.

### 6. الحفاظ على الأداء
- عدم تحميل بيانات القوائم إلا عند فتح Dropdown (`onOpenChange`).
- إعادة استخدام cache الموجود لـ `labels` و `lessons`.

## الملفات المتأثرة
- `src/components/site-header.tsx` (تعديل رئيسي)
- `src/components/nav-dropdown.tsx` (جديد)
- `src/components/site-footer.tsx` (إعادة التسمية فقط)
- روابط داخلية أخرى إن وُجدت (بحث سريع عن "دروس فيديو")

## خارج النطاق
- لا تغييرات على صفحات `/posts`, `/lessons`, `/tools` نفسها.
- لا تغييرات على منطق الجلب أو قاعدة البيانات.
