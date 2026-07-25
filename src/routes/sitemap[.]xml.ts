import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://www.bouibacademy.me";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const sitemaps = [
          `${BASE_URL}/sitemap-pages.xml`,
          `${BASE_URL}/sitemap-posts.xml`,
          `${BASE_URL}/sitemap-categories.xml`,
          `${BASE_URL}/sitemap-videos.xml`,
          `${BASE_URL}/sitemap-tools.xml`,
          `${BASE_URL}/sitemap-worldcup.xml`,
        ];

        const body = sitemaps
          .map((loc) => `  <sitemap>\n    <loc>${loc}</loc>\n  </sitemap>`)
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          body,
          `</sitemapindex>`,
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
