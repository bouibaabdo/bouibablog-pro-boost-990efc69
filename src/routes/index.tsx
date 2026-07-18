import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Trophy, Wand2, Lightbulb, Image as ImageIcon, Languages, FileText, Newspaper, Search } from "lucide-react";
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
    const title = "Bouiba Academy — أكاديميتك العربية للذكاء الاصطناعي | دروس وأدوات AI مجانية";
    const desc = "أكاديميتك العربية للذكاء الاصطناعي. نوفر دروساً عملية مجانية، أحدث الأخبار، وأدوات ذكاء اصطناعي تفاعلية مثل توليد الصور وتلخيص النصوص ومسارات التعلم.";
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
          ? [{ rel: "preload", as: "image", href: loaderData.lcp, fetchpriority: "high" } as unknown as { rel: string; href: string }]
          : []),
      ],
    };
  },
  component: HomePage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">تعذر تحميل المحتوى: {error.message}</div>
  ),
});

const TOOL_CARDS = [
  { href: "/tools/image", title: "توليد الصور", desc: "صور احترافية من نص عربي", icon: ImageIcon, color: "from-primary/10 to-primary-glow/10" },
  { href: "/tools/summarize", title: "تلخيص النصوص", desc: "من مقال طويل إلى نقاط", icon: FileText, color: "from-primary/10 to-primary-glow/10" },
  { href: "/tools/translate", title: "المترجم الذكي", desc: "ترجمة دقيقة سياقية", icon: Languages, color: "from-primary/10 to-primary-glow/10" },
  { href: "/tools/ideas", title: "مولّد الأفكار", desc: "أفكار محتوى ومشاريع", icon: Lightbulb, color: "from-primary/10 to-primary-glow/10" },
] as const;

function HomePage() {
  const { data } = useSuspenseQuery(postsQueryOptions);
  const { data: labels } = useSuspenseQuery(labelsQueryOptions);
  const posts = data.posts;
  const featured = posts[0];
  const rest = posts.slice(1, 7);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* HERO — compact on mobile */}
        <section className="relative hero-bg overflow-hidden border-b border-border/30">
          <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />
          <div className="container-page relative py-12 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 backdrop-blur px-3 py-1 text-[11px] md:text-xs font-semibold text-muted-foreground mb-4 shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              أكاديميتك العربية للذكاء الاصطناعي
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              تعلّم <span className="gradient-text">الذكاء الاصطناعي</span>
              <br className="hidden sm:block" />
              <span className="sm:inline"> بالعربية، بطريقة احترافية</span>
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-sm md:text-lg text-muted-foreground leading-relaxed">
              أدوات AI جاهزة، اختبار توصية ذكي، ونقل مباشر لمباريات كأس العالم 2026 — كل شيء في مكان واحد.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/tools"
                className="btn-premium px-6 py-3 rounded-xl shadow-elegant"
              >
                <Wand2 className="h-4 w-4" /> أدوات AI
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/20 px-6 py-3 text-sm font-semibold hover:bg-violet-600/15 dark:hover:bg-violet-500/25 transition-all shadow-soft"
              >
                <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-300" /> اختبار AI
              </Link>
              <Link
                to="/worldcup"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-secondary hover:bg-accent/80 text-secondary-foreground border border-border px-6 py-3 text-sm font-semibold transition-all shadow-soft"
              >
                <Trophy className="h-4 w-4 text-amber-500" /> كأس العالم 2026
              </Link>
            </div>
          </div>
        </section>

        {/* WORLD CUP MATCHES RAIL — top priority on mobile */}
        <TodayMatchesRail variant="home" max={12} />

        {/* AI TOOLS GRID */}
        <section className="container-page py-8 md:py-12">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">أدوات الذكاء الاصطناعي</h2>
              <p className="mt-1 text-sm text-muted-foreground">جرّب أقوى الأدوات مباشرة داخل الموقع</p>
            </div>
            <Link to="/tools" className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline shrink-0">
              كل الأدوات <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {TOOL_CARDS.map((t) => (
              <Link
                key={t.href}
                to={t.href}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-5 shadow-card transition-all duration-300 hover:shadow-elegant hover:border-primary/20 hover:-translate-y-1"
              >
                <div className={`inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} text-primary mb-3 shadow-soft group-hover:scale-105 transition-transform duration-300`}>
                  <t.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors">{t.title}</h3>
                <p className="text-[11px] md:text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* QUIZ CTA */}
        <section className="container-page py-6 md:py-8">
          <Link
            to="/quiz"
            className="block relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-primary-glow/5 to-transparent p-6 md:p-10 shadow-card hover:shadow-elegant hover:border-primary/20 transition-all duration-300"
          >
            <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-white shadow-lg">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-block text-[10px] font-bold text-violet-600 bg-violet-500/10 px-2.5 py-0.5 rounded-full mb-2">جديد ✨</div>
                <h3 className="font-display text-xl md:text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors">أي أداة AI مناسبة لك؟</h3>
                <p className="mt-1 text-sm text-muted-foreground">6 أسئلة سريعة — نوصي لك بالأداة الأنسب من بين 8 أدوات كبرى.</p>
              </div>
              <div className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-bold shrink-0">
                ابدأ الاختبار <ArrowLeft className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </section>

        {/* LATEST POSTS */}
        <section className="container-page py-8 md:py-12">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-primary" />
                أحدث المقالات
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">اقرأ آخر ما نشرناه في عالم الـ AI</p>
            </div>
            <Link to="/posts" className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline shrink-0">
              عرض الكل <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {featured && (
            <div className="mb-5 md:mb-6">
              <PostCard post={featured} featured />
            </div>
          )}

          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        {labels.length > 0 && (
          <section className="container-page py-10 md:py-16">
            <div className="rounded-3xl bg-gradient-to-br from-accent/60 to-surface-muted border border-border p-6 md:p-12 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold">تصفّح حسب التصنيف</h2>
              <p className="mt-2 text-sm text-muted-foreground">اختر مجال اهتمامك وابدأ رحلتك</p>
              <div className="mt-5 md:mt-6 flex flex-wrap justify-center gap-2">
                {labels.slice(0, 14).map((l) => (
                  <Link
                    key={l.label}
                    to="/posts"
                    search={{ label: l.label }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium hover:border-primary hover:text-primary transition-colors shadow-card"
                  >
                    {l.label}
                    <span className="text-[10px] text-muted-foreground">({l.count})</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Stats footer */}
        <section className="container-page pb-12">
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {[
              { n: `${data.total}+`, l: "مقال" },
              { n: `${labels.length}`, l: "تصنيف" },
              { n: "يومي", l: "تحديث" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold gradient-text">{s.n}</div>
                <div className="text-[11px] md:text-sm text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
