import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";

export const Route = createFileRoute("/tools/prompt")({
  head: () => ({
    meta: [
      { title: "مُحسن ومُصمم البرومبت الذكي — أدوات AI | Bouiba Academy" },
      {
        name: "description",
        content:
          "حوّل أوامرك البسيطة والقصيرة إلى أوامر (Prompts) احترافية وفعالة للغاية للحصول على أفضل نتائج.",
        key: "description",
      },
      {
        property: "og:title",
        content: "مُحسن ومُصمم البرومبت الذكي — Bouiba Academy",
        key: "og:title",
      },
      {
        property: "og:description",
        content: "حوّل أوامرك البسيطة إلى أوامر مهيكلة تناسب نماذج الذكاء الاصطناعي.",
        key: "og:description",
      },
      { property: "og:url", content: "https://www.bouibacademy.me/tools/prompt", key: "og:url" },
    ],
    links: [{ rel: "canonical", href: "https://www.bouibacademy.me/tools/prompt" }],
  }),
  component: () => (
    <TextToolShell
      action="prompt"
      icon={Sparkles}
      title="مُحسن ومُصمم البرومبت الذكي"
      description="أدخل فكرة أو أمرًا بسيطًا، وسيقوم الـ AI بإعادة صياغته وهيكلته كبرومبت احترافي متكامل للحصول على أفضل النتائج."
      placeholder="مثال: اكتب لي مقال عن ريادة الأعمال في السعودية"
      ctaLabel="حسّن البرومبت"
      minRows={4}
    />
  ),
});
