import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";

export const Route = createFileRoute("/tools/seo")({
  head: () => ({
    meta: [
      { title: "مساعد SEO عربي — أدوات AI | Bouiba Academy" },
      { name: "description", content: "احصل على عنوان، وصف Meta، كلمات مفتاحية، وهيكل عناوين محسّن." },
    ],
    links: [{ rel: "canonical", href: "/tools/seo" }],
  }),
  component: () => (
    <TextToolShell
      action="seo"
      icon={Search}
      title="مساعد SEO عربي"
      description="أدخل موضوع مقالك واحصل على حزمة SEO كاملة جاهزة للاستخدام."
      placeholder="مثال: أفضل أدوات الذكاء الاصطناعي لتحرير الفيديو 2026"
      ctaLabel="حلّل الموضوع"
      minRows={3}
      renderMarkdown
    />
  ),
});
