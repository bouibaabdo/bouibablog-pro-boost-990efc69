import { createFileRoute } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";

export const Route = createFileRoute("/tools/translate")({
  head: () => ({
    meta: [
      { title: "الترجمة الاحترافية — أدوات AI | Bouiba Academy" },
      { name: "description", content: "ترجمة نصوص بين العربية والإنجليزية والفرنسية بجودة عالية." },
    ],
    links: [{ rel: "canonical", href: "/tools/translate" }],
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
