import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  buildUrlset,
  SITEMAP_BASE_URL,
  xmlResponse,
  type SitemapEntry,
} from "@/lib/sitemap-utils";

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split("T")[0];
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
          { path: "/posts", changefreq: "daily", priority: "0.9", lastmod: today },
          { path: "/quiz", changefreq: "weekly", priority: "0.8", lastmod: today },
          { path: "/about", changefreq: "monthly", priority: "0.5", lastmod: today },
          { path: "/contact", changefreq: "monthly", priority: "0.5", lastmod: today },
          { path: "/privacy", changefreq: "yearly", priority: "0.3", lastmod: today },
          { path: "/terms", changefreq: "yearly", priority: "0.3", lastmod: today },
          { path: "/disclaimer", changefreq: "yearly", priority: "0.3", lastmod: today },
        ];
        return xmlResponse(buildUrlset(SITEMAP_BASE_URL, entries));
      },
    },
  },
});
