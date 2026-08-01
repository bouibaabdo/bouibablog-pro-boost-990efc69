import { createFileRoute } from "@tanstack/react-router";
import { Video } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/tools/reels")({
  head: () => ({
    ...buildSeo({
      path: "/tools/reels",
      title: "صانع سيناريو الريلز والفيديوهات القصيرة (AI Reels Script Generator) | Bouiba Academy",
      description:
        "ولّد سيناريو ريلز وتيك توك فيروسي عالي التفاعل من أي موضوع مع الخطاف والتعليق الصوتي والتوجيهات البصرية ودعوة المتابعين.",
      keywords: ["سيناريو ريلز", "Reels script generator", "تيك توك", "صانع محتوى", "ذكاء اصطناعي"],
    }),
  }),
  component: () => (
    <TextToolShell
      action="reels"
      icon={Video}
      title="صانع سيناريو الريلز (AI Reels Creator)"
      description="أدخل فكرة أو موضوع الفيديو، وسيقوم الذكاء الاصطناعي بتوليد سيناريو ريلز كامل يشمل الخطاف الصوتي، المشاهد البصرية، والكابشن التفاعلي لجذب المتابعين."
      placeholder="مثال: حزمة قوالب n8n المجانية للأتمتة والذكاء الاصطناعي وكيف توفر الوقت..."
      ctaLabel="صمّم سيناريو الريلز"
      minRows={6}
      renderMarkdown
    />
  ),
});
