# نشر تطبيقات Web و APIs مجاناً على Google Cloud Run ببروتوكول HTTPS تلقائي

تعد منصة **Google Cloud Run** واحدة من أفضل وأقوى خيارات الاستضافة السحابية الخالية من السيرفرات (**Serverless Containers**). تتيح لك المنصة نشر أي تطبيق محزم داخل حاوية **Docker** (سواء كان Node.js، Python، Go، أو Rust) مع توسع تلقائي من الصفر إلى آلاف الطلبات في الثانية دون الحاجة لدفع أي سنت عند عدم وجود زيارات.

في هذا الدليل التفصيلي من **Bouiba Academy**، سنشرح خطوات نشر مشروعك على Google Cloud Run مجاناً ضمن الباقة المجانية السخية.

---

## مميزات المستوى المجاني (Google Cloud Run Free Tier)

يوفر Google Cloud شهرياً وحسابات مجانية متجددة تتضمن:
- **2 مليون طلب مجاني** شهرياً.
- **360,000 ثانية من ذاكرة vCPU-seconds** مجاناً.
- **180,000 GiB-seconds من الذاكرة العشوائية (RAM)**.
- **شهادة أمان HTTPS ودومين فرعي تلقائي** مجاني بدون أي إعدادات إضافية.

---

## خطوات النشر باستخدام Google Cloud CLI

### 1. تثبيت وتهيئة gcloud CLI
قم بتنزيل أداة [Google Cloud SDK](https://cloud.google.com/sdk) وتوثيق حسابك بالأمر:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. بناء ونشر التطبيق بأمر واحد
من داخل مجلد مشروعك الذي يحتوي على `Dockerfile`:

```bash
gcloud run deploy my-web-app \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 3000
```

سيقوم Google Cloud Run تلقائياً بـ:
1. قراءة الـ Dockerfile وبناء الصورة عبر Cloud Build.
2. رفع الصورة إلى Artifact Registry.
3. تشغيل الخدمة وإعادة رابط HTTPS مباشر لتطبيقك!

---

## ربط المستودع وإطلاق التحديثات عبر GitHub Actions

يمكنك ربط مستودع مشروعك على **GitHub** بالنقر على **"Set up Continuous Deployment"** داخل لوحة تحكم Google Cloud Console. في كل مرة تقوم فيها بعمل `git push` لفرع `main`، سيتم بناء وتحديث مشروعك السحابي تلقائياً دون أي تدخل يدوي.

---

## الأسئلة الشائعة (FAQ)

### ماذا يحدث إذا لم يتلق التطبيق أي زيارات؟
يقوم Google Cloud Run بتقليص الحاوية إلى **0** (Scale to Zero)، مما يعني عدم استهلاك أي موارد وعدم فرض أي تكاليف مالية على الإطلاق أثناء فترات الخمول.

### هل يمكن ربط دومين مخصص (Custom Domain)؟
نعم بالتأكيد، يمكنك إضافة دومينك الخاص من قسم **Custom Domains** في Cloud Console مع توفير شهادة SSL مجانية وتلقائية من جوجل.
