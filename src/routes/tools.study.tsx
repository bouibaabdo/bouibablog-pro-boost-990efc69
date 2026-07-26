import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/tools/study")({
  head: () => ({
    ...buildSeo({
      path: "/tools/study",
      title: "المساعد الدراسي: شرح مبسّط وبطاقات مراجعة واختبار | Bouiba Academy",
      description:
        "اشرح أي درس بأسلوب مبسّط واحصل على أهم النقاط وبطاقات مراجعة واختبار قصير بالإجابات.",
      keywords: ["مساعد دراسي", "بطاقات مراجعة", "شرح مبسط", "اختبار قصير", "مراجعة الدروس"],
    }),
  }),
  component: () => (
    <TextToolShell
      action="study"
      icon={GraduationCap}
      title="المساعد الدراسي الذكي"
      description="الصق درسًا أو اكتب موضوعًا لتحصل على شرح مبسّط، أهم النقاط، بطاقات مراجعة، واختبار قصير."
      placeholder="مثال: اشرح لي مفهوم الشبكات العصبية الاصطناعية... أو الصق نص الدرس كاملًا."
      ctaLabel="ابدأ المراجعة"
      minRows={9}
      renderMarkdown
    />
  ),
});
