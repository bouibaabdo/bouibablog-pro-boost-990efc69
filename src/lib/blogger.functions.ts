/* eslint-disable no-useless-escape, no-misleading-character-class */
import { createServerFn } from "@tanstack/react-start";

const FEED_BASE = "https://academybouiba.blogspot.com/feeds/posts/default";

export interface BloggerPost {
  id: string;
  slug: string;
  originalSlug?: string;
  metaDescription?: string;
  title: string;
  published: string;
  updated: string;
  author: string;
  authorImage?: string;
  labels: string[];
  contentHtml: string;
  excerpt: string;
  thumbnail?: string;
  url: string;
  readingMinutes: number;
}

interface RawEntry {
  id: { $t: string };
  published: { $t: string };
  updated: { $t: string };
  title: { $t: string };
  content: { $t: string };
  category?: Array<{ term: string }>;
  author?: Array<{
    name: { $t: string };
    gd$image?: { src: string };
  }>;
  link: Array<{ rel: string; href: string; type?: string }>;
  media$thumbnail?: { url: string };
}

function extractPostId(rawId: string): string {
  const m = rawId.match(/post-(\d+)/);
  return m ? m[1] : rawId;
}

function extractSlug(links: RawEntry["link"]): string {
  const alt = links.find((l) => l.rel === "alternate");
  if (!alt) return "";
  try {
    const u = new URL(alt.href);
    // Blogger URLs are of the format: /YYYY/MM/slug.html
    const match = u.pathname.match(/^\/\d{4}\/\d{2}\/([^/]+)\.html$/);
    let slug = "";
    if (match && match[1]) {
      slug = match[1];
    } else {
      slug = u.pathname.replace(/^\/+|\.html$|\/+$/g, "").replace(/\//g, "-");
    }
    // Decode percent-encoded characters (like %20) and strip all spaces/whitespaces
    slug = decodeURIComponent(slug).replace(/\s+/g, "").trim();
    // Do NOT strip the unique ID suffixes (like _15) as it creates duplicate slugs and pages
    return slug;
  } catch {
    return "";
  }
}

function extractThumbnail(html: string, media?: { url: string }): string | undefined {
  let url: string | undefined = undefined;
  if (media?.url) {
    url = media.url;
  } else {
    // Look for all img tags and find the first one that is a real post image
    const imgRegex = /<img\s+[^>]*\bsrc=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      const candidate = match[1];
      if (candidate && !candidate.includes("analytics") && !candidate.includes("pixel") && !candidate.endsWith(".gif")) {
        url = candidate;
        break;
      }
    }
    // Fallback to first img tag if none of the above matches
    if (!url) {
      const fallbackMatch = html.match(/<img\s+[^>]*\bsrc=["']([^"']+)["']/i);
      url = fallbackMatch?.[1];
    }
  }

  if (!url) return undefined;

  // Convert http to https to avoid mixed-content issues
  if (url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }

  // Normalize blogger image sizes to s1600 (full resolution)
  if (/googleusercontent\.com|blogspot\.com|blogger\.com/.test(url)) {
    url = url.replace(/\/s\d+(-c)?\//, "/s1600/")
             .replace(/\/w\d+-h\d+[^/]*\//, "/s1600/");
  }

  // Remove any ampersand entity encoding
  return url.replace(/&amp;/g, "&");
}

/**
 * Optimize any remote image URL to serve WebP at a target size.
 * - googleusercontent/blogger: native `=wXXX-hYYY-c-rw` transform (no proxy).
 * - other remote hosts (manuscdn, picsum, pollinations, yalladown, ...):
 *   proxied through images.weserv.nl (free CDN, returns WebP at requested size).
 * - data URIs or same-origin (`/…`): returned unchanged.
 * For Google URLs that already carry a `=...` suffix, the suffix is replaced
 * (not appended twice) so the transform is always honored.
 */
export function optimizeBloggerImage(
  url: string | undefined,
  w: number,
  h: number,
): string | undefined {
  if (!url) return url;
  if (url.startsWith("data:") || url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    if (/googleusercontent\.com$|blogspot\.com$|blogger\.com$/.test(u.hostname)) {
      const spec = `w${w}-h${h}-c-rw`;
      if (/\/s\d+(-c)?\//.test(u.pathname)) {
        u.pathname = u.pathname.replace(/\/s\d+(-c)?\//, `/${spec}/`);
        return u.toString();
      }
      if (/\/w\d+-h\d+[^/]*\//.test(u.pathname)) {
        u.pathname = u.pathname.replace(/\/w\d+-h\d+[^/]*\//, `/${spec}/`);
        return u.toString();
      }
      const base = u.origin + u.pathname; // strip any `=...` suffix or query
      return `${base}=${spec}`;
    }
    // Return original URL for other hosts since Weserv proxying triggers 403 hotlink protection.
    // Also clean up any encoded ampersands.
    return url.replace(/&amp;/g, "&");
  } catch {
    return url;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;nbsp;/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const EXCLUDED_SLUGS = new Set([
  "efootball-pes-2021-510",
  "8-ball-pool-522",
  "snaptube",
  "happymod-2",
  "fluid-simulation-free-253",
  "gps",
]);

export function isExcludedPost(slug: string, id: string): boolean {
  const s = slug.trim().toLowerCase();
  const i = id.trim().toLowerCase();
  return EXCLUDED_SLUGS.has(s) || EXCLUDED_SLUGS.has(i);
}

export function isUglySlug(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  return (
    s === "blog-post" ||
    s.startsWith("blog-post_") ||
    /^\d+$/.test(s) ||
    /^\d+_\d+$/.test(s) ||
    /^\d+-\d+_\d+$/.test(s) ||
    s.includes("%20") ||
    s.startsWith(" ")
  );
}

export function slugify(text: string): string {
  if (!text) return "";
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s-]+/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const segments = cleaned.split("-");
  if (segments.length > 8) {
    return segments.slice(0, 8).join("-");
  }
  return cleaned;
}

export function cleanExcerpt(text: string): string {
  let cleaned = text;

  // 1. Strip up to the reading time keyword
  // eslint-disable-next-line no-misleading-character-class
  cleaned = cleaned.replace(/^.*?(?:دقائق|دقيقة|ساعات|ساعة)\s*(?:[|&nbsp;\-⏱️📅\s\uFE0F]*)/gu, "");

  // 2. Strip up to a date-like pattern followed by separator
  // eslint-disable-next-line no-misleading-character-class
  cleaned = cleaned.replace(
    /^.*?(?:يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)\s+\d{4}\s*(?:[|&nbsp;\-⏱️📅\s\uFE0F]*)/gu,
    "",
  );

  // 3. Remove leading emojis, variation selectors, separators, or spaces
  cleaned = cleaned.replace(/^[^\p{L}\p{N}]+/gu, "");

  if (cleaned.trim().length < 20) {
    cleaned = text;
  }

  cleaned = cleaned
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

export function assignPrettySlugs(posts: BloggerPost[]): BloggerPost[] {
  const slugCounts = new Map<string, number>();

  const candidates = posts.map((post) => {
    let slugCandidate = post.slug;
    if (isUglySlug(post.slug)) {
      slugCandidate = slugify(post.title);
      if (!slugCandidate) {
        slugCandidate = `post-${post.id}`;
      }
    } else {
      try {
        slugCandidate = decodeURIComponent(slugCandidate);
      } catch {
        // use as is
      }
      slugCandidate = slugCandidate.replace(/\s+/g, "").replace(/%20/g, "").trim();
    }

    slugCandidate = slugCandidate.toLowerCase().replace(/^-+|-+$/g, "");

    return { post, candidate: slugCandidate };
  });

  candidates.forEach((c) => {
    slugCounts.set(c.candidate, (slugCounts.get(c.candidate) ?? 0) + 1);
  });

  return candidates.map((c) => {
    let finalSlug = c.candidate;
    if (slugCounts.get(c.candidate)! > 1) {
      const suffix = c.post.id.slice(-4);
      finalSlug = `${c.candidate}-${suffix}`;
    }

    return {
      ...c.post,
      originalSlug: c.post.slug,
      slug: finalSlug,
      url: `https://www.bouibacademy.me/posts/${finalSlug}`,
    };
  });
}

function transformEntry(entry: RawEntry): BloggerPost {
  const id = extractPostId(entry.id.$t);
  const contentHtml = entry.content?.$t ?? "";
  const plain = stripHtml(contentHtml);
  const words = plain.split(/\s+/).length;
  const alt = entry.link.find((l) => l.rel === "alternate");
  const cleanedExcerpt = cleanExcerpt(plain);
  return {
    id,
    slug: (extractSlug(entry.link) || id).trim(),
    title: entry.title.$t,
    published: entry.published.$t,
    updated: entry.updated.$t,
    author: entry.author?.[0]?.name.$t ?? "AcademyBouiba",
    authorImage: entry.author?.[0]?.gd$image?.src,
    labels: (entry.category ?? []).map((c) => c.term),
    contentHtml,
    excerpt: cleanedExcerpt,
    metaDescription: cleanedExcerpt.slice(0, 160),
    thumbnail: extractThumbnail(contentHtml, entry.media$thumbnail),
    url: alt?.href ?? `https://www.bouibacademy.me/`,
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
}

async function fetchFeed(
  params: Record<string, string>,
): Promise<{ posts: BloggerPost[]; total: number }> {
  const url = new URL(FEED_BASE);
  url.searchParams.set("alt", "json");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  let res: Response;
  try {
    res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  } catch (e) {
    console.error("Blogger fetch error:", e);
    return { posts: [], total: 0 };
  }
  if (!res.ok) {
    console.error(`Blogger feed failed: ${res.status}`);
    return { posts: [], total: 0 };
  }
  const json = (await res.json().catch(() => null)) as {
    feed: {
      entry?: RawEntry[];
      openSearch$totalResults?: { $t: string };
    };
  } | null;
  if (!json?.feed) return { posts: [], total: 0 };
  const entries = json.feed.entry ?? [];
  const allPosts = entries.map(transformEntry);
  const filteredPosts = allPosts.filter((p) => {
    const year = new Date(p.published).getFullYear();
    return year >= 2024 && !isExcludedPost(p.slug, p.id);
  });
  return {
    posts: filteredPosts,
    total: filteredPosts.length,
  };
}

function parseMarkdownToHtml(md: string): string {
  if (!md) return "";
  let html = md;

  // 1. Code blocks: ```lang ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `\n\n<pre class="language-${lang} bg-muted/80 p-4 rounded-xl overflow-x-auto text-sm my-6 border border-border"><code class="language-${lang}">${escaped}</code></pre>\n\n`;
  });

  // 2. Horizontal Rules: --- or ***
  html = html.replace(/^(\s*[-*_]\s*){3,}$/gm, "\n\n<hr class=\"my-8 border-border\" />\n\n");

  // 3. GitHub style alerts: > [!IMPORTANT]
  html = html.replace(
    /^>\s+\[!(IMPORTANT|WARNING|TIP|NOTE|CAUTION)\]\n([\s\S]*?)(?=\n\n|\n[^>])/gm,
    (_, type, text) => {
      const color =
        type === "IMPORTANT"
          ? "border-r-4 border-primary bg-primary/10 text-foreground"
          : "border-r-4 border-amber-500 bg-amber-500/10 text-foreground";
      const cleanText = text.replace(/^>\s?/gm, "").trim();
      return `\n\n<div class="${color} p-4 my-6 rounded-l-xl">${cleanText}</div>\n\n`;
    }
  );

  // 4. Blockquotes: > quote
  html = html.replace(/^>\s+(.+)$/gm, "\n\n<blockquote class=\"border-r-4 border-primary/40 pr-4 py-2 my-4 italic text-muted-foreground bg-accent/20 rounded-l-lg\">$1</blockquote>\n\n");

  // 5. Headers: # H1, ## H2, ### H3, #### H4
  html = html.replace(/^####\s+(.+)$/gm, "\n\n<h4 class=\"text-lg font-bold mt-6 mb-3 font-display text-foreground\">$1</h4>\n\n");
  html = html.replace(/^###\s+(.+)$/gm, "\n\n<h3 class=\"text-xl font-bold mt-8 mb-4 font-display text-foreground border-r-2 border-primary pr-3\">$1</h3>\n\n");
  html = html.replace(/^##\s+(.+)$/gm, "\n\n<h2 class=\"text-2xl font-bold mt-10 mb-5 font-display text-foreground border-b border-border/80 pb-2\">$1</h2>\n\n");
  html = html.replace(/^#\s+(.+)$/gm, "\n\n<h1 class=\"text-3xl md:text-4xl font-extrabold mt-12 mb-6 font-display text-foreground\">$1</h1>\n\n");

  // 6. Inline elements: bold, italic, code, links
  html = html.replace(/`([^`]+)`/g, "<code class=\"bg-accent px-1.5 py-0.5 rounded text-sm font-mono text-primary\">$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong class=\"font-bold text-foreground\">$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-primary hover:underline font-semibold\">$1</a>");

  // 7. Lists: Unordered (- or *) & Ordered (1.)
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, "<li class=\"my-1.5 leading-relaxed\">$1</li>");
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, "<li class=\"my-1.5 leading-relaxed\">$1</li>");

  // Group adjacent <li> tags
  html = html.replace(/(<li[\s\S]*?<\/li>\n?)+/g, (match) => {
    return `\n\n<ul class="list-disc pr-6 my-4 space-y-1 text-muted-foreground">${match}</ul>\n\n`;
  });

  // 8. Process Paragraphs
  const blocks = html.split(/\n\n+/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|pre|blockquote|div|ul|ol|hr)/.test(trimmed)) {
        return trimmed;
      }
      return `<p class="my-4 leading-relaxed text-muted-foreground text-base md:text-lg">${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

async function loadLocalPosts(): Promise<BloggerPost[]> {
  const posts: BloggerPost[] = [];

  // 1. Try Vite static glob import (works in all production workers & client/server builds)
  try {
    const metaFiles = import.meta.glob<{ default: any }>("../../content/posts/*/meta.json", {
      eager: true,
    });
    const mdFiles = import.meta.glob<{ default: string }>("../../content/posts/*/post.md", {
      eager: true,
      query: "?raw",
      import: "default",
    });

    for (const [metaPath, metaObj] of Object.entries(metaFiles)) {
      try {
        const meta = (metaObj && (metaObj as any).default) ? (metaObj as any).default : metaObj;
        const mdPath = metaPath.replace("meta.json", "post.md");
        const rawMd = mdFiles[mdPath];
        const postContent = typeof rawMd === "string" ? rawMd : (rawMd as any)?.default || "";

        const contentHtml = parseMarkdownToHtml(postContent);

        let thumbnail =
          meta.thumbnail ||
          meta.cover_image ||
          (meta.slug?.includes("ollama") || meta.slug?.includes("n8n")
            ? "https://www.bouibacademy.me/ollama-n8n-cover.webp"
            : "https://www.bouibacademy.me/n8n-workflows-cover.webp");

        const excerptText = meta.meta_description || meta.excerpt || "";
        posts.push({
          id: meta.slug,
          slug: meta.slug,
          title: meta.title,
          published: new Date(meta.created_at || Date.now()).toISOString(),
          updated: new Date(meta.created_at || Date.now()).toISOString(),
          author: "Bouiba Academy",
          labels: Array.from(new Set([meta.category, ...(meta.tags || [])].filter(Boolean))),
          contentHtml,
          excerpt: meta.excerpt || meta.meta_description || "",
          metaDescription: excerptText,
          thumbnail,
          url: `https://www.bouibacademy.me/posts/${meta.slug}`,
          readingMinutes: Math.max(1, Math.round((postContent || "").split(/\s+/).length / 200)),
        });
      } catch (err) {
        console.error(`Error parsing bundled post ${metaPath}:`, err);
      }
    }
  } catch (err) {
    console.error("Vite glob import error:", err);
  }

  if (posts.length > 0) return posts;

  // 2. Fallback to fs for Node environment if glob returned nothing
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const postsDir = path.join(process.cwd(), "content", "posts");

    await fs.access(postsDir);
    const dirs = await fs.readdir(postsDir);

    for (const dirName of dirs) {
      const dirPath = path.join(postsDir, dirName);
      const stat = await fs.stat(dirPath);
      if (!stat.isDirectory()) continue;

      const metaPath = path.join(dirPath, "meta.json");
      const postPath = path.join(dirPath, "post.md");

      try {
        const metaContent = await fs.readFile(metaPath, "utf-8");
        const postContent = await fs.readFile(postPath, "utf-8");
        const meta = JSON.parse(metaContent);
        const contentHtml = parseMarkdownToHtml(postContent);

        // Use WebP versions of cover images for better performance
        let thumbnail =
          "https://www.bouibacademy.me/n8n-workflows-cover.webp";
        if (meta.slug.includes("ollama") || meta.slug.includes("n8n")) {
          thumbnail = "https://www.bouibacademy.me/ollama-n8n-cover.webp";
        }

        const excerptText = meta.meta_description || meta.excerpt;
        posts.push({
          id: meta.slug,
          slug: meta.slug,
          title: meta.title,
          published: new Date(meta.created_at).toISOString(),
          updated: new Date(meta.created_at).toISOString(),
          author: "Bouiba Academy",
          labels: Array.from(new Set([meta.category, ...(meta.tags || [])].filter(Boolean))),
          contentHtml,
          excerpt: meta.excerpt,
          metaDescription: excerptText,
          thumbnail,
          url: `https://www.bouibacademy.me/posts/${meta.slug}`,
          readingMinutes: Math.max(1, Math.round(postContent.split(/\s+/).length / 200)),
        });
      } catch (err) {
        console.error(`Error loading local post in ${dirName}:`, err);
      }
    }
  } catch (err) {
    // Ignore fs errors in edge environments
  }

  return posts;
}

export const getPosts = createServerFn({ method: "GET" })
  .validator(
    (d: { max?: number; label?: string; start?: number; q?: string } | undefined) => d ?? {},
  )
  .handler(async ({ data }) => {
    // 1. Fetch local posts
    const localPosts = await loadLocalPosts();
    const filteredLocal = data.label
      ? localPosts.filter((p) =>
          p.labels.some((l) => l.toLowerCase() === data.label!.toLowerCase()),
        )
      : localPosts;

    // 2. Fetch Blogger posts
    const params: Record<string, string> = {
      "max-results": String(data.max ?? 30),
      "start-index": String(data.start ?? 1),
    };
    const url = data.label ? `${FEED_BASE}/-/${encodeURIComponent(data.label)}` : FEED_BASE;
    const q = new URL(url);
    q.searchParams.set("alt", "json");
    Object.entries(params).forEach(([k, v]) => q.searchParams.set(k, v));

    let bloggerPosts: BloggerPost[] = [];
    try {
      const res = await fetch(q.toString(), { headers: { Accept: "application/json" } });
      if (res.ok) {
        const json = (await res.json()) as {
          feed: { entry?: RawEntry[]; openSearch$totalResults?: { $t: string } };
        };
        const entries = json.feed.entry ?? [];
        bloggerPosts = entries.map(transformEntry).filter((p) => {
          const year = new Date(p.published).getFullYear();
          return year >= 2024 && !isExcludedPost(p.slug, p.id);
        });
      }
    } catch (err) {
      console.error("Blogger fetch error:", err);
    }

    // 3. Combine and sort
    let combined = [...filteredLocal, ...bloggerPosts].filter((p) => !isExcludedPost(p.slug, p.id));
    combined = assignPrettySlugs(combined).sort(
      (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
    );

    // Apply search query filter if provided
    if (data.q) {
      const queryVal = data.q.toLowerCase().trim();
      combined = combined.filter(
        (p) =>
          p.title.toLowerCase().includes(queryVal) ||
          p.excerpt.toLowerCase().includes(queryVal) ||
          p.contentHtml.toLowerCase().includes(queryVal),
      );
    }

    const maxResults = data.max ?? 20;
    const startIndex = (data.start ?? 1) - 1;
    const paginated = combined.slice(startIndex, startIndex + maxResults);

    return {
      posts: paginated,
      total: combined.length,
    };
  });

export const getPost = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const decodedId = decodeURIComponent(data.id).trim().toLowerCase();

    // 1. Fetch all posts (max 500) which are already processed with pretty slugs
    const allPostsResult = await getPosts({ data: { max: 500 } });
    const posts = allPostsResult.posts;

    // 2. Look for matches against: slug, id, or originalSlug
    const found = posts.find(
      (p) =>
        p.slug.toLowerCase() === decodedId ||
        p.id.toLowerCase() === decodedId ||
        p.originalSlug?.toLowerCase() === decodedId,
    );

    if (found) {
      return found;
    }

    // 3. Fallback: if not found in the combined list, do direct lookup
    const isNumeric = /^\d+$/.test(data.id);
    if (isNumeric) {
      if (isExcludedPost("", data.id)) return null;
      const url = `${FEED_BASE}/${data.id}?alt=json`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return null;
      const json = (await res.json()) as { entry: RawEntry };
      if (!json.entry) return null;
      const post = transformEntry(json.entry);
      const year = new Date(post.published).getFullYear();
      if (year < 2024 || isExcludedPost(post.slug, post.id)) return null;
      return assignPrettySlugs([post])[0];
    }

    return null;
  });

export const getLabels = createServerFn({ method: "GET" }).handler(async () => {
  // Fetch from Blogger
  const result = await fetchFeed({ "max-results": "150" });
  const counts = new Map<string, number>();

  result.posts.forEach((p) => {
    p.labels.forEach((l) => counts.set(l, (counts.get(l) ?? 0) + 1));
  });

  // Combine with local labels
  try {
    const localPosts = await loadLocalPosts();
    localPosts.forEach((p) => {
      p.labels.forEach((l) => counts.set(l, (counts.get(l) ?? 0) + 1));
    });
  } catch (err) {
    console.error("Error aggregating local labels:", err);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
});
