import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/tools/agent")({
  head: () => ({
    ...buildSeo({
      path: "/tools/agent",
      title: "العميل الذكي (AI Agent) | Bouiba Academy",
      description:
        "صمم حلولًا مؤتمتة وابنِ وكيل ذكاء اصطناعي (AI Agent) مخصصًا لمهمتك مع خطة عمل تفصيلية وأدوات مقترحة.",
      keywords: ["عميل ذكي", "AI Agent", "أتمتة المهام", "وكيل ذكاء اصطناعي", "ذكاء اصطناعي"],
    }),
  }),
  component: () => (
    <TextToolShell
      action="agent"
      icon={Bot}
      title="العميل الذكي (AI Agent)"
      description="أدخل المهمة التي تريد من العميل الذكي تنفيذها أو أتمتتها، وسيقوم بتصميم خطة عمل كاملة تشمل الأدوات والخطوات والتنفيذ."
      placeholder="مثال: أريد بناء عميل ذكي يقوم بمراقبة أسعار المنتجات على موقع معين وإرسال تنبيه عبر تلغرام عندما ينخفض السعر..."
      ctaLabel="صمم العميل الذكي"
      minRows={6}
      renderMarkdown
    />
  ),
});
