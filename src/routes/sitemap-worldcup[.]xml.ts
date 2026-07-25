import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { buildUrlset, SITEMAP_BASE_URL, xmlResponse, type SitemapEntry } from "@/lib/sitemap-utils";

export const Route = createFileRoute("/sitemap-worldcup.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          {
            path: "/worldcup",
            changefreq: "hourly",
            priority: "0.9",
          },
        ];
        return xmlResponse(buildUrlset(SITEMAP_BASE_URL, entries), 900);
      },
    },
  },
});
