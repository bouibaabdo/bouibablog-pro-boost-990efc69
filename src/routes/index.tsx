import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Sparkles,
  Trophy,
  Wand2,
  Lightbulb,
  Image as ImageIcon,
  Languages,
  FileText,
  Newspaper,
  Search,
  ChevronRight,
  Flame,
  Zap,
  Play,
  Compass,
  BarChart3,
  Bot,
  Layers,
  Clock,
} from "lucide-react";
import { getPosts, getLabels, optimizeBloggerImage } from "@/lib/blogger.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostCard } from "@/components/post-card";
import { TodayMatchesRail } from "@/components/today-matches-rail";

const postsQueryOptions = queryOptions({
  queryKey: ["posts", "home"],
  queryFn: () => getPosts({ data: { max: 9 } }),
  staleTime: 5 * 60_000,
});

const labelsQueryOptions = queryOptions({
  queryKey: ["labels"],
  queryFn: () => getLabels(),
  staleTime: 10 * 60_000,
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

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [data] = await Promise.all([
      context.queryClient.ensureQueryData(postsQueryOptions),
      context.queryClient.ensureQueryData(labelsQueryOptions),
    ]);
    const featured = data.posts[0];
    const lcp = featured ? optimizeBloggerImage(featured.thumbnail, 1200, 675) : "";
    return { lcp };
  },
  head: ({ loaderData }) => {
    const title = "Bouiba Academy — أكاديميتك الذكية للذكاء الاصطناعي كأنك لم ترها من قبل";
    const desc =
      "دروس عملية مجانية في الذكاء الاصطناعي والأتمتة، أدوات ذكاء اصطناعي تفاعلية (توليد الصور، تلخيص النصوص، مسارات التعلم)، ونقل مباشر لمباريات كأس العالم 2026.";
    return {
      meta: [
        { title },
        { name: "description", content: desc, key: "description" },
        { property: "og:title", content: title, key: "og:title" },
        { property: "og:description", content: desc, key: "og:description" },
        { property: "og:url", content: "https://www.bouibacademy.me/", key: "og:url" },
        { name: "twitter:title", content: title, key: "twitter:title" },
        { name: "twitter:description", content: desc, key: "twitter:description" },
      ],
      links: [
        { rel: "canonical", href: "https://www.bouibacademy.me/" },
        ...(loaderData?.lcp
          ? [
              {
                rel: "preload",
                as: "image",
                href: loaderData.lcp,
                fetchpriority: "high",
              } as unknown as { rel: string; href: string },
            ]
          : []),
      ],
    };
  },
  component: HomePage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">
      تعذر تحميل المحتوى: {error.message}
    </div>
  ),
});

const TOOL_CARDS = [
  {
    href: "/tools/image",
    title: "توليد الصور بالذكاء الاصطناعي",
    desc: "حوّل أفكارك ونصك العربي إلى صور واحترافية فائقة الدقة بنقرة واحدة.",
    icon: ImageIcon,
    color: "from-fuchsia-500/20 via-primary/15 to-purple-500/10",
    badge: "شائع 🔥",
    cta: "جرّب التوليد الآن",
  },
  {
    href: "/tools/roadmap",
    title: "مسارات التعلم التفاعلية",
    desc: "خريطة طريق ذكية وشاملة للدراسة واحتراف البرمجة والذكاء الاصطناعي.",
    icon: Compass,
    color: "from-violet-500/20 via-primary/15 to-indigo-500/10",
    badge: "جديد ✨",
    cta: "استكشف المسارات",
  },
  {
    href: "/tools/summarize",
    title: "ملخّص المقالات الذكي",
    desc: "تحويل المقالات الطويلة والمستندات إلى نقاط رئيسية سريعة بدقة.",
    icon: FileText,
    color: "from-emerald-500/20 via-teal-500/15 to-primary/10",
    badge: "سريع ⚡",
    cta: "لخّص المقال",
  },
  {
    href: "/tools/translate",
    title: "المترجم الذكي الدقيق",
    desc: "ترجمة سياقية احترافية بين مختلف اللغات مع الحفاظ على المعنى التقني.",
    icon: Languages,
    color: "from-sky-500/20 via-blue-500/15 to-primary/10",
    badge: "متعدد اللغات 🌐",
    cta: "ابدأ الترجمة",
  },
  {
    href: "/tools/ideas",
    title: "مولّد الأفكار والمشاريع",
    desc: "أفكار محتوى ومشاريع أتمتة مبتكرة تناسب صناع المحتوى والمطورين.",
    icon: Lightbulb,
    color: "from-amber-500/20 via-orange-500/15 to-primary/10",
    badge: "إبداعي 🚀",
    cta: "توليد أفكار",
  },
  {
    href: "/tools/seo",
    title: "مساعد SEO وتصدر المحركات",
    desc: "تحليل وتحسين ترتيب موقعك ومقالاتك في محرك بحث جوجل بسهولة.",
    icon: BarChart3,
    color: "from-rose-500/20 via-red-500/15 to-primary/10",
    badge: "احترافي 📊",
    cta: "حلّل موقعك",
  },
] as const;

function HomePage() {
  const { data } = useSuspenseQuery(postsQueryOptions);
  const { data: labels } = useSuspenseQuery(labelsQueryOptions);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const posts = data.posts;
  const featured = posts[0];
  const rest = posts.slice(1, 7);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/posts", search: { q: searchQuery.trim() } });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <SiteHeader />
      <main>
        {/* HERO SECTION — Ultra Modern Glassmorphism & High-Energy Glow */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background via-surface-muted/50 to-background py-16 md:py-28">
          {/* Decorative Animated Glow Background Orbs */}
          <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute top-1/2 -left-20 h-80 w-80 rounded-full bg-purple-500/15 blur-[100px] pointer-events-none" />

          <div className="container-page relative z-10 text-center">
            {/* Top Live Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-surface/90 backdrop-blur-md px-4 py-1.5 text-xs md:text-sm font-bold text-foreground shadow-soft mb-6 transition-all hover:border-primary/40 hover:scale-105 cursor-default">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="gradient-text font-extrabold">منصتك الشاملة لتعلم الأتمتة والذكاء الاصطناعي بالعربية</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-black leading-tight tracking-tight max-w-4xl mx-auto">
              عصر <span className="gradient-text">الذكاء الاصطناعي</span> والأتمتة
              <br className="hidden sm:block" />
              <span className="text-foreground"> بين يديك بالعربية وباحترافية</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 mx-auto max-w-2xl text-base md:text-xl text-muted-foreground leading-relaxed font-medium">
              دروس عملية مجانية، أدوات AI تفاعلية ومبتكرة للتوليد والتلخيص والترجمة ومسارات التعلم الاحترافية.
            </p>

            {/* Instant Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto relative group">
              <div className="relative flex items-center rounded-2xl border border-border/80 bg-surface/90 backdrop-blur-xl p-1.5 shadow-elegant transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مقال، درس، أداة AI، أو موضوع..."
                  className="w-full bg-transparent px-2 py-2.5 text-sm md:text-base outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:opacity-90 hover:scale-105 shrink-0"
                >
                  <span>بحث</span>
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Fast Action CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
              <Link to="/tools" className="btn-premium px-6 py-3.5 rounded-xl shadow-elegant text-sm font-bold">
                <Wand2 className="h-4 w-4" /> أدوات AI المجانية
              </Link>

              <Link
                to="/quiz"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 border border-violet-500/30 px-6 py-3.5 text-sm font-bold hover:bg-violet-600/20 transition-all shadow-soft"
              >
                <Sparkles className="h-4 w-4 text-violet-500" /> اختبار التوصية الذكي
              </Link>
            </div>
          </div>
        </section>

        {/* Latest Post Featured Showcase Banner */}
        {featured && (
          <div className="container-page pt-12">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-1 shadow-soft group hover:border-primary/40 transition-all duration-300">
              <Link
                to="/posts/$id"
                params={{ id: featured.slug }}
                className="flex flex-col md:flex-row items-center gap-6 p-4 md:p-6"
              >
                {/* Image Section */}
                {featured.thumbnail && (
                  <div className="w-full md:w-80 h-48 rounded-2xl overflow-hidden bg-surface-muted shrink-0 relative">
                    <img
                      src={optimizeBloggerImage(featured.thumbnail, 600, 400)}
                      alt={featured.title}
                      loading="eager"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow">
                      <Sparkles className="h-3.5 w-3.5" />
                      أحدث مقال
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className="flex-1 min-w-0 space-y-3 py-2 text-right">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold flex-wrap">
                    {featured.labels[0] && (
                      <span className="rounded-md bg-accent px-2.5 py-1 text-primary">
                        {featured.labels[0]}
                      </span>
                    )}
                    <span>{formatDate(featured.published)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readingMinutes} دقائق
                    </span>
                  </div>

                  <h3 className="font-display text-xl md:text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                    {featured.title}
                  </h3>

                  <p className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed">
                    {featured.excerpt}
                  </p>

                  <div className="inline-flex items-center gap-2 text-sm font-bold text-primary pt-2">
                    <span>اقرأ المقال بالكامل</span>
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* AI TOOLS SHOWCASE — Grid of 6 High-Converting Cards */}
        <section className="container-page py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-extrabold text-primary mb-3">
                <BadgeCheck className="h-4 w-4" />
                جناح أدوات الذكاء الاصطناعي
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight">
                أدوات AI تفاعلية ومجانية تجعل عملك أسرع 10x
              </h2>
              <p className="mt-3 text-sm md:text-lg text-muted-foreground leading-relaxed">
                استفد فوراً من أحدث تقنيات توليد الصور، تلخيص المقالات، الترجمة الذكية، وإرشادات التعلم بدون تعقيد.
              </p>
            </div>
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground shadow-card transition-all hover:border-primary/40 hover:text-primary hover:shadow-elegant shrink-0"
            >
              <span>استعرض كل الأدوات</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TOOL_CARDS.map((t) => (
              <Link
                key={t.href}
                to={t.href}
                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 md:p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elegant hover:border-primary/40 flex flex-col justify-between"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${t.color}`} />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${t.color} text-primary shadow-soft`}>
                      <t.icon className="h-7 w-7" />
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {t.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className="relative mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-sm font-bold text-foreground group-hover:text-primary">
                  <span>{t.cta}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* INTERACTIVE AI QUIZ BANNER */}
        <section className="container-page py-6 md:py-10">
          <Link
            to="/quiz"
            className="block relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-purple-500/10 to-primary/10 p-8 md:p-12 shadow-elegant hover:scale-[1.01] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 border border-violet-500/30 px-3.5 py-1 text-xs font-extrabold text-violet-600 dark:text-violet-300">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  اختبار التوصية الذكي الذاتي
                </div>
                <h3 className="font-display text-2xl md:text-4xl font-black text-foreground leading-tight">
                  لا تعرف أي أداة ذكاء اصطناعي تناسب احتياجك؟
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  أجب عن 5 أسئلة سريعة وسيقوم النظام بتحديد الأداة والمسار التعليمي المناسب لك فوراً 100%!
                </p>
              </div>

              <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 text-base font-extrabold text-primary-foreground shadow-lg hover:opacity-90 shrink-0">
                <span>ابدأ الاختبار الآن</span>
                <ArrowLeft className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </section>

        {/* LATEST POSTS & LESSONS SECTION */}
        <section className="container-page py-12 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary mb-3">
                <Newspaper className="h-4 w-4" />
                المكتبة والدروس المقالية
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight">
                أحدث المقالات التقنية وشروحات الذكاء الاصطناعي
              </h2>
            </div>
            <Link
              to="/posts"
              className="inline-flex items-center gap-1.5 text-sm md:text-base font-bold text-primary hover:underline shrink-0"
            >
              <span>جميع المقالات</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {featured && (
            <div className="mb-8">
              <PostCard post={featured} featured priority />
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <PostCard key={p.id} post={p} priority={i === 0} />
            ))}
          </div>
        </section>

        {/* CATEGORIES CLOUD & TRUST STATS */}
        {labels.length > 0 && (
          <section className="container-page py-10 md:py-16">
            <div className="rounded-3xl bg-gradient-to-br from-card via-surface-muted to-card border border-border/80 p-8 md:p-14 text-center shadow-card">
              <h2 className="font-display text-2xl md:text-4xl font-black">استكشف حسب تصنيف الموضوع</h2>
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                اختر المجال التقني الذي تود تعلمه واقرأ جميع الدروس والحلول العملية المتعلقة به.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {labels.slice(0, 16).map((l) => (
                  <Link
                    key={l.label}
                    to="/posts"
                    search={{ label: l.label }}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs md:text-sm font-bold hover:border-primary hover:text-primary hover:scale-105 transition-all shadow-soft"
                  >
                    <span>{l.label}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                      {l.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TRUST STATS FOOTER BAR */}
        <section className="container-page pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border border-border/60 bg-card p-6 md:p-8 rounded-3xl shadow-card text-center">
            {[
              { n: `${data.total}+`, l: "مقال تقني منشور", icon: FileText },
              { n: "6+", l: "أدوات AI مجانية", icon: Wand2 },
              { n: "100%", l: "محتوى مجاني بالعربية", icon: BadgeCheck },
              { n: "يومي", l: "شروحات وتحديثات", icon: Layers },
            ].map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl md:text-3xl font-black gradient-text">{s.n}</div>
                <div className="text-xs md:text-sm text-muted-foreground font-semibold">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Minimal Today's Matches details card at the very bottom */}
        <section className="container-page pb-16">
          <div className="max-w-xl mx-auto rounded-2xl border border-border bg-card/40 p-4 shadow-soft">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none select-none">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <span>مباريات اليوم (رياضة)</span>
                </div>
                <span className="text-[10px] text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 pt-3 border-t border-border/40">
                <TodayMatchesRail variant="article" max={4} />
              </div>
            </details>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

