import { createFileRoute } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/tools/rewrite")({
  head: () => ({
    ...buildSeo({
      path: "/tools/rewrite",
      title: "إعادة صياغة النصوص والتدقيق الإملائي بالعربية | Bouiba Academy",
      description:
        "أعد صياغة نصوصك بأسلوب احترافي وصحّح الأخطاء الإملائية والنحوية وعلامات الترقيم مجانًا.",
      keywords: ["إعادة صياغة", "تدقيق إملائي عربي", "تصحيح نحوي", "تحرير النصوص"],
    }),
  }),
  component: () => (
    <TextToolShell
      action="rewrite"
      icon={PenLine}
      title="إعادة الصياغة والتدقيق اللغوي"
      description="الصق نصك ليُعاد صياغته بأسلوب أوضح مع تصحيح الأخطاء الإملائية والنحوية."
      placeholder="الصق هنا النص الذي تريد إعادة صياغته أو تدقيقه..."
      ctaLabel="أعد الصياغة"
      minRows={9}
      renderMarkdown
    />
  ),
});
