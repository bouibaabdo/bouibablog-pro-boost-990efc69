import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية — Bouiba Academy" },
      {
        name: "description",
        content:
          "سياسة الخصوصية الخاصة بموقع Bouiba Academy: البيانات التي نجمعها، ملفات تعريف الارتباط، وإعلانات Google AdSense.",
        key: "description",
      },
      { property: "og:title", content: "سياسة الخصوصية — Bouiba Academy", key: "og:title" },
      {
        property: "og:description",
        content:
          "كيف نجمع ونستخدم البيانات، ملفات الكوكيز، وإعلانات الطرف الثالث في Bouiba Academy.",
        key: "og:description",
      },
      { property: "og:url", content: "https://www.bouibacademy.me/privacy", key: "og:url" },
    ],
    links: [{ rel: "canonical", href: "https://www.bouibacademy.me/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container-page py-16 max-w-3xl">
        <h1 className="font-display text-4xl font-extrabold mb-6">سياسة الخصوصية</h1>
        <p className="text-sm text-muted-foreground mb-8">
          آخر تحديث:{" "}
          {new Date().toLocaleDateString("ar-EG-u-nu-latn", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="prose prose-ar max-w-none space-y-6 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold mb-3">مقدمة</h2>
            <p>
              نحن في <strong>Bouiba Academy</strong> (www.bouibacademy.me) نحترم خصوصية زوّارنا
              ونلتزم بحماية بياناتهم الشخصية. توضّح هذه السياسة نوع المعلومات التي نجمعها وكيفية
              استخدامها.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-3">المعلومات التي نجمعها</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                بيانات تقنية تلقائية (نوع المتصفح، نظام التشغيل، الصفحات التي تمت زيارتها) عبر أدوات
                التحليل مثل Google Analytics.
              </li>
              <li>
                بيانات الحساب (البريد الإلكتروني، الاسم) عند التسجيل الاختياري للاستفادة من الميزات
                المخصصة.
              </li>
              <li>محتوى الرسائل التي ترسلها عبر نموذج التواصل.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-3">ملفات تعريف الارتباط (Cookies)</h2>
            <p>
              يستخدم موقعنا ملفات الكوكيز لتحسين تجربة المستخدم، وتحليل الزيارات، وعرض إعلانات ذات
              صلة. يمكنك تعطيل الكوكيز من إعدادات متصفحك في أي وقت.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-3">
              إعلانات Google AdSense والطرف الثالث وشبكات الإعلان (GDPR & CCPA)
            </h2>
            <p>
              نستخدم خدمة <strong>Google AdSense</strong> وبائعي الطرف الثالث لعرض الإعلانات عند زيارتك لموقعنا. تستخدم Google ملفات تعريف الارتباط (Cookies) بما في ذلك كوكيز <strong>DART</strong> لعرض الإعلانات للمستخدمين بناءً على زياراتهم لموقعنا والمواقع الأخرى على الإنترنت.
            </p>
            <ul className="list-disc pr-6 space-y-2 mt-3">
              <li>
                يستطيع بائعو الطرف الثالث، بما فيهم Google، استخدام ملفات تعريف الارتباط لعرض الإعلانات بناءً على زيارات الزائر السابقة.
              </li>
              <li>
                تتيح ملفات تعريف الارتباط الإعلانية لشركة Google وشركائها إمكانية تقديم إعلانات للمستخدمين استناداً إلى زيارتهم لموقعنا أو مواقع أخرى.
              </li>
              <li>
                يمكن للمستخدمين إلغاء استخدام ملف تعريف الارتباط DART والمحتوى الإعلاني المخصص من خلال زيارة{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium"
                >
                  إعدادات الإعلانات في Google
                </a>
                .
              </li>
              <li>
                يمكنك أيضاً إلغاء استخدام ملفات تعريف الارتباط المخصصة للإعلانات من جانب الموردين الخارجيين عن طريق زيارة{" "}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium"
                >
                  www.aboutads.info
                </a>
                .
              </li>
              <li>
                الامتثال للائحة العامة لحماية البيانات (GDPR): إذا كنت مقيماً في المنطقة الاقتصادية الأوروبية (EEA)، فليدك الحق في الوصول إلى بياناتك الشخصية، أو تصحيحها، أو حذفها، أو تقييد معالجتها، والموافقة المسبقة على ملفات التتبع غير الضرورية.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-3">حقوقك</h2>
            <p>
              لك الحق في الوصول إلى بياناتك أو طلب تعديلها أو حذفها بالتواصل معنا عبر البريد
              الإلكتروني.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-3">أمان البيانات</h2>
            <p>
              نتخذ إجراءات تقنية معقولة لحماية بياناتك من الوصول غير المصرّح به، لكن لا يمكن ضمان
              الأمان المطلق عبر الإنترنت.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-3">التواصل</h2>
            <p>
              لأي استفسار عن هذه السياسة، راسلنا على:{" "}
              <a href="mailto:contact@bouibacademy.me" className="text-primary underline">
                contact@bouibacademy.me
              </a>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
