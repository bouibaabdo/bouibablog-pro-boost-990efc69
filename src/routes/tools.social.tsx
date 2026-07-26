import { createFileRoute } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { TextToolShell } from "@/components/text-tool-shell";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/tools/social")({
  head: () => ({
    ...buildSeo({
      path: "/tools/social",
      title: "مولّد منشورات السوشيال ميديا والهاشتاغات | Bouiba Academy",
      description:
        "أنشئ منشورات فيسبوك ولينكدإن وتغريدات وسيناريو ريلز وهاشتاغات عربية جاهزة من موضوع واحد.",
      keywords: ["منشورات سوشيال ميديا", "هاشتاغات", "تسويق بالذكاء الاصطناعي", "ريلز"],
    }),
  }),
  component: () => (
    <TextToolShell
      action="social"
      icon={Share2}
      title="مولّد منشورات السوشيال ميديا"
      description="أدخل موضوعك واحصل على منشورات وتغريدات وسيناريو فيديو قصير مع هاشتاغات جاهزة."
      placeholder="مثال: إطلاق دورة جديدة لتعلّم الذكاء الاصطناعي للمبتدئين بالعربية..."
      ctaLabel="ولّد المنشورات"
      minRows={6}
      renderMarkdown
    />
  ),
});
