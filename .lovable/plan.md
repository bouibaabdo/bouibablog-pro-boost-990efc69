## إضافة خاصية التعديل على معلومات الفيديوهات المنشورة

في `/admin/lessons` بجانب كل درس، أضيف زر **تعديل** (أيقونة قلم) يفتح **حوار Dialog** لتحرير:

- العنوان
- الوصف
- التصنيف
- حالة النشر

### التنفيذ (ملف واحد فقط)

`src/routes/_authenticated/admin/lessons.tsx`:
1. استيراد `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` و أيقونة `Pencil`.
2. إضافة state: `editing` (الدرس المحدد) + حقول محلية (title/description/category/published).
3. دالة `onSaveEdit` تستدعي `updateLesson({ data: { id, title, description, category, published } })` الموجودة أصلًا في `src/lib/lessons.functions.ts` — لا حاجة لتغيير الـ backend.
4. زر تعديل في قائمة "الدروس المنشورة" يفتح الحوار مع تعبئة الحقول من الدرس.
5. بعد الحفظ: `toast.success` + `refresh()` + إغلاق الحوار.

ملاحظة: تعديل/استبدال ملف الفيديو أو الصورة المصغّرة **خارج نطاق هذه الخاصية** (يظل حذف ثم إعادة رفع). إذا أردت لاحقًا استبدال الفيديو/الصورة أخبرني.
