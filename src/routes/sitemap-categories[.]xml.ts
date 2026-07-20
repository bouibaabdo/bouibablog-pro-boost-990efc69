import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getPosts } from "@/lib/blogger.functions";
import { buildUrlset, SITEMAP_BASE_URL, xmlResponse, type SitemapEntry } from "@/lib/sitemap-utils";

export const Route = createFileRoute("/sitemap-categories.xml")({
  server: {
    handlers: {
      GET: async () => {
        const result = await getPosts({ data: { max: 500 } });
        const today = new Date().toISOString().split("T")[0];

        const uniqueLabels = new Set<string>();
        for (const post of result.posts) {
          for (const label of post.labels) {
            if (label && label.trim()) {
              uniqueLabels.add(label.trim());
            }
          }
        }

        const entries: SitemapEntry[] = Array.from(uniqueLabels).map((label) => ({
          path: `/posts?label=${encodeURIComponent(label)}`,
          lastmod: today,
          changefreq: "weekly",
          priority: "0.7",
        }));

        return xmlResponse(buildUrlset(SITEMAP_BASE_URL, entries));
      },
    },
  },
});
