import { createFileRoute } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";

export const Route = createFileRoute("/tools/translate")({
  head: () => ({
    meta: [
      { title: "الترجمة الاحترافية — أدوات AI | Bouiba Academy" },
      { name: "description", content: "ترجمة نصوص بين العربية والإنجليزية والفرنسية بجودة عالية.", key: "description" },
      { property: "og:title", content: "الترجمة الاحترافية — Bouiba Academy", key: "og:title" },
      { property: "og:description", content: "ترجم بين العربية والإنجليزية والفرنسية بأسلوب طبيعي ودقيق.", key: "og:description" },
      { property: "og:url", content: "https://www.bouibacademy.me/tools/translate", key: "og:url" },
    ],
    links: [{ rel: "canonical", href: "https://www.bouibacademy.me/tools/translate" }],
  }),
  component: () => (
    <TextToolShell
      action="translate"
      icon={Languages}
      title="الترجمة الاحترافية"
      description="ترجم بين العربية والإنجليزية والفرنسية بأسلوب طبيعي."
      placeholder="أدخل النص المراد ترجمته..."
      ctaLabel="ترجم"
      minRows={6}
      showTargetLang
    />
  ),
});
