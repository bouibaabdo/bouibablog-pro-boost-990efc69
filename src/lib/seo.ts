export const SITE_URL = "https://www.bouibacademy.me";
export const SITE_NAME = "Bouiba Academy";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-banner.png`;

export interface SeoOptions {
  /** Route path starting with "/" (e.g. "/tools/seo") */
  path: string;
  title: string;
  description: string;
  /** Optional keyword list rendered as <meta name="keywords"> */
  keywords?: string[];
  /** Absolute https URL of a meaningful page image */
  image?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
  /** Override the og:title / twitter:title (defaults to `title`) */
  socialTitle?: string;
}

type MetaTag = Record<string, string>;

/**
 * Builds a complete, consistent head() payload for a route:
 * title, description, keywords, canonical, Open Graph and Twitter cards.
 */
export function buildSeo(options: SeoOptions): {
  meta: MetaTag[];
  links: { rel: string; href: string }[];
} {
  const {
    path,
    title,
    description,
    keywords,
    image = DEFAULT_OG_IMAGE,
    type = "website",
    noindex = false,
    socialTitle,
  } = options;

  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const ogTitle = socialTitle ?? title;

  const meta: MetaTag[] = [
    { title },
    { name: "description", content: description, key: "description" },
    { property: "og:title", content: ogTitle, key: "og:title" },
    { property: "og:description", content: description, key: "og:description" },
    { property: "og:type", content: type, key: "og:type" },
    { property: "og:url", content: url, key: "og:url" },
    { property: "og:site_name", content: SITE_NAME, key: "og:site_name" },
    { property: "og:image", content: image, key: "og:image" },
    { name: "twitter:card", content: "summary_large_image", key: "twitter:card" },
    { name: "twitter:title", content: ogTitle, key: "twitter:title" },
    { name: "twitter:description", content: description, key: "twitter:description" },
    { name: "twitter:image", content: image, key: "twitter:image" },
  ];

  if (keywords?.length) {
    meta.push({ name: "keywords", content: keywords.join("، "), key: "keywords" });
  }

  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow", key: "robots" });
  }

  return {
    meta,
    links: noindex ? [] : [{ rel: "canonical", href: url }],
  };
}
