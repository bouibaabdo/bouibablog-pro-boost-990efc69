import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "أدوات الذكاء الاصطناعي — Bouiba Academy" },
      {
        name: "description",
        content:
          "مجموعة أدوات ذكاء اصطناعي عربية مجانية: تحويل النص إلى صورة، تلخيص المقالات، توليد الأفكار، الترجمة، ومساعد SEO.",
        key: "description",
      },
      { property: "og:title", content: "أدوات الذكاء الاصطناعي — Bouiba Academy", key: "og:title" },
      {
        property: "og:description",
        content: "أدوات AI مجانية تعمل مباشرة داخل موقع Bouiba Academy.",
        key: "og:description",
      },
      { property: "og:url", content: "https://www.bouibacademy.me/tools", key: "og:url" },
      { property: "og:image", content: "https://www.bouibacademy.me/og-tools.png", key: "og:image" },
      { property: "og:image:width", content: "1200", key: "og:image:width" },
      { property: "og:image:height", content: "630", key: "og:image:height" },
      { property: "og:image:alt", content: "أدوات الذكاء الاصطناعي — Bouiba Academy", key: "og:image:alt" },
      { name: "twitter:card", content: "summary_large_image", key: "twitter:card" },
      { name: "twitter:title", content: "أدوات الذكاء الاصطناعي — Bouiba Academy", key: "twitter:title" },
      { name: "twitter:description", content: "مجموعة أدوات ذكاء اصطناعي عربية مجانية تعمل مباشرة داخل موقع Bouiba Academy.", key: "twitter:description" },
      { name: "twitter:image", content: "https://www.bouibacademy.me/og-tools.png", key: "twitter:image" },
    ],
    links: [{ rel: "canonical", href: "https://www.bouibacademy.me/tools" }],
  }),
  component: ToolsLayout,
});

function ToolsLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
