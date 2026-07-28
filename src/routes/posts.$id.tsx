import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Calendar, Clock, ArrowRight, Tag, Sparkles, Loader2, BrainCircuit } from "lucide-react";
import { getPost, getPosts } from "@/lib/blogger.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TodayMatchesRail } from "@/components/today-matches-rail";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";

function makeQuery(id: string) {
  return queryOptions({
    queryKey: ["post", id],
    queryFn: () => getPost({ data: { id } }),
    staleTime: 10 * 60_000,
  });
}

const recentPostsQueryOptions = queryOptions({
  queryKey: ["posts", "recent-list"],
  queryFn: () => getPosts({ data: { max: 15 } }),
  staleTime: 5 * 60_000,
});

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const Route = createFileRoute("/posts/$id")({
  loader: async ({ context, params }) => {
    const post = await context.queryClient.ensureQueryData(makeQuery(params.id));
    if (!post) throw notFound();

    // 301 redirect if requested slug matches an old slug / numeric ID instead of pretty slug
    if (params.id !== post.slug) {
      throw redirect({
        to: "/posts/$id",
        params: { id: post.slug },
        statusCode: 301,
      });
    }

    return post;
  },
  head: ({ params, loaderData }) => {
    const post = loaderData;
    const SUFFIX = " — Bouiba Academy";
    const rawDesc = post
      ? post.metaDescription || post.excerpt
      : "مقال من أكاديمية بويبة للذكاء الاصطناعي.";
    // Trim description to Google's 155-char limit to avoid "Meta Description طويلة" issues
    const desc = rawDesc.length > 150 ? rawDesc.slice(0, 148) + "…" : rawDesc;
    // Use full title to preserve all keywords for SEO, letting Google handle SERP limits visually
    const rawTitle = post?.title ?? "مقال";
    const title = `${rawTitle}${SUFFIX}`;
    const canonical = `https://www.bouibacademy.me/posts/${post?.slug ?? params.id}`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc, key: "description" },
      { property: "og:type", content: "article", key: "og:type" },
      { property: "og:title", content: post?.title ?? "مقال — Bouiba Academy", key: "og:title" },
      { property: "og:description", content: desc, key: "og:description" },
      { property: "og:url", content: canonical, key: "og:url" },
      { name: "twitter:card", content: "summary_large_image", key: "twitter:card" },
      {
        name: "twitter:title",
        content: post?.title ?? "مقال — Bouiba Academy",
        key: "twitter:title",
      },
      { name: "twitter:description", content: desc, key: "twitter:description" },
    ];
    if (post?.thumbnail) {
      meta.push({ property: "og:image", content: post.thumbnail, key: "og:image" });
      meta.push({ name: "twitter:image", content: post.thumbnail, key: "twitter:image" });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: canonical }],
      scripts: post
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: post.title,
                datePublished: post.published,
                dateModified: post.updated,
                author: {
                  "@type": "Person",
                  name:
                    post.author === "AcademyBouiba" || post.author === "Bouiba Academy"
                      ? "فريق Bouiba Academy"
                      : post.author,
                  url: "https://www.bouibacademy.me/about",
                  image: post.authorImage || "https://www.bouibacademy.me/favicon.png",
                },
                image: post.thumbnail,
                mainEntityOfPage: canonical,
                publisher: { "@type": "Organization", name: "Bouiba Academy" },
              }),
            },
          ]
        : [],
    };
  },
  component: PostPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-20 text-center text-muted-foreground">
        تعذر التحميل: {error.message}
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl font-bold">المقال غير موجود</h1>
        <Link to="/posts" className="mt-6 inline-block text-primary font-semibold">
          ← العودة للمقالات
        </Link>
      </div>
    </div>
  ),
});

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function PostPage() {
  const { id } = Route.useParams();
  const { data: post } = useSuspenseQuery(makeQuery(id));
  const { data: recentResult } = useQuery(recentPostsQueryOptions);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (summary) {
      setShowSummaryModal(true);
      return;
    }

    setIsSummarizing(true);
    setSummaryError(null);
    setShowSummaryModal(true);

    try {
      const textToSummarize = stripHtml(post.contentHtml).slice(0, 8000);
      const res = await fetch("/api/tools/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize",
          input: textToSummarize,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let parsedErr = "تعذر الاتصال بالخادم";
        try {
          const parsed = JSON.parse(errText);
          parsedErr = parsed.error || parsedErr;
        } catch {
          parsedErr = errText || parsedErr;
        }
        throw new Error(parsedErr);
      }

      const json = await res.json();
      if (json.error) {
        throw new Error(json.error);
      }

      setSummary(json.text || "");

      // Track successful summarization event
      trackEvent("summarize_article", { postSlug: post.slug, title: post.title });
    } catch (err: any) {
      console.error("[Post Summarize Error]", err);
      const errMsg = err.message || "حدث خطأ غير متوقع أثناء تلخيص المقال.";
      setSummaryError(errMsg);

      // Track failed summarization event
      trackEvent("summarize_article_failed", { postSlug: post.slug, error: errMsg });
    } finally {
      setIsSummarizing(false);
    }
  };

  const relatedPosts = useMemo(() => {
    if (!recentResult?.posts || !post) return [];
    // Filter out the current post
    const otherPosts = recentResult.posts.filter((p) => p.id !== post.id);

    // Find posts with matching labels
    const matched = otherPosts.filter((p) => p.labels.some((l) => post.labels.includes(l)));

    // Fill up to 3 posts if we don't have enough matched ones
    const fillCount = 3 - matched.length;
    if (fillCount > 0) {
      const fallback = otherPosts.filter((p) => !matched.some((m) => m.id === p.id));
      matched.push(...fallback.slice(0, fillCount));
    }

    return matched.slice(0, 3);
  }, [recentResult, post]);

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <article>
        {/* Header */}
        <header className="hero-bg border-b border-border">
          <div className="container-page max-w-3xl py-14 md:py-20">
            <Link
              to="/posts"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
            >
              <ArrowRight className="h-4 w-4" /> جميع المقالات
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold text-muted-foreground ml-2">تصنيف المقال:</span>
              {post.labels.map((l) => (
                <Link
                  key={l}
                  to="/posts"
                  search={{ label: l }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <Tag className="h-3 w-3" /> {l}
                </Link>
              ))}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {formatDate(post.published)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {post.readingMinutes} دقائق قراءة
                </span>
                <span>بواسطة {post.author}</span>
              </div>
              <Button
                onClick={handleSummarize}
                variant="outline"
                size="sm"
                className="cursor-pointer gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary rounded-full transition-all duration-300 font-semibold px-4 py-1.5 text-xs md:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
                تلخيص المقال بالذكاء الاصطناعي
              </Button>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="container-page max-w-3xl py-12">
          {post.thumbnail && (
            <div className="mb-10 overflow-hidden rounded-2xl border border-border shadow-soft bg-surface-muted aspect-[16/9]">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          )}
          <div
            className="prose-ar"
            dangerouslySetInnerHTML={{
              __html: post.contentHtml.replace(/<h1\b/gi, "<h2").replace(/<\/h1>/gi, "</h2>"),
            }}
          />

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border">
              <h3 className="font-display text-xl font-bold mb-8 flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary animate-pulse" />
                مقالات ذات صلة قد تهمك
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <PostCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <TodayMatchesRail variant="article" max={8} />

      <SiteFooter />

      {/* Dialog for AI Summary */}
      <Dialog open={showSummaryModal} onOpenChange={setShowSummaryModal}>
        <DialogContent
          className="max-w-xl bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader className="text-right flex flex-row items-center gap-3 border-b border-border/40 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-display text-foreground">
                ملخص المقال بالذكاء الاصطناعي
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                توليد ملخص سريع وشامل لأهم نقاط الدرس باستخدام نموذج Gemini الذكي
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="py-6 min-h-[150px] flex flex-col justify-center">
            {isSummarizing ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="relative flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                  <Sparkles className="absolute h-5 w-5 text-primary animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    جاري قراءة وتحليل المقال...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">يستغرق هذا عادةً بضع ثوانٍ</p>
                </div>
              </div>
            ) : summaryError ? (
              <div className="text-center p-4 border border-destructive/20 bg-destructive/5 rounded-xl">
                <p className="text-sm font-medium text-destructive">{summaryError}</p>
                <Button
                  onClick={handleSummarize}
                  variant="outline"
                  size="sm"
                  className="mt-4 cursor-pointer border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  إعادة المحاولة
                </Button>
              </div>
            ) : summary ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <ul className="space-y-4">
                  {summary
                    .split("\n")
                    .map((line) => line.replace(/^[\s*\-•\d+.]\s*/, "").trim())
                    .filter((line) => line.length > 0)
                    .map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                        </span>
                        <span className="text-foreground leading-relaxed text-base">{pt}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end pt-4 border-t border-border/40">
            <Button
              onClick={() => setShowSummaryModal(false)}
              className="cursor-pointer font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6"
            >
              إغلاق النافذة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
