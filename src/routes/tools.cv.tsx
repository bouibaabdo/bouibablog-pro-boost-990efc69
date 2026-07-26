import { createFileRoute } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/tools/cv")({
  head: () => ({
    ...buildSeo({
      path: "/tools/cv",
      title: "مولّد السيرة الذاتية بالذكاء الاصطناعي | Bouiba Academy",
      description:
        "أنشئ سيرة ذاتية احترافية بالعربية خلال ثوانٍ: نبذة شخصية، مهارات، خبرات بصيغة إنجازات، ونصائح للقبول.",
      keywords: ["سيرة ذاتية", "CV بالذكاء الاصطناعي", "كتابة السيرة الذاتية", "أدوات توظيف"],
    }),
  }),
  component: () => (
    <TextToolShell
      action="cv"
      icon={UserRound}
      title="مولّد السيرة الذاتية (CV)"
      description="اكتب معلوماتك (الاسم، التخصص، الخبرات، المهارات، التعليم) واحصل على سيرة ذاتية احترافية جاهزة."
      placeholder="مثال: اسمي محمد، مطوّر ويب بخبرة 3 سنوات في React وNode.js، خريج إجازة في الإعلاميات، أبحث عن وظيفة مطوّر واجهات..."
      ctaLabel="أنشئ السيرة الذاتية"
      minRows={9}
      renderMarkdown
    />
  ),
});
