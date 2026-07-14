# خطة إصلاح "Render-blocking CSS" في Bouiba Academy

## المشكلة
`/assets/styles-*.css` (≈18KB، 160ms) لا يزال حاجباً للرندر رغم `preload`، لأن `<link rel="stylesheet">` يبقى موجوداً في `<head>` ويوقف الرسم حتى يُحمَّل ويُطبَّق. الحل الجذري: **Critical CSS داخل `<head>` + تحميل غير حاجب للباقي**.

## الخطوات

### 1) استخراج Critical CSS
- تشغيل الموقع محلياً عبر Playwright على الصفحة الرئيسية بمقاس موبايل + ديسكتوب.
- استخدام `critters` أو `penthouse` لاستخراج الـ CSS الفعلي المستعمل فوق الطي (الهيدر، الشعار، بطاقة الـ hero، أول بطاقة مقال، الأزرار، خطوط RTL، متغيرات `:root`).
- الحجم المتوقع: 3–5KB.

### 2) حقن Critical CSS داخل `<head>` (SSR)
في `src/routes/__root.tsx`:
- إنشاء ملف `src/critical.css` (يدوي في البداية، ثم automated لاحقاً).
- استيراده كنص خام عبر `?raw` (يدعمه Vite).
- حقنه كـ `<style>` عبر `head().scripts` غير عملي؛ الأصح إضافة عنصر مخصص في `RootShell` قبل `<HeadContent />` باستعمال `dangerouslySetInnerHTML`.

### 3) تحويل main CSS إلى تحميل غير حاجب
استبدال:
```tsx
{ rel: "preload", as: "style", href: appCss },
{ rel: "stylesheet", href: appCss },
```
بـ:
```tsx
{ rel: "preload", as: "style", href: appCss, onLoad: "this.rel='stylesheet'" },
```
+ `<noscript><link rel="stylesheet" href={appCss} /></noscript>` في `RootShell`.

بما أن TanStack `head().links` لا يدعم `onLoad` مباشرة بشكل موثوق، سنستخدم نفس تقنية الخطوط الحالية:
```tsx
{ rel: "stylesheet", href: appCss, media: "print", "data-css-swap": "true" }
```
+ توسيع السكربت السطري الموجود ليشمل: 
```js
document.querySelectorAll('link[data-css-swap],link[data-font-swap]').forEach(l=>l.media='all');
```

### 4) التحقق
- Playwright + Lighthouse على `/` قبل وبعد.
- التأكد من غياب FOUC (فلاش المحتوى غير المنسق) بفضل الـ critical inline.
- التأكد من اختفاء تحذير "Eliminate render-blocking resources" أو انخفاضه تحت 100ms.

## الملفات المعدَّلة
- `src/critical.css` (جديد) — CSS فوق الطي فقط.
- `src/routes/__root.tsx` — حقن critical inline + تحويل main CSS إلى `media="print"` swap + توسيع سكربت الـ swap.

## النتيجة المتوقعة
- LCP أسرع بـ 200–400ms إضافية.
- First Paint شبه فوري (critical CSS جاهز مع HTML).
- بدون FOUC ولا كسر للتصميم.

## ملاحظة
لو لم يعطِ الحل اليدوي critical.css نتيجة كافية، يمكن لاحقاً دمج plugin مثل `vite-plugin-critical` في `vite.config.ts` لإنشائه تلقائياً عند البناء.
