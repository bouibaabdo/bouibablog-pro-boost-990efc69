import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getPosts } from "@/lib/blogger.functions";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const BASE_URL = "https://edu.bouibacademy.me";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const result = await getPosts({ data: { max: 500 } });

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/posts", changefreq: "daily", priority: "0.9" },
          { path: "/tools", changefreq: "weekly", priority: "0.8" },
          { path: "/tools/image", changefreq: "monthly", priority: "0.7" },
          { path: "/tools/summarize", changefreq: "monthly", priority: "0.7" },
          { path: "/tools/ideas", changefreq: "monthly", priority: "0.7" },
          { path: "/tools/translate", changefreq: "monthly", priority: "0.7" },
          { path: "/tools/seo", changefreq: "monthly", priority: "0.7" },
          { path: "/about", changefreq: "monthly", priority: "0.5" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
        ];

        result.posts.forEach((post) => {
          entries.push({
            path: `/posts/${post.id}`,
            lastmod: post.updated.split("T")[0],
            changefreq: "weekly",
            priority: "0.8",
          });
        });

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${baseUrl}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
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

