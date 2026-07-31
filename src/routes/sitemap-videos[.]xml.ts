import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listLessons } from "@/lib/lessons.functions";
import { SITEMAP_BASE_URL } from "@/lib/sitemap-utils";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap-videos.xml")({
  server: {
    handlers: {
      GET: async () => {
        let lessons: any[] = [];
        try {
          lessons = await listLessons();
        } catch (e) {
          console.error("Sitemap videos error:", e);
        }

        const videoBlocks = lessons
          .map((lesson) => {
            const title = escapeXml(lesson.title || "درس تعليمي");
            const desc = escapeXml(
              (lesson.description || lesson.title || "درس تعليمي بالذكاء الاصطناعي").slice(0, 2048),
            );
            const thumb = escapeXml(lesson.thumbnail_url || `${SITEMAP_BASE_URL}/og-banner.png`);
            const contentLoc = lesson.video_url ? escapeXml(lesson.video_url) : null;
            const duration = lesson.duration_seconds ? Math.max(1, lesson.duration_seconds) : null;
            const pubDate = lesson.created_at
              ? new Date(lesson.created_at).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0];

            return [
              `  <url>`,
              `    <loc>${SITEMAP_BASE_URL}/lessons</loc>`,
              `    <video:video>`,
              `      <video:thumbnail_loc>${thumb}</video:thumbnail_loc>`,
              `      <video:title>${title}</video:title>`,
              `      <video:description>${desc}</video:description>`,
              contentLoc ? `      <video:content_loc>${contentLoc}</video:content_loc>` : null,
              `      <video:publication_date>${pubDate}</video:publication_date>`,
              duration ? `      <video:duration>${duration}</video:duration>` : null,
              `    </video:video>`,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`,
          videoBlocks,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
