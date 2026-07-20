export interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

export function encodePath(path: string): string {
  if (!path) return "";
  const [pathname, query] = path.split("?");
  const encodedPathname = pathname
    .split("/")
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");

  if (!query) return encodedPathname;

  const encodedQuery = query
    .split("&")
    .map((pair) => {
      const [key, val] = pair.split("=");
      if (!val) return key;
      try {
        return `${key}=${encodeURIComponent(decodeURIComponent(val))}`;
      } catch {
        return `${key}=${encodeURIComponent(val)}`;
      }
    })
    .join("&");

  return `${encodedPathname}?${encodedQuery}`;
}

export function buildUrlset(baseUrl: string, entries: SitemapEntry[]): string {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${baseUrl}${encodePath(e.path)}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

export const SITEMAP_BASE_URL = "https://www.bouibacademy.me";

export function xmlResponse(xml: string, maxAge = 3600): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}
