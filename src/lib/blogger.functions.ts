import { createServerFn } from "@tanstack/react-start";

const FEED_BASE = "https://academybouiba.blogspot.com/feeds/posts/default";

export interface BloggerPost {
  id: string;
  slug: string;
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
    const match = u.pathname.match(/^\/\d{4}\/\d{2}\/([^\/]+)\.html$/);
    let slug = "";
    if (match && match[1]) {
      slug = match[1];
    } else {
      slug = u.pathname.replace(/^\/+|\.html$|\/+$/g, "").replace(/\//g, "-");
    }
    // Clean Blogger's auto-generated unique ID suffixes (e.g. _15, _01699559454)
    return slug.replace(/_\d+$/, "");
  } catch {
    return "";
  }
}

function extractThumbnail(html: string, media?: { url: string }): string | undefined {
  if (media?.url) return media.url.replace(/\/s\d+(-c)?\//, "/s1600/");
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1];
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
export function optimizeBloggerImage(url: string | undefined, w: number, h: number): string | undefined {
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
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function transformEntry(entry: RawEntry): BloggerPost {
  const id = extractPostId(entry.id.$t);
  const contentHtml = entry.content?.$t ?? "";
  const plain = stripHtml(contentHtml);
  const words = plain.split(/\s+/).length;
  const alt = entry.link.find((l) => l.rel === "alternate");
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
    excerpt: plain.slice(0, 200),
    thumbnail: extractThumbnail(contentHtml, entry.media$thumbnail),
    url: alt?.href ?? `https://www.bouibacademy.me/`,
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
}

async function fetchFeed(params: Record<string, string>): Promise<{ posts: BloggerPost[]; total: number }> {
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
    return year >= 2024;
  });
  return {
    posts: filteredPosts,
    total: filteredPosts.length,
  };
}

function parseMarkdownToHtml(md: string): string {
  if (!md) return "";
  let html = md;

  // Code blocks: ```lang ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (_, lang, code) => {
    return `<pre class="language-${lang}"><code class="language-${lang}">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, "<code class='bg-muted px-1.5 py-0.5 rounded text-sm'>$1</code>");

  // Headers: # H1, ## H2, ### H3
  html = html.replace(/^#\s+(.+)$/gm, "<h1 class='text-3xl font-extrabold my-6 font-display'>$1</h1>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2 class='text-2xl font-bold my-5 font-display border-b border-border pb-2'>$1</h2>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3 class='text-xl font-bold my-4 font-display'>$1</h3>");

  // Alerts: > [!IMPORTANT] or > [!NOTE]
  html = html.replace(/^>\s+\[!(IMPORTANT|WARNING|TIP|NOTE|CAUTION)\]\n([\s\S]*?)(?=\n\n|\n[^>])/gm, (_, type, text) => {
    const color = type === "IMPORTANT" ? "border-primary bg-primary/5 text-foreground" : "border-amber-500 bg-amber-500/5 text-foreground";
    return `<div class="border-r-4 ${color} p-4 my-4 rounded-l-md">${text.replace(/^>\s?/gm, "").trim()}</div>`;
  });

  // Blockquotes: > quote
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote class='border-r-4 border-muted p-4 my-4 italic'>$1</blockquote>");

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-primary hover:underline font-semibold'>$1</a>");

  // Unordered lists: - item or * item
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, "<li class='list-disc mr-6 my-1'>$1</li>");
  html = html.replace(/(<li class='list-disc mr-6 my-1'>[\s\S]*?<\/li>)/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Ordered lists: 1. item
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, "<li class='list-decimal mr-6 my-1'>$1</li>");
  html = html.replace(/(<li class='list-decimal mr-6 my-1'>[\s\S]*?<\/li>)/g, (match) => {
    return `<ol>${match}</ol>`;
  });
  html = html.replace(/<\/ol>\s*<ol>/g, "");

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Paragraphs (split by double newlines)
  const lines = html.split(/\n\n+/);
  html = lines.map(line => {
    line = line.trim();
    if (!line) return "";
    if (/^<(h\d|pre|blockquote|div|ul|ol|li)/.test(line)) {
      return line;
    }
    return `<p class="my-4 leading-relaxed">${line}</p>`;
  }).join("\n");

  return html;
}

async function loadLocalPosts(): Promise<BloggerPost[]> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const postsDir = path.join(process.cwd(), "content", "posts");
    
    try {
      await fs.access(postsDir);
    } catch {
      return [];
    }

    const dirs = await fs.readdir(postsDir);
    const posts: BloggerPost[] = [];

    for (const dirName of dirs) {
      const dirPath = path.join(postsDir, dirName);
      const stat = await fs.stat(dirPath);
      if (!stat.isDirectory()) continue;

      const metaPath = path.join(dirPath, "meta.json");
      const postPath = path.join(dirPath, "post.md");

      try {
        const metaContent = await fs.readFile(metaPath, "utf-8");
        const postContent = await fs.readFile(postPath, "utf-8");
        
        const meta = JSON.parse(metaContent) as {
          title: string;
          slug: string;
          excerpt: string;
          meta_description: string;
          target_keywords: string[];
          category: string;
          tags: string[];
          created_at: string;
          language: string;
        };

        const contentHtml = parseMarkdownToHtml(postContent);
        
        let thumbnail = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop";
        if (meta.slug.includes("ollama") || meta.slug.includes("n8n")) {
          thumbnail = "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop";
        }

        posts.push({
          id: meta.slug,
          slug: meta.slug,
          title: meta.title,
          published: new Date(meta.created_at).toISOString(),
          updated: new Date(meta.created_at).toISOString(),
          author: "Bouiba Academy",
          labels: Array.from(new Set([meta.category, ...meta.tags])),
          contentHtml,
          excerpt: meta.excerpt,
          thumbnail,
          url: `https://www.bouibacademy.me/posts/${meta.slug}`,
          readingMinutes: Math.max(1, Math.round(postContent.split(/\s+/).length / 200)),
        });
      } catch (err) {
        console.error(`Error loading local post in ${dirName}:`, err);
      }
    }
    return posts;
  } catch (err) {
    console.error("Error loading local posts:", err);
    return [];
  }
}

export const getPosts = createServerFn({ method: "GET" })
  .inputValidator((d: { max?: number; label?: string; start?: number } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    // 1. Fetch local posts
    const localPosts = await loadLocalPosts();
    const filteredLocal = data.label
      ? localPosts.filter((p) => p.labels.some((l) => l.toLowerCase() === data.label!.toLowerCase()))
      : localPosts;

    // 2. Fetch Blogger posts
    const params: Record<string, string> = {
      "max-results": String(data.max ?? 30),
      "start-index": String(data.start ?? 1),
    };
    const url = data.label
      ? `${FEED_BASE}/-/${encodeURIComponent(data.label)}`
      : FEED_BASE;
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
          return year >= 2024;
        });
      }
    } catch (err) {
      console.error("Blogger fetch error:", err);
    }

    // 3. Combine and sort
    const combined = [...filteredLocal, ...bloggerPosts].sort(
      (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
    );

    const maxResults = data.max ?? 20;
    const startIndex = (data.start ?? 1) - 1;
    const paginated = combined.slice(startIndex, startIndex + maxResults);

    return {
      posts: paginated,
      total: combined.length,
    };
  });

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    // 1. Check if it matches a local post slug
    const localPosts = await loadLocalPosts();
    const localFound = localPosts.find((p) => p.slug === data.id || p.id === data.id);
    if (localFound) return localFound;

    // 2. Fallback to Blogger API
    const isNumeric = /^\d+$/.test(data.id);
    if (isNumeric) {
      const url = `${FEED_BASE}/${data.id}?alt=json`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return null;
      const json = (await res.json()) as { entry: RawEntry };
      if (!json.entry) return null;
      const post = transformEntry(json.entry);
      const year = new Date(post.published).getFullYear();
      if (year < 2024) return null;
      return post;
    } else {
      // It's a slug! Fetch recent posts (150 results)
      const url = new URL(FEED_BASE);
      url.searchParams.set("alt", "json");
      url.searchParams.set("max-results", "150");
      const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
      if (res.ok) {
        const json = (await res.json()) as { feed: { entry?: RawEntry[] } };
        const entries = json?.feed?.entry ?? [];
        const posts = entries.map(transformEntry);
        const found = posts.find((p) => p.slug === data.id);
        if (found) {
          const year = new Date(found.published).getFullYear();
          if (year < 2024) return null;
          return found;
        }
      }

      // Search by keyword in Blogger
      const searchUrl = new URL(FEED_BASE);
      searchUrl.searchParams.set("alt", "json");
      searchUrl.searchParams.set("max-results", "30");
      searchUrl.searchParams.set("q", data.id.replace(/-/g, " "));
      const sRes = await fetch(searchUrl.toString(), { headers: { Accept: "application/json" } });
      if (sRes.ok) {
        const json = (await sRes.json()) as { feed: { entry?: RawEntry[] } };
        const entries = json?.feed?.entry ?? [];
        const posts = entries.map(transformEntry);
        const found = posts.find((p) => p.slug === data.id);
        if (found) {
          const year = new Date(found.published).getFullYear();
          if (year < 2024) return null;
          return found;
        }
      }

      return null;
    }
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
