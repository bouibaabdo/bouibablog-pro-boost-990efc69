import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getPosts } from "@/lib/blogger.functions";
import { buildUrlset, SITEMAP_BASE_URL, xmlResponse, type SitemapEntry } from "@/lib/sitemap-utils";

export const Route = createFileRoute("/sitemap-posts.xml")({
  server: {
    handlers: {
      GET: async () => {
        const result = await getPosts({ data: { max: 500 } });

        const uniqueSlugs = new Set<string>();
        const entries: SitemapEntry[] = [];
        for (const post of result.posts) {
          const slug = post.slug.trim().toLowerCase();
          if (slug && !uniqueSlugs.has(slug)) {
            uniqueSlugs.add(slug);
            entries.push({
              path: `/posts/${slug}`,
              lastmod: post.updated.split("T")[0],
              changefreq: "weekly",
              priority: "0.8",
            });
          }
        }

        return xmlResponse(buildUrlset(SITEMAP_BASE_URL, entries));
      },
    },
  },
});
