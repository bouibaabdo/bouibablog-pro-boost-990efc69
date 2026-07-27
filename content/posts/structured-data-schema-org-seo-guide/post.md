# دليل إضافة البيانات المنظمة Schema.org لتحسين ظهور موقعك في نتائج البحث

تعد **البيانات المنظمة (Structured Data)** المكتوبة بتنسيق **JSON-LD** اللغة الموحدة التي تفهم بها محركات البحث مثل **Google** محتوى موقعك بدقة متناهية. تمنحك إضافة Schema.org الفرصة الذهبية للظهور في **المقتطفات المميزة (Rich Snippets)** وإجابات الذكاء الاصطناعي (Google AI Overviews)، مما يرفع نسبة النقر على روابطك (CTR) بفرق هائل.

في هذا الدليل العملي من **Bouiba Academy**، ستتعلم أنواع الـ Schema الرئيسية مع أمثلة كود جاهزة للنسخ واللصق.

---

## 1. كود Schema المقالات الأخبارية والتقنية (TechArticle / Article)

يساعد هذا الكود جوجل على فهم اسم الكاتب، صورة المقال، تاريخ النشر، والوصف التعريفي:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "عنوان المقال التقني هنا",
  "description": "الوصف المختصر للمقال المحسن لمحركات البحث",
  "image": "https://www.bouibacademy.me/cover-image.png",
  "datePublished": "2026-07-27",
  "author": {
    "@type": "Organization",
    "name": "Bouiba Academy",
    "url": "https://www.bouibacademy.me"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Bouiba Academy",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.bouibacademy.me/bouiba-logo-96.webp"
    }
  }
}
</script>
```

---

## 2. كود Schema الأسئلة الشائعة (FAQPage Schema)

يتيح لك هذا النوع عرض الأسئلة والأجوبة الخاصة بمقالك مباشرة أسفل رابط موقعك في نتائج جوجل:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "ما هي البيانات المنظمة Schema.org؟",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "هي أكواد برمجية بتنسيق JSON-LD تفهمها محركات البحث لتحديد هوية ومحتوى الصفحات وإظهار المقتطفات الغنية."
    }
  }, {
    "@type": "Question",
    "name": "هل تساعد Schema على رفع ترتيب الموقع؟",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "نعم، تزيد من فهم المحتوى وتجذب أنظار الباحثين في نتائج البحث مما يرفع معدل النقر CTR بصورة ملحوظة."
    }
  }]
}
</script>
```

---

## خطوات فحص وتأكيد صحة الكود

قبل اعتماد الكود على موقعك، استخدم الأدوات الرسمية المجانية التالية:
1. **Google Rich Results Test:** [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results) لفحص أهليتك للظهور بالمقتطفات.
2. **Schema Validator:** [https://validator.schema.org](https://validator.schema.org) للتحقق من عدم وجود أي خطأ في بنية الـ JSON.

---

## الأسئلة الشائعة (FAQ)

### أين يوضع كود JSON-LD داخل الصفحة؟
يمكن وضع كود الـ JSON-LD داخل وسم `<head>` أو في أي مكان داخل جسم الصفحة `<body>` حيث يقوم جوجل بقراءته وتحليله بكفاءة متساوية.
