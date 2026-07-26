import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/tools/email")({
  head: () => ({
    ...buildSeo({
      path: "/tools/email",
      title: "كاتب الرسائل والإيميلات الاحترافية بالذكاء الاصطناعي | Bouiba Academy",
      description:
        "حوّل فكرتك إلى رسالة بريد إلكتروني احترافية جاهزة للإرسال مع سطر موضوع قوي ونبرة مهذبة.",
      keywords: ["كتابة إيميل", "رسائل احترافية", "بريد إلكتروني بالذكاء الاصطناعي"],
    }),
  }),
  component: () => (
    <TextToolShell
      action="email"
      icon={Mail}
      title="كاتب الرسائل الاحترافية"
      description="اشرح ما تريد قوله وسيصيغه الذكاء الاصطناعي كرسالة بريد إلكتروني احترافية جاهزة."
      placeholder="مثال: أريد مراسلة شركة للاعتذار عن تأخر تسليم مشروع وطلب تمديد أسبوع..."
      ctaLabel="اكتب الرسالة"
      minRows={7}
      renderMarkdown
    />
  ),
});
