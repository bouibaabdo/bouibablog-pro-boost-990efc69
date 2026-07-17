import { createFileRoute } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";

export const Route = createFileRoute("/tools/code")({
  head: () => ({
    meta: [
      { title: "مساعد البرمجة وشرح الأكواد — أدوات AI | Bouiba Academy" },
      { name: "description", content: "الصق الكود البرمجي واحصل على شرح تفصيلي وتصحيح للأخطاء أو اقتراح للتحسينات بالذكاء الاصطناعي." },
      { property: "og:title", content: "مساعد البرمجة وشرح الأكواد — Bouiba Academy" },
      { property: "og:description", content: "حلل، اشرح، وصحح أخطاء الأكواد البرمجية مباشرة باستخدام الذكاء الاصطناعي." },
      { property: "og:url", content: "https://www.bouibacademy.me/tools/code" },
    ],
    links: [{ rel: "canonical", href: "https://www.bouibacademy.me/tools/code" }],
  }),
  component: () => (
    <TextToolShell
      action="code"
      icon={Code2}
      title="مساعد البرمجة وشرح الأكواد"
      description="الصق أي كود برمجي (مثل Python, JavaScript, C++, CSS, إلخ) للحصول على شرح مفصل، تحديد المشاكل، أو تصحيح الأخطاء فيه."
      placeholder="الصق الكود البرمجي هنا..."
      ctaLabel="حلل واشرح الكود"
      minRows={8}
      renderMarkdown={true}
    />
  ),
});
